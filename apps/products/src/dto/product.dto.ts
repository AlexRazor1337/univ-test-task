import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty({ description: 'Product ID', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Name of the product',
    example: 'Product',
  })
  name: string;

  @ApiProperty({
    description: 'Price as string, up to 2 decimal places',
    example: '12.50',
  })
  price: string;

  @ApiPropertyOptional({
    description: 'Optional description',
    example: 'Product description',
  })
  description?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-11-01T14:00:00Z',
  })
  createdAt: Date;
}
