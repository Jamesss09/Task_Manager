import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { requireAuth } from './middleware/auth';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authRouter } from './routes/authRoutes';
import { taskRouter } from './routes/taskRoutes';

/**
 * Builds the Express app. Kept separate from server.ts so the app can be
 * imported in tests without opening a port.
 */
export function createApp() {
  const app = express();

  // The Vercel frontend is served from a different origin, so CORS is needed.
  // Set CLIENT_ORIGIN to your frontend URL to restrict who may call the API.
  // Leave it unset and any origin is allowed, which is handy during setup.
  app.use(
    env.clientOrigin ? cors({ origin: env.clientOrigin }) : cors(),
  );
  app.use(express.json());

  // Health check used by Render and useful while debugging deployments.
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Public: anyone can register or log in.
  app.use('/api/auth', authRouter);

  // Private: a valid token is required.
  app.use('/api/tasks', requireAuth, taskRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}