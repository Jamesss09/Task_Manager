import type { NextFunction, Request, Response } from 'express';
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../utils/errors';

/**
 * Single place where every error becomes a consistent JSON response.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} was not found.`,
  });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ValidationError) {
    res.status(400).json({ error: error.message });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({ error: error.message });
    return;
  }

  // Missing, invalid, or expired token.
  if (error instanceof UnauthorizedError) {
    res.status(401).json({ error: error.message });
    return;
  }

  // Signed in, but not allowed to touch this resource.
  if (error instanceof ForbiddenError) {
    res.status(403).json({ error: error.message });
    return;
  }

  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Something went wrong on the server.' });
}