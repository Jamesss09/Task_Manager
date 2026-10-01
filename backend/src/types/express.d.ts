import type { SafeUser } from './user';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Set by the requireAuth middleware on protected routes. */
      user?: SafeUser;
    }
  }
}

export {};