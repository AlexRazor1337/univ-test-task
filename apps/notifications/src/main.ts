import { NestFactory } from '@nestjs/core';
import { NotificationsModule } from './notifications.module';
import { getAppPort, setup } from '@app/lib/api/setup';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsModule);
  setup(app, false, 'Notifications', 'Notifications API');

  const port = getAppPort(app);
  await app.listen(port);
}
bootstrap();
