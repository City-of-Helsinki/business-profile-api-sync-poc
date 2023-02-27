import * as dotenv from 'dotenv';
import 'source-map-support/register';
import parseArgs from 'minimist';

dotenv.config();

import { handleLocation } from './app';
import logger from './logger';
import { exit } from 'process';

const args = parseArgs(process.argv.slice(2));
const id = args._[0];

if (!id) {
  logger.error('Id undefined');
  exit(1);
}

handleLocation(+id)
  .then((location) => logger.info('Handle location successful', { location }))
  .catch((error) => logger.error(error));
