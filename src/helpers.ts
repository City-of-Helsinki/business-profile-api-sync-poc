import { HaukiOpeningHours, TimeElement, TPRLocation } from './types';
import { mybusinessbusinessinformation_v1 } from 'googleapis';

type CLOSED_STATE =
  | 'CLOSED'
  | 'UNDEFINED'
  | 'EXIT_ONLY'
  | 'NOT_IN_USE'
  | 'MAINTENANCE'
  | 'NO_OPENING_HOURS';

const closedStates: CLOSED_STATE[] = [
  'CLOSED',
  'UNDEFINED',
  'EXIT_ONLY',
  'NOT_IN_USE',
  'MAINTENANCE',
  'NO_OPENING_HOURS'
];

export const isClosed = (state: any) =>
  closedStates.includes(state.toUpperCase());

export const toGoogleLocation = (
  location: TPRLocation
): mybusinessbusinessinformation_v1.Schema$Location => ({
  storeCode: `${location.id}`,
  title: location.name_fi,
  profile: { description: '' },
  languageCode: 'FI',
  categories: {
    primaryCategory: {
      name: 'categories/gcid:local_government_office' // TODO: This needs to be resolved
    }
  },
  storefrontAddress: {
    regionCode: 'FI',
    addressLines: location.street_address_fi.split(','),
    postalCode: location.address_zip,
    locality: location.address_city_fi
  }
});

const weekdays = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
];

const toTimeOfDay = (
  time: string
): mybusinessbusinessinformation_v1.Schema$TimeOfDay => {
  const [hours, minutes, seconds] = time.split(':').map((elem) => +elem);

  return {
    hours,
    minutes,
    seconds
  };
};

const timeOfDaysEqual = (
  day1: mybusinessbusinessinformation_v1.Schema$TimeOfDay,
  day2: mybusinessbusinessinformation_v1.Schema$TimeOfDay
): boolean =>
  day1.hours === day2.hours &&
  day1.minutes === day2.minutes &&
  day1.seconds === day2.seconds &&
  day1.nanos === day2.nanos;

export const toGoogleRegularOpeningHours = (
  openingHours: HaukiOpeningHours[]
): mybusinessbusinessinformation_v1.Schema$TimePeriod[] =>
  openingHours
    .reduce(
      (
        acc: mybusinessbusinessinformation_v1.Schema$TimePeriod[][],
        elem: HaukiOpeningHours,
        day: number
      ) => [
        ...acc,
        elem.times.reduce(
          (
            timeAcc: mybusinessbusinessinformation_v1.Schema$TimePeriod[],
            time: TimeElement
          ): mybusinessbusinessinformation_v1.Schema$TimePeriod[] => {
            if (isClosed(time.resource_state)) {
              return timeAcc;
            }

            const curr = timeAcc.length - 1;
            if (
              timeAcc[curr] &&
              timeAcc[curr].closeTime &&
              timeOfDaysEqual(
                timeAcc[curr].closeTime!,
                toTimeOfDay(time.start_time)
              )
            ) {
              timeAcc[curr] = {
                ...timeAcc[curr],
                closeTime: toTimeOfDay(time.end_time)
              };

              return timeAcc;
            }

            const weekday = weekdays[day];

            return [
              ...timeAcc,
              {
                openDay: weekday,
                closeDay: weekday,
                openTime: toTimeOfDay(time.start_time),
                closeTime: toTimeOfDay(time.end_time)
              }
            ];
          },
          []
        )
      ],
      []
    )
    .flat();
