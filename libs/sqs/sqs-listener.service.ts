import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { SQS_MESSAGE_HANDLER_METADATA } from './sqs-message-handler.decorator';

@Injectable()
export class SqsListenerService implements OnModuleInit {
  private sqsClient: SQSClient;

  constructor(
    private configService: ConfigService,
    private handlerInstances: any[], // injected list of classes with @SqsMessageHandler
  ) {
    this.sqsClient = new SQSClient({
      region: this.configService.get<string>('AWS_REGION'),
      endpoint: this.configService.get<string>('SQS_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  private handlers: Record<string, Function[]> = {};

  onModuleInit() {
    this.registerHandlers();
    this.startPolling();
  }

  private registerHandlers() {
    for (const instance of this.handlerInstances) {
      const proto = Object.getPrototypeOf(instance);
      Object.getOwnPropertyNames(proto).forEach((methodName) => {
        const method = instance[methodName];
        if (!method) return;
        const metadata = Reflect.getMetadata(
          SQS_MESSAGE_HANDLER_METADATA,
          method,
        );
        if (metadata) {
          const { queueName } = metadata;
          if (!this.handlers[queueName]) this.handlers[queueName] = [];
          this.handlers[queueName].push(method.bind(instance));
        }
      });
    }
  }

  private async startPolling() {
    while (true) {
      for (const queueName of Object.keys(this.handlers)) {
        const queueUrl = this.configService.get<string>(
          `${queueName.toUpperCase()}_QUEUE_URL`,
        );
        if (!queueUrl) continue;

        const command = new ReceiveMessageCommand({
          QueueUrl: queueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 5,
        });

        const response = await this.sqsClient.send(command);

        if (response.Messages) {
          for (const message of response.Messages) {
            const body = JSON.parse(message.Body || '{}');

            for (const handler of this.handlers[queueName]) {
              try {
                await handler(body);
              } catch (err) {
                // TODO: Error handling
                // No retry mechanism here
              }
            }

            if (message.ReceiptHandle) {
              await this.sqsClient.send(
                new DeleteMessageCommand({
                  QueueUrl: queueUrl,
                  ReceiptHandle: message.ReceiptHandle,
                }),
              );
            }
          }
        }
      }
    }
  }
}
