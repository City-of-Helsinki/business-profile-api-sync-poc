'use strict';
// const fetch = require("node-fetch");
// const doFetchPage = async (url, accumulator) => {
//   const result = await fetch(url);
//   const data = await result.json();
//   console.log("Fetching", data.next, "...");
//   await accumulator(data.results);
//   if (data.next) {
//     await doFetchPage(data.next, accumulator);
//   }
// };
// doFetchPage(
//   "https://hauki-api.test.hel.ninja/v1/opening_hours/?start_date=+0w&end_date=+0w&page_size=1000",
//   async (currData) => {
//     currData.forEach(async ({ resource }) => {
//       await new Promise((resolve) =>
//         setTimeout(() => {
//           console.log("Parsing", resource.name.fi);
//           resolve();
//         }, 1000)
//       );
//     });
//   }
// ).then(console.log);
// import { google } from 'googleapis';
// const auth = new google.auth.GoogleAuth({
//   keyFile: './testivienti-027dcb03e3a5.json',
//   scopes: ['https://www.googleapis.com/auth/business.manage']
// });
// const mybusinessbusinessinformation = google.mybusinessbusinessinformation({
//   auth,
//   version: 'v1'
// });
// const googleBusinessProfileApi = {
//   createLocation: () =>
//     mybusinessbusinessinformation.accounts.locations.create({
//       parent: 'accounts/105577616079901319088', // Location group
//       validateOnly: true,
//       requestId: new Date().getTime(),
//       requestBody: {
//         title: 'Mediatuotanto Pirkka Huhtala',
//         profile: { description: '' },
//         languageCode: 'FI',
//         categories: {
//           primaryCategory: {
//             name: 'categories/gcid:library'
//           }
//         },
//         storefrontAddress: {
//           regionCode: 'FI',
//           addressLines: ['Vanha Valtatie 92'],
//           postalCode: '04460',
//           locality: 'Järvenpää'
//         }
//       }
//     }),
//   listAccounts: () =>
//     google.mybusinessaccountmanagement({ auth, version: 'v1' }).accounts.list(),
//   listLocations: () =>
//     mybusinessbusinessinformation.accounts.locations.list({
//       parent: 'accounts/110258901511739319599',
//       readMask: 'name'
//     }),
//   searchLocation: () =>
//     mybusinessbusinessinformation.googleLocations.search({
//       requestBody: {
//         location: {
//           title: 'S-market Kauhava'
//         }
//       }
//     }),
//   getCategories: () =>
//     mybusinessbusinessinformation.categories.list({
//       language_code: 'FI',
//       regionCode: 'FI',
//       view: 'BASIC',
//       filter: 'displayName=kirjasto'
//     }),
//   deleteLocation: () =>
//     mybusinessbusinessinformation.locations.delete({ name: '' }),
//   updateLocation: () =>
//     mybusinessbusinessinformation.locations.patch({
//       locationId: '',
//       requestBody: {
//         regularHours: {
//           periods: [
//             {
//               openDay: 'MONDAY',
//               closeDay: 'FRIDAY',
//               openTime: '08:00',
//               closeTime: '16:00'
//             }
//           ]
//         }
//       },
//       updateMask: '',
//       validateOnly: true
//     }),
//   createAccount: () =>
//     google
//       .mybusinessaccountmanagement({ auth, version: 'v1' })
//       .accounts.create({
//         requestBody: {
//           accountName: 'Testiryhmä',
//           type: 'LOCATION_GROUP',
//           primaryOwner: 'accounts/110258901511739319599'
//         }
//       }),
//   listInvitations: () =>
//     google
//       .mybusinessaccountmanagement({ auth, version: 'v1' })
//       .accounts.invitations.list({ parent: 'accounts/110258901511739319599' }),
//   acceptIntivation: () =>
//     google
//       .mybusinessaccountmanagement({ auth, version: 'v1' })
//       .accounts.invitations.accept({
//         name: 'accounts/110258901511739319599/invitations/L118137883165644644453'
//       }),
//   getLocation: () =>
//     mybusinessbusinessinformation.locations.get({
//       name: 'locations/1552457563421238221',
//       readMask: 'storefrontAddress,title'
//     })
// };
// googleBusinessProfileApi
//   .getLocation()
//   .then((results: any) => {
//     console.log(JSON.stringify(results.data, null, 2));
//   })
//   .catch((e: any) =>
//     console.error(e, JSON.stringify(e.response.data, null, 2))
//   );

import { mybusinessbusinessinformation_v1 } from 'googleapis';

export type TPRLocation = {
  id: string;
  name_fi: string;
  street_address_fi: string;
  address_zip: string;
  address_city_fi: string;
  // koordinaatit,
};

export enum ResourceState {
  OPEN = 'open',
  SELF_SERVICE = 'self_service',
  CLOSED = 'closed',
  OTHER = 'other',
  UNDEFINED = 'undefined',
  MAINTENANCE = 'maintenance',
  NOT_IN_USE = 'not_in_use',
  NO_OPENING_HOURS = 'no_opening_hours',
  WITH_KEY = 'with_key',
  WITH_RESERVATION = 'with_reservation',
  OPEN_AND_RESERVABLE = 'open_and_reservable',
  WITH_KEY_AND_RESERVATION = 'with_key_and_reservation',
  ENTER_ONLY = 'enter_only',
  EXIT_ONLY = 'exit_only',
  WEATHER_PERMITTING = 'weather_permitting',
  RESERVED = 'reserved',
  BY_APPOINTMENT = 'by_appointment'
}

export type TimeElement = {
  start_time: string;
  end_time: string;
  resource_state: ResourceState;
};

export type HaukiOpeningHours = {
  date: string;
  times: TimeElement[];
};

export type ExistingLocation =
  mybusinessbusinessinformation_v1.Schema$Location & { name: string };

/*
  Workflow name
  trigger:
  inputs:
    - dependencies
  steps:
  outputs:
  side effects:
*/

// Inputs
type LocationId = string;

// Outputs

/*

  steps:
    1. Find location
    2. Check if the location is claimed
    3. Create location
    4. Verify location
*/

// Success
type LocationUpdated = { id: number };

type LocationCreated = { id: number };

// Error
export class LocationClaimedError extends Error {
  location: mybusinessbusinessinformation_v1.Schema$GoogleLocation;
  constructor(
    location: mybusinessbusinessinformation_v1.Schema$GoogleLocation
  ) {
    super('Location claimed');
    this.name = 'LocationClaimed';
    this.location = location;
  }
}

export class DuplicateLocationsFoundError extends Error {
  locations: mybusinessbusinessinformation_v1.Schema$Location[];
  constructor(locations: mybusinessbusinessinformation_v1.Schema$Location[]) {
    super('Duplicate locations found');
    this.locations = locations;
  }
}

export class VerificationFailedError extends Error {
  location: mybusinessbusinessinformation_v1.Schema$Location;
  constructor(location: mybusinessbusinessinformation_v1.Schema$Location) {
    super('Cannot automatically verify location');
    this.location = location;
  }
}

// domain workflow
// type GoogleLocation = {};
// export type UpdateOpeningHours = (
//   id: number
// ) => Promise<LocationCreated | LocationUpdated>;

// export type UpdateLocation = (
//   location: HaukiResource,
//   googleLocation: GoogleLocation
// ) => GoogleLocation;

// type Result<Success, Failure> = Success | Failure;

export const listInvitations = () =>
  google
    .mybusinessaccountmanagement({ auth, version: 'v1' })
    .accounts.invitations.list({ parent: TEST_ACCOUNT_ID })
    .then((result) => result.data.invitations);

export const listLocations = () =>
  mybusinessbusinessinformation.accounts.locations
    .list({
      parent: TEST_USER_GROUP_ID,
      readMask: 'name'
    })
    .then((result) => result.data.locations);

export const listAdmins = () =>
  google
    .mybusinessaccountmanagement({ auth, version: 'v1' })
    .locations.admins.list({ parent: 'locations/1552457563421238221' })
    .then((result) => result.data.admins);

export const acceptInvitation = () =>
  google
    .mybusinessaccountmanagement({ auth, version: 'v1' })
    .accounts.invitations.accept({
      name: 'accounts/117821878235480689304/invitations/A110597579464583376319'
    });

export const listAccounts = () =>
  google
    .mybusinessaccountmanagement({ auth, version: 'v1' })
    .accounts.list()
    .then((result) => result.data.accounts);

export const findLocation = async (
  predicate: (
    location: mybusinessbusinessinformation_v1.Schema$Location | undefined
  ) => boolean,
  pageToken: string | undefined
): Promise<mybusinessbusinessinformation_v1.Schema$Location | undefined> => {
  const response = await mybusinessbusinessinformation.accounts.locations.list({
    parent: TEST_LOCATION_GROUP_ID,
    pageToken,
    pageSize: 100
  });

  const location = response.data.locations?.find(predicate);

  if (location) {
    return location;
  }

  const nextPageToken = response.data.nextPageToken;
  if (nextPageToken) {
    return await findLocation(predicate, nextPageToken);
  }

  return undefined;
};

export const listCategories = () =>
  mybusinessbusinessinformation.categories
    .list({
      languageCode: 'FI',
      regionCode: 'FI',
      view: 'FULL'
    })
    .then((result) => result.data.categories);

const TEST_USER_GROUP_ID = 'accounts/110597579464583376319';
