import { NestFactory } from '@nestjs/core';
import { ProductsModule } from './products.module';
import { getAppPort, setup } from 'libs/api/setup';

async function bootstrap() {
  const app = await NestFactory.create(ProductsModule);
  setup(app, 'Products');

  const port = getAppPort(app);
  await app.listen(port);
}
bootstrap();
