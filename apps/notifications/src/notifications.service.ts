import { ProductEvents } from '@app/libs/sqs/products.events';
import { SqsMessageHandler } from '@app/libs/sqs/sqs-message-handler.decorator';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  @SqsMessageHandler({ queueName: 'product_events' })
  async handleProductEvents(message: any) {
    switch (message.event) {
      case ProductEvents.PRODUCT_CREATED:
        console.log(
          `Product "${message.product.name}" with ID ${message.product.id} was created`,
        );
        break;
      case ProductEvents.PRODUCT_DELETED:
        console.log(
          `Product "${message.product.name}" with ID ${message.product.id} was deleted`,
        );
        break;
      default:
        break;
    }
  }
}
