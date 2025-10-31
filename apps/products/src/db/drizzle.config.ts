import path from 'path';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: path.resolve(__dirname, '../../../../libs/db/src/schema'),
  out: path.resolve(__dirname, './migrations'),
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
