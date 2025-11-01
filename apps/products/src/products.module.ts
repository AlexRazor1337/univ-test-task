import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ConfigModule } from '@nestjs/config';
import { ProductsRepository } from './products.repository';
import { dbProvider } from '@app/libs/db/db.provider';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './apps/products/.env',
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, dbProvider, ProductsRepository],
})
export class ProductsModule {}
