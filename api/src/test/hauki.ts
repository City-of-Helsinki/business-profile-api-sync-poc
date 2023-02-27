import axios from 'axios';
import { ResourceOpeningHours } from '../types';

/**
 * This is for simulating purposes. No need to have HTTP
 * connection to Hauki API since we can solely rely on the event data.
 */
export const getOpeningHours = (
  id: string | number
): Promise<ResourceOpeningHours> =>
  axios
    .get<{ results: ResourceOpeningHours[] }>(
      `https://hauki.api.hel.fi/v1/opening_hours/?start_date=+0w&end_date=+0w&resource=${id}`
    )
    .then((response) => response.data.results[0]);
