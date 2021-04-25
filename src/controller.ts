import {Request, Response} from 'express';
import {ackMessage, publishMessage, synchronousPull} from './pubsub';
import {IQueueMessage} from './types';

export const getPrintQueue = async (res: Response) => {
  try {
    const messages = await synchronousPull();
    // console.log('messages', messages);
    if (messages.length <= 0) {
      res.send({message: null});
      return;
    }

    const ackIds: string[] = [];
    const returnMessages: IQueueMessage[] = [];
    for (const message of messages) {
      try {
        let messageData: IQueueMessage;
        if (typeof message.message === 'string') {
          messageData = JSON.parse(message.message);
        } else {
          messageData = message.message;
        }
        // console.log('messageData', messageData);
        // console.log('messageData.file_name', messageData.file_name);
        returnMessages.push(messageData);
        ackIds.push(message.ackId);
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
    ackMessage(ackIds);

    res.send({messages: returnMessages});
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

export const postPrint = async (req: Request, res: Response) => {
  try {
    if (!req?.body?.print_id || !req?.body?.status) {
      res.status(400).send();
      return;
    }
    const body = {
      print_id: req.body?.print_id,
      status: req.body?.status,
    };
    publishMessage(process.env.PUBSUB_TOPIC_NAME, JSON.stringify(body));

    res.send({message: 'YES'});
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};
