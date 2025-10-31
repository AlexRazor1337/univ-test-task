import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/products';

export function createDrizzleClient(options?: { connectionString?: string }) {
  const pool = new Pool({
    connectionString: options?.connectionString || process.env.DATABASE_URL,
  });
  return drizzle(pool, { schema });
}
