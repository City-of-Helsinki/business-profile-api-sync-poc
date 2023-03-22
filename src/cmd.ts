import 'source-map-support/register';
import * as dotenv from 'dotenv';
dotenv.config();

import parseArgs from 'minimist';

import logger from './logger';
import { exit } from 'process';
import handleLocation from './app/handleLocation';
import {
  acceptInvitation,
  listAccounts,
  listCategories,
  listInvitations
} from './services/businessProfile';

const args = parseArgs(process.argv.slice(2));
const action = args._[0];

switch (action) {
  case 'location':
    const id = args._[1];
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

  case 'invitations':
    const serviceAccountId = args._[1];

    if (!serviceAccountId) {
      logger.error('Service account id undefined');
      exit(1);
    }

    listInvitations(serviceAccountId).then((invitations) =>
      console.log(JSON.stringify(invitations, null, 2))
    );

    break;

  case 'accept':
    const invitation = args._[1];

    if (!invitation) {
      logger.error('Invitation id undefined');
      exit(1);
    }

    acceptInvitation(invitation).then((invitations) =>
      console.log(JSON.stringify(invitations, null, 2))
    );

    break;

  case 'categories':
    listCategories().then((categories) =>
      console.log(JSON.stringify(categories, null, 2))
    );
    break;

  default:
    logger.info('No command defined');
}
