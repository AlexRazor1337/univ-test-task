import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './libs/db/src/schema/**/*.ts',
  out: './migrations',
  dialect: 'postgresql',
});
