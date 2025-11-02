import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

@Injectable()
export class SqsEmitterService {
  private sqsClient: SQSClient;
  private queueUrl: string;

  constructor(private configService: ConfigService) {
    this.queueUrl = this.configService.get<string>('PRODUCT_EVENTS_QUEUE_URL');
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

  async sendMessage(messageBody: any) {
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(messageBody),
    });
    await this.sqsClient.send(command);
  }
}
