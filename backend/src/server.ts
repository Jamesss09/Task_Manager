import { createApp } from './app';
import { env } from './config/env';
import { closePool, pool } from './db/pool';

async function main() {
  // Fail early with a clear message if the database is unreachable.
  try {
    await pool.query('SELECT 1');
    console.log('Connected to PostgreSQL.');
  } catch (error) {
    console.error('Could not connect to PostgreSQL:', error);
    process.exit(1);
  }

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
}

/** Close the database connection before exiting. */
async function shutdown(signal: string) {
  console.log(`\n${signal} received, shutting down.`);
  await closePool();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});