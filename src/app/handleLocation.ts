import * as tpr from '../services/tpr';
import * as hauki from '../services/hauki';
import * as businessProfile from '../services/businessProfile';
import {
  DuplicateLocationsFoundError,
  ExistingLocation,
  LocationClaimedError,
  TPRLocation,
  VerificationFailedError
} from '../types';
import { toGoogleLocation, toGoogleRegularOpeningHours } from '../helpers';
import logger from '../logger';
import { mybusinessbusinessinformation_v1 } from 'googleapis';

const findByLocationTitleAndAddress = async (location: TPRLocation) => {
  const existingLocations = await businessProfile.findByLocationTitleAndAddress(
    toGoogleLocation(location)
  );

  const existingLocationsCount = existingLocations?.length ?? 0;

  if (existingLocations && existingLocationsCount > 0) {
    if (existingLocationsCount > 1) {
      logger.info('Found duplicates for location.');
      throw new DuplicateLocationsFoundError(existingLocations);
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
  logger.info('Trying to find location with title and address.');

  let googleLocation = await findByLocationTitleAndAddress(location);

  if (googleLocation && googleLocation.location) {
    logger.info('Checking location status.');

    if (googleLocation.requestAdminRightsUri) {
      throw new LocationClaimedError(googleLocation);
    }

    logger.info('Location is unclaimed.');

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

  logger.info(
    'Location not found. Converting TPREK location to Google equivalent.'
  );
  return toGoogleLocation(location);
};

const updateOpeningHours = <
  T extends mybusinessbusinessinformation_v1.Schema$Location
>(
  openingHours: mybusinessbusinessinformation_v1.Schema$TimePeriod[],
  existingLocation: T
) => ({
  ...existingLocation,
  regularHours: {
    periods: openingHours
  }
});

const createLocation = async (
  openingHours: mybusinessbusinessinformation_v1.Schema$TimePeriod[],
  location: mybusinessbusinessinformation_v1.Schema$Location
) => {
  const newGoogleLocation = await businessProfile.createLocation(
    updateOpeningHours(openingHours, location)
  );

  return newGoogleLocation as ExistingLocation;
};

const verifyLocation = async (location: ExistingLocation) => {
  const options = await businessProfile.fetchVerificationOptions(location.name);

  if (
    !options ||
    !options.some((option) => option.verificationMethod === 'AUTO')
  ) {
    logger.error('Cannot verify location automatically.');
    throw new VerificationFailedError(location);
  }

  businessProfile.verifyLocation(location.name);
};

const updateLocation = (
  openingHours: mybusinessbusinessinformation_v1.Schema$TimePeriod[],
  existingLocation: ExistingLocation
): any => {
  logger.info('Updating opening hours');
  const result = businessProfile.updateLocation(
    updateOpeningHours(openingHours, existingLocation),
    'regularHours'
  );
  logger.info('Updating opening hours successful');

  return result;
};

const handleLocation = async (haukiId: number) => {
  logger.info(`Fetching location from Hauki with id "${haukiId}"`);
  const resource = await hauki.getResource(haukiId);
  const tprId = resource.origins.find(
    (origin) => origin.data_source.id === 'tprek'
  )?.origin_id;

  if (!tprId) {
    throw new Error('Not TPR originated resource');
  }

  logger.info(`Fetching location from TPR with id "${tprId}"`);
  const location = await tpr.findLocation(tprId);
  logger.info(`Fetching opening hours from Hauki API with id "${location.id}"`);
  const openingHours = await hauki
    .getOpeningHours(location.id)
    .then(toGoogleRegularOpeningHours);

  logger.info('Fetch location by store code "%s"', location.id);
  const existingLocations = await businessProfile.findLocationByStoreCode(
    location.id
  );

  if (existingLocations) {
    logger.info('Location found by store code "%s"', tprId);
    return updateLocation(
      openingHours,
      existingLocations[0] as ExistingLocation
    );
  } else {
    logger.info('Location not found with the store code.');
    let resolvedLocation = await resolveLocation(location);

    logger.info('Creating location to Google.');
    const newGoogleLocation = await createLocation(
      openingHours,
      resolvedLocation
    );
    logger.info('Location created successfully');

    if (process.env.DRY_RUN === 'true') {
      logger.info('Skipping verification since DRY_RUN=true');
    } else {
      logger.info('Verifying location');
      await verifyLocation(newGoogleLocation);
      logger.info('Location verified successfully');
    }

    return newGoogleLocation;
  }
};

export default handleLocation;
