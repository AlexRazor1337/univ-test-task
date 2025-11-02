import path from 'path';
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: './apps/products/.env' });

export default defineConfig({
  schema: path.resolve(__dirname, '../../../../libs/db/schema'),
  out: path.resolve(__dirname, './migrations'),
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
