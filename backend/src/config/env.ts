import dotenv from 'dotenv';

dotenv.config();

/**
 * Small helper so a missing variable fails fast with a clear message
 * instead of a confusing database error later on.
 */
function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing environment variable "${name}". Copy .env.example to .env and set it.`,
    );
  }

  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: required('DATABASE_URL'),
  // Signs login tokens. Must stay secret; changing it logs everyone out.
  jwtSecret: required('JWT_SECRET'),
  // Optional. When set, only this origin may call the API.
  clientOrigin: process.env.CLIENT_ORIGIN || undefined,
};

export const isProduction = env.nodeEnv === 'production';

if (isProduction && env.jwtSecret.length < 32) {
  console.warn(
    'Warning: JWT_SECRET is shorter than 32 characters. Use a long random value in production.',
  );
}
