import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { closePool, pool } from './pool';

/**
 * Creates the tables from schema.sql, then applies any migration files.
 *
 *   npm run db:migrate
 *
 * Every statement is written to be safe to re-run.
 */
async function migrate() {
  // Resolved from the backend folder so it works from src (tsx) and dist.
  const dbDir = path.join(process.cwd(), 'src', 'db');

  const schemaSql = await readFile(path.join(dbDir, 'schema.sql'), 'utf8');
  await pool.query(schemaSql);
  console.log('Applied schema.sql.');

  const migrationsDir = path.join(dbDir, 'migrations');
  const files = (await readdir(migrationsDir))
    .filter((name) => name.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = await readFile(path.join(migrationsDir, file), 'utf8');
    await pool.query(sql);
    console.log(`Applied ${file}.`);
  }

  console.log('Migration complete.');
}

migrate()
  .then(() => closePool())
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error('Migration failed:', error);
    await closePool();
    process.exit(1);
  });