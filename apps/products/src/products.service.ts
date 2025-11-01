import { Injectable } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from '@app/libs/db/schema/products';
import { GetProductsQueryDto } from './dto/get-products.dto';
import { PaginatedProductsDto } from './dto/paginated-products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  create(dto: CreateProductDto): Promise<Product> {
    return this.productsRepository.create(dto);
  }

  async getAllPaginated(
    query: GetProductsQueryDto,
  ): Promise<PaginatedProductsDto> {
    const { limit = 10, offset = 0 } = query;
    const [items, total] = await this.productsRepository.getPaginated(
      limit,
      offset,
    );

    return {
      total,
      items,
    };
  }

  findOne(id: number): Promise<Product> {
    return this.productsRepository.findById(id);
  }

  update(id: number, dto: UpdateProductDto) {
    return this.productsRepository.update(id, dto);
  }

  delete(id: number): Promise<void> {
    return this.productsRepository.delete(id);
  }
}
