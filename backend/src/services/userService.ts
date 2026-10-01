import bcrypt from 'bcryptjs';
import { pool, query } from '../db/pool';
import { ValidationError } from '../utils/errors';
import type { SafeUser, User } from '../types/user';

const MIN_PASSWORD_LENGTH = 8;

// A generic message on purpose: never reveal whether an email is registered.
const DUPLICATE_EMAIL_MESSAGE = 'That email is already registered.';

export const userService = {
  async findByEmail(email: string): Promise<User | undefined> {
    const rows = await query<User>('SELECT * FROM users WHERE email = $1', [
      normaliseEmail(email),
    ]);

    return rows[0];
  },

  async findById(id: number): Promise<User | undefined> {
    const rows = await query<User>('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0];
  },

  async create(email: string, password: string): Promise<SafeUser> {
    const cleanEmail = normaliseEmail(email);
    validateEmail(cleanEmail);
    validatePassword(password);

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const rows = await query<SafeUser>(
        `INSERT INTO users (email, password_hash)
         VALUES ($1, $2)
         RETURNING id, email, created_at`,
        [cleanEmail, passwordHash],
      );

      // Any tasks created before accounts existed belong to the first user,
      // so nothing is lost when adding auth to an existing database.
      await pool.query(
        `UPDATE tasks SET user_id = $1 WHERE user_id IS NULL`,
        [rows[0].id],
      );

      return rows[0];
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ValidationError(DUPLICATE_EMAIL_MESSAGE);
      }

      throw error;
    }
  },

  /** Compares a plain password with a stored hash. */
  async verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, passwordHash);
  },
};

export function toSafeUser(user: User): SafeUser {
  return { id: user.id, email: user.email, created_at: user.created_at };
}

function normaliseEmail(email: string): string {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function validateEmail(email: string): void {
  if (!email) {
    throw new ValidationError('"email" is required.');
  }

  // Deliberately simple check. Real verification happens by email later.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError('Enter a valid email address.');
  }
}

function validatePassword(password: string): void {
  if (typeof password !== 'string' || password.length === 0) {
    throw new ValidationError('"password" is required.');
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new ValidationError(
      `"password" must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
    );
  }
}

/** Detects the Postgres unique-violation error code. */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: string }).code === '23505'
  );
}