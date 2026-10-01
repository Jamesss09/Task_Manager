import type { NextFunction, Request, Response } from 'express';
import { pool } from '../db/pool';
import { toSafeUser, userService } from '../services/userService';
import { UnauthorizedError } from '../utils/errors';
import { extractBearerToken, verifyToken } from '../utils/jwt';

/**
 * Protects a route. Rejects the request unless it carries a valid token for an
 * existing user, and attaches that user to `req.user` for handlers to use.
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      throw new UnauthorizedError('You must be logged in to do that.');
    }

    const payload = verifyToken(token);
    const user = await userService.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedError('Your session is no longer valid.');
    }

    req.user = toSafeUser(user);
    next();
  } catch (error) {
    next(error);
  }
}

/** True when the database has at least one registered user. */
export async function hasAnyUser(): Promise<boolean> {
  const result = await pool.query<{ count: number }>(
    'SELECT COUNT(*)::int AS count FROM users',
  );

  return result.rows[0].count > 0;
}