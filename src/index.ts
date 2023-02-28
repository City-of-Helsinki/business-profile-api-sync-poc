import 'source-map-support/register';
import * as dotenv from 'dotenv';
dotenv.config();

import parseArgs from 'minimist';

import { handleLocation, listAccounts } from './app';
import logger from './logger';
import { exit } from 'process';

const args = parseArgs(process.argv.slice(2));
const action = args._[0];
const id = args._[1];

switch (action) {
  case 'location':
    if (!id) {
      logger.error('Id undefined');
      exit(1);
    }

    handleLocation(+id)
      .then((location) =>
        logger.info('Handle location successful', { location })
      )
      .catch((error) => logger.error(error));

    break;

  case 'accounts':
    listAccounts().then((accounts) =>
      console.log(JSON.stringify(accounts, null, 2))
    );
    break;

  default:
    logger.info('No command defined');
}
