import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ConfigModule } from '@nestjs/config';
import { ProductsRepository } from './products.repository';
import { dbProvider } from '@app/libs/db/db.provider';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import prometheusConfig from '@app/libs/config/prometheus.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './apps/products/.env',
    }),
    PrometheusModule.register({
      path: prometheusConfig.metricsEndpoint,
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, dbProvider, ProductsRepository],
})
export class ProductsModule {}
