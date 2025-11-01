import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from '@app/libs/db/schema/products';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ProductDto } from './dto/product.dto';
import { PaginatedProductsDto } from './dto/paginated-products.dto';
import { GetProductsQueryDto } from './dto/get-products.dto';
import { StatusCodes } from 'http-status-codes';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiCreatedResponse({
    type: ProductDto,
    description: 'Product successfully created',
  })
  create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productsService.create(dto);
  }

  @Get()
  @ApiOkResponse({
    type: PaginatedProductsDto,
    description: 'Paginated list of products',
  })
  findAll(@Query() query: GetProductsQueryDto): Promise<PaginatedProductsDto> {
    return this.productsService.getAllPaginated(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: ProductDto, description: 'Product found' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async findOne(@Param('id') id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({
    type: ProductDto,
    description: 'Product updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  update(
    @Param('id') id: number,
    @Body() dto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(StatusCodes.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Product deleted successfully' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  remove(@Param('id') id: number): Promise<void> {
    return this.productsService.delete(id);
  }
}
