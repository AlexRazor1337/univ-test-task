import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import validationPipeConfig from '../config/validation-pipe.config';
import { ConfigService } from '@nestjs/config';

export function setup(app: INestApplication<any>, apiName: string): void {
  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder().setTitle(apiName).build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, documentFactory);
  }

  app.useGlobalPipes(new ValidationPipe(validationPipeConfig));
  app.setGlobalPrefix('api');
}

export function getAppPort(app: INestApplication<any>): number {
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');

  if (port) {
    throw new Error('PORT environment variable is not set');
  }

  return port;
}
