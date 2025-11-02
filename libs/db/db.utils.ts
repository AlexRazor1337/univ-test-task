import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/products';
import { getTableName, sql, Table } from 'drizzle-orm';

export function createDrizzleClient(options?: { connectionString?: string }) {
  const pool = new Pool({
    connectionString: options?.connectionString || process.env.DATABASE_URL,
  });
  return drizzle(pool, { schema });
}

export function buildInsertQuery<T extends Table>(
  table: T,
  data: Record<string, any>,
) {
  const tableName = getTableName(table);
  const entries = Object.entries(data);

  if (entries.length === 0)
    return sql.raw(`INSERT INTO ${tableName} DEFAULT VALUES RETURNING *`);

  return sql`
    INSERT INTO ${sql.raw(tableName)} (${sql.join(
      entries.map(([key]) => sql.raw(`"${key}"`)),
      sql`, `,
    )})
    VALUES (${sql.join(
      entries.map(([, value]) => sql`${value}`),
      sql`, `,
    )})
    RETURNING *;
  `;
}
