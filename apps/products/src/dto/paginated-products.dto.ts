import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from './product.dto';

export class PaginatedProductsDto {
  @ApiProperty({ description: 'Total number of products', example: 100 })
  total: number;

  @ApiProperty({ type: [ProductDto], description: 'List of products' })
  items: ProductDto[];
}
