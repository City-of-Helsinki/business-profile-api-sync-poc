import * as dotenv from 'dotenv';
dotenv.config();

import { Kafka } from 'kafkajs';
import { handleLocation } from './app';
import logger from './logger';

const topic = 'resource-updates';

const run = async () => {
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
      logger.info(message.value?.toString());
      const id = message.value?.toString();
      if (id) {
        handleLocation(+id);
      } else {
        logger.error('Id undefined');
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
