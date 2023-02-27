import * as tpr from '../services/tpr';
import * as businessProfile from '../services/businessProfile';
import {
  MultipleLocationsFoundError,
  NewGoogleLocation,
  DbEvent,
  OpeningHours,
  LocationClaimedError,
  TPRLocation,
  AutoVerificationNotSupportedError,
  ResourceOpeningHours,
  DbLocation
} from '../types';
import {
  toGoogleLocation,
  toGoogleRegularOpeningHours as toRegularOpeningHours
} from './helpers';
import logger from '../infra/logger';
import { mybusinessbusinessinformation_v1 } from 'googleapis';
import { Knex } from 'knex';

const findByLocationTitleAndAddress = async (location: TPRLocation) => {
  const existingLocations = await businessProfile.findByLocationTitleAndAddress(
    toGoogleLocation(location)
  );

  const existingLocationsCount = existingLocations?.length ?? 0;

  if (existingLocations && existingLocationsCount > 0) {
    if (existingLocationsCount > 1) {
      logger.info('Found duplicates for location.');
      throw new MultipleLocationsFoundError(existingLocations);
    }

    const existingLocation = existingLocations[0];

    if (
      existingLocation.location?.title
        ?.toLowerCase()
        .includes(location.name_fi.toLowerCase())
    ) {
      logger.info('Location found.');
      return existingLocation;
    }
    logger.info('Found one location but the title does not match', {
      location: existingLocation
    });
  }

  return undefined;
};

const resolveLocation = async (
  location: TPRLocation
): Promise<mybusinessbusinessinformation_v1.Schema$Location> => {
  let googleLocation = await findByLocationTitleAndAddress(location);

  if (googleLocation && googleLocation.location) {
    logger.info('Check location status');

    if (googleLocation.requestAdminRightsUri) {
      throw new LocationClaimedError(googleLocation);
    }

    logger.info('Location is unclaimed');

    return {
      ...googleLocation.location,
      storeCode: location.id,
      languageCode: 'FI',
      categories: {
        primaryCategory: {
          name: 'categories/gcid:library' // TODO: This needs to be resolved
        }
      }
    };
  }

  logger.info('Location not found. Creating new one from TPR location.');

  return toGoogleLocation(location);
};

const createLocation = async (
  openingHours: OpeningHours[],
  tprLocation: TPRLocation
) => {
  let location = await resolveLocation(tprLocation);

  return {
    ...location,
    regularHours: {
      periods: toRegularOpeningHours(openingHours)
    }
  } as NewGoogleLocation;
};

const verifyLocation = async (location: NewGoogleLocation) => {
  const options = await businessProfile.fetchVerificationOptions(location.name);

  if (
    !options ||
    !options.some((option) => option.verificationMethod === 'AUTO')
  ) {
    logger.error('Cannot verify location automatically.');
    throw new AutoVerificationNotSupportedError(location);
  }

  businessProfile.verifyLocation(location.name);
};

const toLocation = (tprLocation: TPRLocation): DbLocation => ({
  id: tprLocation.id,
  name: tprLocation.name_fi,
  address: `${tprLocation.street_address_fi} ${tprLocation.address_zip} ${tprLocation.address_city_fi}`
});

const insertLocation = (db: Knex, location: DbLocation): Promise<DbLocation> =>
  db('locations')
    .returning('id')
    .insert<{ id: string }[]>(location)
    .then((result) => ({
      ...location,
      id: result[0].id
    }));

const insertEvent = (db: Knex, event: Omit<DbEvent, 'id'>) =>
  db('events').insert({
    location_id: event.locationId,
    name: event.name
  });

const findLocationById = (db: Knex, tprId: string) =>
  db('locations').where('id', tprId).first().select<DbLocation>('*');

const handleOpeningHoursUpdated = async (
  db: Knex,
  { opening_hours, resource }: ResourceOpeningHours
) => {
  const tprId = resource.origins.find(
    (origin) => origin.data_source.id === 'tprek'
  )?.origin_id;

  if (!tprId) {
    throw new Error('Not TPR originated resource');
  }

  logger.info(`Fetching location from TPR with id "${tprId}"`);
  const tprLocation = await tpr.findLocation(tprId);
  let location = await findLocationById(db, tprLocation.id);

  if (!location) {
    location = await insertLocation(db, toLocation(tprLocation));
  }

  logger.info('Fetch Google location by store code "%s"', location.id);
  const googleLocationId = await businessProfile.findLocationIdByStoreCode(
    location.id
  );

  if (googleLocationId) {
    logger.info('Location found by store code "%s"', location.id);
    logger.info('Update opening hours');

    const regularOpeningHours = toRegularOpeningHours(opening_hours);

    await businessProfile.updateOpeningHours(
      googleLocationId,
      regularOpeningHours
    );

    await insertEvent(db, {
      locationId: location.id,
      name: 'OPENING_HOURS_UPDATED'
    });

    logger.info('Updating opening hours successful');
  } else {
    try {
      logger.info(
        'Google location not found with the store code. Creating location to Google'
      );

      const googleLocation = await createLocation(opening_hours, tprLocation);

      await businessProfile.addLocation(googleLocation);

      await insertEvent(db, {
        locationId: location.id,
        name: 'LOCATION_CREATED'
      });

      logger.info('Location created successfully');

      if (process.env.DRY_RUN === 'true') {
        logger.info('Skipping verification since DRY_RUN=true');
      } else {
        logger.info('Verifying location');
        await verifyLocation(googleLocation);
        logger.info('Location verified successfully');
      }
    } catch (e) {
      if (e instanceof AutoVerificationNotSupportedError) {
        await insertEvent(db, {
          locationId: location.id,
          name: 'AUTO_VERIFICATION_UNSUPPORTED'
        });
      }
      if (e instanceof LocationClaimedError) {
        await insertEvent(db, {
          locationId: location.id,
          name: 'LOCATION_CLAIMED'
        });
      }
      if (e instanceof MultipleLocationsFoundError) {
        await insertEvent(db, {
          locationId: location.id,
          name: 'MULTIPLE_LOCATIONS_FOUND'
        });
      }
    }
  }
};

export default handleOpeningHoursUpdated;
