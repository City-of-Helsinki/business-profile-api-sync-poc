import axios from 'axios';
import { HaukiOpeningHours } from '../types';

export const getOpeningHours = (id: string): Promise<HaukiOpeningHours[]> =>
  axios
    .get<HaukiOpeningHours[]>(
      `https://hauki.api.hel.fi/v1/resource/${id}/opening_hours/?start_date=+0w&end_date=+0w`
    )
    .then((result) => result.data);
