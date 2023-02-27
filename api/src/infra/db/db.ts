import knex from 'knex';
import config from './knexfile';

export const createDatabaseConnectionPool = () => knex(config.development);
