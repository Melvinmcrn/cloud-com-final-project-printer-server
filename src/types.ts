export interface IQueueMessage {
  print_id: string;
  printer_id: string;
  file_url: string;
  file_name: string;
  user_name: string;
}

export interface IPubSubMessage {
  message: string | IQueueMessage;
  ackId: string;
}
