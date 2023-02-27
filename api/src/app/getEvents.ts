import { Knex } from 'knex';
import { Event, DbEvent } from '../types';

type DbEventWithLocation = DbEvent & {
  created_at: string;
  'location.id': string;
  'location.name': string;
  'location.address': string;
};

const toEvent = (event: DbEventWithLocation): Event => ({
  id: event.id,
  name: event.name,
  created_at: event.created_at,
  location: {
    id: event['location.id'],
    name: event['location.name'],
    address: event['location.address']
  }
});

const getEventsFromDb = (db: Knex) =>
  db
    .select(
      'events.id',
      'events.name',
      'events.created_at',
      'locations.id as location.id',
      'locations.name as location.name',
      'locations.address as location.address'
    )
    .from('events')
    .innerJoin('locations', 'events.location_id', 'locations.id')
    .orderBy('events.created_at', 'desc')
    .then((result) => result.map(toEvent));

const getEvents = async (db: Knex) => {
  const events = getEventsFromDb(db);

  return events;
};

export default getEvents;
