import {
  pgTable,
  serial,
  varchar,
  numeric,
  timestamp,
  text,
} from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';

export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Product = InferSelectModel<typeof productsTable>;
