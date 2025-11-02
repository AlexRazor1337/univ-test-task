import 'reflect-metadata';

export const SQS_MESSAGE_HANDLER_METADATA = 'SQS_MESSAGE_HANDLER_METADATA';

export interface SqsMessageHandlerOptions {
  queueName: string;
}

export const SqsMessageHandler = (
  options: SqsMessageHandlerOptions,
): MethodDecorator => {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(
      SQS_MESSAGE_HANDLER_METADATA,
      options,
      descriptor.value,
    );
  };
};
