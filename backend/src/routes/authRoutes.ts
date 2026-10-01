import { Router } from 'express';
import { authController } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

export const authRouter = Router();

authRouter.get('/has-users', authController.hasUsers);
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.get('/me', requireAuth, authController.me);