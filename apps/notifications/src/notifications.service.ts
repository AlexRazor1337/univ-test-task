import { ProductEvents } from '@app/libs/sqs/products.events';
import { SqsMessageHandler } from '@app/libs/sqs/sqs-message-handler.decorator';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  @SqsMessageHandler({ queueName: 'product_events' })
  async handleProductEvents(message: any) {
    switch (message.event) {
      case ProductEvents.PRODUCT_CREATED:
        this.logger.log(
          `Product "${message.product.name}" with ID ${message.product.id} was created`,
        );
        break;
      case ProductEvents.PRODUCT_DELETED:
        this.logger.log(
          `Product "${message.product.name}" with ID ${message.product.id} was deleted`,
        );
        break;
      default:
        break;
    }
  }
}
