import 'source-map-support/register';
import * as dotenv from 'dotenv';
dotenv.config();

import { Kafka } from 'kafkajs';
import handleOpeningHoursUpdated from '../../app/updateOpeningHours';
import { createDatabaseConnectionPool } from '../../infra/db/db';
import logger from '../../infra/logger';

const topic = 'resource-updates';

const run = async () => {
  const db = createDatabaseConnectionPool();
  const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:29092']
  });

  const consumer = kafka.consumer({
    groupId: 'business-profile-api-poc-group'
  });

  await consumer.connect();
  logger.info('Connected to Kafka cluster');

  await consumer.subscribe({ topic, fromBeginning: true });
  logger.info(`Subscribed ${topic} events`);

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = message.value?.toString();
      if (payload) {
        handleOpeningHoursUpdated(db, JSON.parse(payload));
      } else {
        logger.error('Payload not found');
      }
    }
  });
};

try {
  run();
} catch (e) {
  logger.error(e);
  process.exit(1);
}
