import 'source-map-support/register';
import { Kafka } from 'kafkajs';
import { getOpeningHours } from './hauki';
import parseArgs from 'minimist';

const run = async () => {
  const kafka = new Kafka({
    clientId: 'business-profile-poc-api-producer',
    brokers: ['localhost:29092']
  });

  const producer = kafka.producer();

  const args = parseArgs(process.argv.slice(2));
  const id = args._[0];

  const openingHours = await getOpeningHours(id || 13066);

  await producer.connect();
  await producer.send({
    topic: 'resource-updates',
    messages: [{ value: JSON.stringify(openingHours) }]
  });

  await producer.disconnect();
};

run();
