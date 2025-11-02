import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { buildInsertQuery, createDrizzleClient } from '@app/lib/db/db.utils';
import { CreateProductDto } from './dto/create-product.dto';
import { Product, productsTable } from '@app/lib/db/schema/products';

@Injectable()
export class ProductsRepository {
  constructor(
    @Inject('DRIZZLE')
    private readonly db: ReturnType<typeof createDrizzleClient>,
  ) {}

  async getPaginated(
    limit: number,
    offset: number,
  ): Promise<{ items: Product[]; total: number }> {
    const {
      rows: [{ count: total }],
    } = await this.db.execute(sql`SELECT COUNT(*)::int AS count FROM products`);

    const { rows: items } = await this.db.execute<Product>(
      sql`SELECT * FROM products ORDER BY id LIMIT ${limit} OFFSET ${offset}`,
    );

    return { items, total: total as number };
  }

  async findById(id: number): Promise<Product | undefined> {
    const {
      rows: [result],
    } = await this.db.execute<Product>(
      sql`SELECT * FROM products WHERE id = ${id} LIMIT 1`,
    );

    return result;
  }

  async create(data: CreateProductDto): Promise<Product> {
    const query = buildInsertQuery(productsTable, data);
    const {
      rows: [product],
    } = await this.db.execute<Product>(query);
    return product;
  }

  async delete(id: number): Promise<void> {
    await this.db.execute(sql`DELETE FROM products WHERE id = ${id}`);
  }
}
