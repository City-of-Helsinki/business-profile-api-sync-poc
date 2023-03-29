import axios from 'axios';
import logger from '../infra/logger';
import { TPRLocation } from '../types';

export const findLocation = (id: number): Promise<TPRLocation> => {
  const url = `https://www.hel.fi/palvelukarttaws/rest/v4/unit/${id}?official=yes&format=json&newfeatures=yes`;
  logger.info(url);

  return axios.get(url).then((result) => ({
    address_city_fi: result.data.address_city_fi,
    address_zip: result.data.address_zip,
    id: `tprek:${result.data.id}`,
    name_fi: result.data.name_fi,
    street_address_fi: result.data.street_address_fi
  }));
};
