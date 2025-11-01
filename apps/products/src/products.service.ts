import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
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
    await this.findOne(id);
    return this.productsRepository.delete(id);
  }
}
