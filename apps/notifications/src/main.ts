import { NestFactory } from '@nestjs/core';
import { NotificationsModule } from './notifications.module';
import { getAppPort, setup } from '@app/libs/api/setup';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsModule);
  setup(app, 'Notifications');

  const port = getAppPort(app);
  await app.listen(port);
}
bootstrap();
