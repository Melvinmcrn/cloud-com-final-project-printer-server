import {PubSub} from '@google-cloud/pubsub';

import {IPubSubMessage} from './types';

const {v1} = require('@google-cloud/pubsub');

const projectId = process.env.PROJECT_ID;
const subscriptionName = process.env.PUBSUB_SUBSCRIPTION_NAME;

// Creates a client; cache this for further use.
const subClient = new v1.SubscriberClient({
  keyFilename: 'serviceAccountKey.json',
});

const formattedSubscription = subClient.subscriptionPath(
  projectId,
  subscriptionName
);

export const synchronousPull = async (): Promise<IPubSubMessage[]> => {
  // The maximum number of messages returned for this request.
  // Pub/Sub may return fewer than the number specified.
  const request = {
    subscription: formattedSubscription,
    maxMessages: 1,
  };

  // The subscriber pulls a specified number of messages.
  const [response] = await subClient.pull(request);
  console.log('response length', response.receivedMessages.length);

  if (response.receivedMessages.length <= 0) {
    return [];
  }

  const receivedMessages: IPubSubMessage[] = [];
  for (const message of response.receivedMessages) {
    receivedMessages.push({
      ackId: message.ackId,
      message: Buffer.from(message.message.data, 'base64').toString('utf-8'),
    });
    console.log('receivedMessages', receivedMessages);
    // console.log(`Received message: ${message.message.data}`);
    // console.log('typeof message.message.data', typeof message.message.data);
    // console.log(
    //   'message.message.data["user_name"]',
    //   message.message.data['user_name']
    // );
  }

  console.log('Done.');
  return receivedMessages;
};

export const ackMessage = async (ackIds: string[]) => {
  if (ackIds.length !== 0) {
    // Acknowledge all of the messages. You could also ackknowledge
    // these individually, but this is more efficient.
    const ackRequest = {
      subscription: formattedSubscription,
      ackIds: ackIds,
    };

    await subClient.acknowledge(ackRequest);
  }

  console.log('Done.');
};

const pubSubClient = new PubSub({
  keyFilename: 'serviceAccountKey.json',
  projectId: process.env.PROJECT_ID,
});

export const publishMessage = async (topicName: string, data: string) => {
  const dataBuffer = Buffer.from(data);

  try {
    console.log('Publishing message with data: ', data);
    const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
    console.log(`Message ${messageId} published.`);
    return;
  } catch (error) {
    console.error(
      `Received error while publishing message with data: ${data} to topic: ${topicName}.`
    );
    console.error(error);
    // throw new ApiError(510, 'Error while publishing message.');
  }
};
