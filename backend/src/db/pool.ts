import { Pool } from 'pg';
import { env } from '../config/env';

/**
 * A single connection pool shared by the whole app.
 * `pg` reuses connections, so we do not create a pool per request.
 * The credentials come from DATABASE_URL (environment variable only).
 */
export const pool = new Pool({
  connectionString: env.databaseUrl,
  // Render's free PostgreSQL closes idle connections, so keep the pool small.
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  // Render provides a self-signed-free managed cert, but enabling this makes
  // local development with `sslmode=require` work too.
  ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (error) => {
  console.error('Unexpected error on idle PostgreSQL client:', error.message);
});

/** Run one parameterised query and return its rows. */
export async function query<T extends object = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await pool.query<T>(text, params);
  return result.rows;
}

/** Close the pool (used on graceful shutdown). */
export async function closePool(): Promise<void> {
  await pool.end();
}
