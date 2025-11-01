import { Injectable } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '@app/libs/db/schema/products';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  create(dto: CreateProductDto): Promise<Product> {
    return this.productsRepository.create(dto);
  }

  findAll(): Promise<Product[]> {
    return this.productsRepository.findAll();
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
