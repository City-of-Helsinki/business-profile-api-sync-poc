import { google, mybusinessbusinessinformation_v1 } from 'googleapis';
import logger from '../logger';
import { ExistingLocation } from '../types';

const LOCATION_GROUP_ID = process.env.LOCATION_GROUP_ID;

const auth = new google.auth.GoogleAuth({
  keyFile: `./keys/${process.env.KEY_FILE}`,
  scopes: ['https://www.googleapis.com/auth/business.manage']
});

const validateOnly = process.env.DRY_RUN === 'true';

const mybusinessbusinessinformation = google.mybusinessbusinessinformation({
  auth,
  version: 'v1'
});

const mybusinessverifications = google.mybusinessverifications({
  auth,
  version: 'v1'
});

const mybusinessaccountmanagement = google.mybusinessaccountmanagement({
  auth,
  version: 'v1'
});

export const findByLocationTitleAndAddress = (
  location: mybusinessbusinessinformation_v1.Schema$Location
) => {
  const requestBody = {
    location: {
      title: location.title,
      storefrontAddress: {
        addressLines: location.storefrontAddress?.addressLines,
        locality: location.storefrontAddress?.locality,
        postalCode: location.storefrontAddress?.postalCode
      }
    }
  };

  return mybusinessbusinessinformation.googleLocations
    .search({
      requestBody
    })
    .then(({ data }) => data.googleLocations);
};

export const createLocation = (
  location: mybusinessbusinessinformation_v1.Schema$Location
) =>
  mybusinessbusinessinformation.accounts.locations
    .create({
      parent: LOCATION_GROUP_ID,
      requestBody: location,
      requestId: `${new Date().getTime()}`,
      validateOnly
    })
    .then((result) => result.data);

export const fetchVerificationOptions = (location: string) =>
  mybusinessverifications.locations
    .fetchVerificationOptions({
      location,
      requestBody: { languageCode: 'FI' }
    })
    .then((result) => result.data.options)
    .then((options) => {
      logger.info('Verification options', { options });
      return options;
    });

export const verifyLocation = (location: string) =>
  mybusinessverifications.locations
    .verify({ name: location, requestBody: { method: 'AUTO' } })
    .then((result) => result.data.verification);

export const findLocationByStoreCode = (storeCode: string) =>
  mybusinessbusinessinformation.accounts.locations
    .list({
      filter: `storeCode="${storeCode}"`,
      parent: LOCATION_GROUP_ID,
      readMask: 'name'
    })
    .then((result) => result.data.locations);

export const updateLocation = (
  location: ExistingLocation,
  updateMask: string
) =>
  mybusinessbusinessinformation.locations
    .patch({
      name: location.name,
      requestBody: location,
      updateMask
    })
    .then((result) => result.data);

export const listAccounts = () =>
  mybusinessaccountmanagement.accounts
    .list()
    .then((response) => response.data.accounts);

export const listInvitations = (parent: string) =>
  mybusinessaccountmanagement.accounts.invitations
    .list({ parent })
    .then((response) => response.data.invitations);

export const acceptInvitation = (name: string) =>
  mybusinessaccountmanagement.accounts.invitations.accept({ name });

export const listCategories = () =>
  mybusinessbusinessinformation.categories
    .list({ regionCode: 'FI', languageCode: 'FI', view: 'BASIC' })
    .then((response) => response.data.categories);
