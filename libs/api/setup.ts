import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import validationPipeConfig from '../config/validation-pipe.config';
import { ConfigService } from '@nestjs/config';
import { PrometheusInterceptor } from '../prometheus/prometheus.interceptor';
import apiConfig from '../config/api.config';

export function setup(
  app: INestApplication<any>,
  usePrometheus: boolean,
  apiName: string,
  apiDescription?: string,
): void {
  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle(apiName)
      .setDescription(apiDescription)
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, documentFactory);
  }

  app.useGlobalPipes(new ValidationPipe(validationPipeConfig));
  if (usePrometheus) {
    app.useGlobalInterceptors(new PrometheusInterceptor());
  }
  app.setGlobalPrefix(apiConfig.prefix);
}

export function getAppPort(app: INestApplication<any>): number {
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');

  if (!port) {
    throw new Error('PORT environment variable is not set');
  }

  return port;
}
