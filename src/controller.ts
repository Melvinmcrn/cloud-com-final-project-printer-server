import {Request, Response} from 'express';
import axios from 'axios';
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

        const data = {
          status: 2,
        };

        await axios.patch(
          `http://35.187.254.152:8000/api/tasks/${messageData.print_id}/`,
          data
        );
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
    if (!req?.body?.print_id) {
      res.status(400).send('Incorrect body');
      return;
    }

    const body = {
      print_id: req.body?.print_id,
      status: 'success',
    };

    await publishMessage(process.env.PUBSUB_TOPIC_NAME, JSON.stringify(body));

    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};
