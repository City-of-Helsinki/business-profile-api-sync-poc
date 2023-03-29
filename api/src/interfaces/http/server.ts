import 'source-map-support/register';
import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import routes from './routes';
import { createDatabaseConnectionPool } from '../../infra/db/db';
import accessLog from './middleware/accessLog';

const start = async () => {
  const pool = createDatabaseConnectionPool();
  const app = express();

  app.use(accessLog);
  app.use(routes(pool));

  app.listen(8989, () => {
    console.log(`Example app listening on port ${8989}`);
  });
};

start();
