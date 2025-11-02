import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '@app/lib/db/schema/products';
import { SqsEmitterService } from '@app/lib/sqs/sqs-emitter.service';
import { ProductEvents } from '@app/lib/sqs/products.events';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsQueryDto } from './dto/get-products.dto';
import { PaginatedProductsDto } from './dto/paginated-products.dto';
import { deleteProductCounter } from './metrics/delete-product.counter';
import { createProductCounter } from './metrics/create-product.counter';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly sqsEmitterService: SqsEmitterService,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = await this.productsRepository.create(dto);

    createProductCounter.inc();
    await this.sqsEmitterService.sendMessage({
      event: ProductEvents.PRODUCT_CREATED,
      product: { id: product.id, name: product.name },
    });

    return product;
  }

  async getAllPaginated(
    query: GetProductsQueryDto,
  ): Promise<PaginatedProductsDto> {
    const { limit = 10, offset = 0 } = query;
    return this.productsRepository.getPaginated(limit, offset);
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findById(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async delete(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.delete(id);

    deleteProductCounter.inc();
    await this.sqsEmitterService.sendMessage({
      event: ProductEvents.PRODUCT_DELETED,
      product: { id: product.id, name: product.name },
    });
  }
}
