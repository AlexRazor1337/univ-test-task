import { SqsMessageHandler } from '@app/libs/sqs/sqs-message-handler.decorator';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  @SqsMessageHandler({ queueName: 'product_events' })
  async handleProductCreated(message: any) {
  
  }
}
