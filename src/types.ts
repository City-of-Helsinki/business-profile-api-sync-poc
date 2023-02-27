import { mybusinessbusinessinformation_v1 } from 'googleapis';

export type TPRLocation = {
  id: string;
  name_fi: string;
  street_address_fi: string;
  address_zip: string;
  address_city_fi: string;
  // TODO: Coordinates
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
