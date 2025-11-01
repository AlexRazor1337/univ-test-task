import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { createDrizzleClient } from '@app/libs/db/db.utils';
import { Product, productsTable } from '@app/libs/db/schema/products';

@Injectable()
export class ProductsRepository {
  constructor(
    @Inject('DRIZZLE')
    private readonly db: ReturnType<typeof createDrizzleClient>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.db.select().from(productsTable);
  }

  async findById(id: number): Promise<Product | undefined> {
    const [result] = await this.db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id));
    return result;
  }

  async create(data: CreateProductDto): Promise<Product> {
    const [inserted] = await this.db
      .insert(productsTable)
      .values(data)
      .returning();
    return inserted;
  }

  async update(id: number, data: UpdateProductDto): Promise<Product> {
    const [updated] = await this.db
      .update(productsTable)
      .set(data)
      .where(eq(productsTable.id, id))
      .returning();
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(productsTable).where(eq(productsTable.id, id));
  }
}
