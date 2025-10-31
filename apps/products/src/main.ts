import { NestFactory } from '@nestjs/core';
import { ProductsModule } from './products.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(ProductsModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');

  if (port) {
    throw new Error('PORT environment variable is not set');
  }

  await app.listen(port);
}
bootstrap();
