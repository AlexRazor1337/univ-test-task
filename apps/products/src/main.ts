import { NestFactory } from '@nestjs/core';
import { ProductsModule } from './products.module';
import { getAppPort, setup } from '@app/libs/api/setup';

async function bootstrap() {
  const app = await NestFactory.create(ProductsModule);
  setup(app, true, 'Products', 'Products API');

  const port = getAppPort(app);
  await app.listen(port);
}
bootstrap();
