import { toSafeUser, userService } from './userService';
import { UnauthorizedError } from '../utils/errors';
import { signToken } from '../utils/jwt';
import type { AuthResponse } from '../types/user';

/**
 * Register and login logic.
 * Returns a signed token plus the safe user, so the client can store one thing.
 */
export const authService = {
  async register(email: string, password: string): Promise<AuthResponse> {
    const user = await userService.create(email, password);

    return {
      token: signToken({ userId: user.id, email: user.email }),
      user,
    };
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await userService.findByEmail(email);

    // Same message for "no such email" and "wrong password" so an attacker
    // cannot use the login form to discover which emails are registered.
    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const passwordMatches = await userService.verifyPassword(
      password ?? '',
      user.password_hash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    return {
      token: signToken({ userId: user.id, email: user.email }),
      user: toSafeUser(user),
    };
  },
};