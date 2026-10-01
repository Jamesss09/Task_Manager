import type { NextFunction, Request, Response } from 'express';
import { hasAnyUser } from '../middleware/auth';
import { authService } from '../services/authService';
import type { LoginInput, RegisterInput } from '../types/user';

export const authController = {
  /** POST /api/auth/register */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as RegisterInput;
      const result = await authService.register(email, password);

      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  },

  /** POST /api/auth/login */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as LoginInput;
      const result = await authService.login(email, password);

      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  },

  /** GET /api/auth/me (requires a token) */
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      // requireAuth already looked the user up and attached it.
      res.json({ data: { user: req.user } });
    } catch (error) {
      next(error);
    }
  },

  /** GET /api/auth/has-users — lets the UI show register or login first. */
  async hasUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const exists = await hasAnyUser();
      res.json({ data: { hasUsers: exists } });
    } catch (error) {
      next(error);
    }
  },
};