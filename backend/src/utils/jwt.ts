import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from './errors';

/** What we put inside the token. Keep it minimal. */
export interface TokenPayload {
  userId: number;
  email: string;
}

const TOKEN_TTL = '7d';

/** Signs a token for the given user. */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: TOKEN_TTL });
}

/**
 * Verifies a token and returns its payload.
 * Throws UnauthorizedError if the token is missing, expired, or tampered with.
 */
export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      typeof (decoded as TokenPayload).userId === 'number'
    ) {
      return decoded as TokenPayload;
    }

    throw new UnauthorizedError('Invalid token.');
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;

    // Never leak the underlying jwt error to the client.
    throw new UnauthorizedError('Your session has expired. Please log in again.');
  }
}

/** Pulls a bearer token out of the Authorization header. */
export function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null;

  const [scheme, token] = header.split(' ');

  if (!token || scheme.toLowerCase() !== 'bearer') return null;

  return token.trim() || null;
}