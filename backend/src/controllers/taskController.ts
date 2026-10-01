import type { NextFunction, Request, Response } from 'express';
import { taskService } from '../services/taskService';
import { UnauthorizedError, ValidationError } from '../utils/errors';
import type { CreateTaskInput, UpdateTaskInput } from '../types/task';

/**
 * Controllers translate HTTP requests into service calls and back.
 * They do not contain SQL or business rules.
 *
 * Every handler needs the logged-in user, which requireAuth put on req.user.
 */
export const taskController = {
  /** GET /api/tasks?completed=true */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const completed = parseCompletedFilter(req.query.completed);
      const tasks = await taskService.list(currentUserId(req), { completed });

      res.json({ data: tasks });
    } catch (error) {
      next(error);
    }
  },

  /** GET /api/tasks/:id */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.getById(
        currentUserId(req),
        parseId(req.params.id),
      );

      res.json({ data: task });
    } catch (error) {
      next(error);
    }
  },

  /** POST /api/tasks */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.create(
        currentUserId(req),
        req.body as CreateTaskInput,
      );

      res.status(201).json({ data: task });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /api/tasks/:id */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.update(
        currentUserId(req),
        parseId(req.params.id),
        req.body as UpdateTaskInput,
      );

      res.json({ data: task });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /api/tasks/:id */
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await taskService.remove(currentUserId(req), parseId(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

/**
 * Reads the user that requireAuth attached. If it is missing, the route was
 * wired up wrong, so fail loudly rather than leaking another user's data.
 */
function currentUserId(req: Request): number {
  if (!req.user) {
    throw new UnauthorizedError('You must be logged in to do that.');
  }

  return req.user.id;
}

function parseId(rawId: string | undefined): number {
  const id = Number(rawId);

  if (!rawId || !Number.isInteger(id) || id <= 0) {
    throw new ValidationError('Task id must be a positive integer.');
  }

  return id;
}

function parseCompletedFilter(raw: unknown): boolean | undefined {
  if (raw === undefined) {
    return undefined;
  }

  if (raw === 'true') return true;
  if (raw === 'false') return false;

  throw new ValidationError('Query parameter "completed" must be true or false.');
}