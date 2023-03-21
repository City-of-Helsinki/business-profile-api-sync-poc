import { Kafka } from 'kafkajs';

const run = async () => {
  const kafka = new Kafka({
    clientId: 'business-profile-poc-api-producer',
    brokers: ['localhost:29092']
  });

  const producer = kafka.producer();

  await producer.connect();
  await producer.send({
    topic: 'resource-updates',
    messages: [{ value: '57184' }]
  });

  await producer.disconnect();
};

run();
