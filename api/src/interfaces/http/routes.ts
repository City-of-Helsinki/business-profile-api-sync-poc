import { Router } from 'express';
import { Knex } from 'knex';
import getEvents from '../../app/getEvents';

const routes = (db: Knex) => {
  const router = Router();

  router.get('/ping', async (req, res) => {
    res.send('Hello');
  });

  router.get('/event', async (req, res) => {
    res.json(await getEvents(db));
  });

  return router;
};

export default routes;
