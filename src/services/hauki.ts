import axios from 'axios';
import { HaukiResource, HaukiOpeningHours } from '../types';

export const getResource = (id: number): Promise<HaukiResource> =>
  axios
    .get<HaukiResource>(`https://hauki.api.hel.fi/v1/resource/${id}/`)
    .then((result) => result.data);

export const getOpeningHours = (id: string): Promise<HaukiOpeningHours[]> =>
  axios
    .get<HaukiOpeningHours[]>(
      `https://hauki.api.hel.fi/v1/resource/${id}/opening_hours/?start_date=+0w&end_date=+0w`
    )
    .then((result) => result.data);
