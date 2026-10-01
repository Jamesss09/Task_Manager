import { NotFoundError, ValidationError } from '../utils/errors';
import { query } from '../db/pool';
import type {
  CreateTaskInput,
  Task,
  TaskFilters,
  UpdateTaskInput,
} from '../types/task';

const MAX_TITLE_LENGTH = 255;

/**
 * All database access for tasks lives here.
 * Controllers stay thin, services stay simple and easy to unit test.
 */
/**
 * Every method takes the logged-in user's id and only ever touches their own
 * tasks. Passing userId into the query (rather than filtering after the fact)
 * means one user can never read another's tasks.
 */
export const taskService = {
  async list(userId: number, filters: TaskFilters = {}): Promise<Task[]> {
    const values: unknown[] = [userId];
    let sql = 'SELECT * FROM tasks WHERE user_id = $1';

    if (filters.completed !== undefined) {
      values.push(filters.completed);
      sql += ` AND completed = $${values.length}`;
    }

    sql += ' ORDER BY created_at DESC';

    return query<Task>(sql, values);
  },

  async getById(userId: number, id: number): Promise<Task> {
    const rows = await query<Task>(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId],
    );

    if (rows.length === 0) {
      throw new NotFoundError(`Task with id ${id} was not found.`);
    }

    return rows[0];
  },

  async create(userId: number, input: CreateTaskInput): Promise<Task> {
    const title = input.title.trim();
    validateTitle(title);

    const description = normaliseDescription(input.description);

    const rows = await query<Task>(
      `INSERT INTO tasks (user_id, title, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, title, description],
    );

    return rows[0];
  },

  async update(userId: number, id: number, input: UpdateTaskInput): Promise<Task> {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (input.title !== undefined) {
      const title = input.title.trim();
      validateTitle(title);
      values.push(title);
      updates.push(`title = $${values.length}`);
    }

    if (input.description !== undefined) {
      values.push(normaliseDescription(input.description));
      updates.push(`description = $${values.length}`);
    }

    if (input.completed !== undefined) {
      if (typeof input.completed !== 'boolean') {
        throw new ValidationError('"completed" must be a boolean.');
      }

      values.push(input.completed);
      updates.push(`completed = $${values.length}`);
    }

    if (updates.length === 0) {
      throw new ValidationError(
        'Provide at least one of: title, description, completed.',
      );
    }

    values.push(id, userId);

    // The two parameters just added are the last two in the array.
    const idPlaceholder = values.length - 1;
    const userPlaceholder = values.length;

    const rows = await query<Task>(
      `UPDATE tasks
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${idPlaceholder} AND user_id = $${userPlaceholder}
       RETURNING *`,
      values,
    );

    if (rows.length === 0) {
      throw new NotFoundError(`Task with id ${id} was not found.`);
    }

    return rows[0];
  },

  async remove(userId: number, id: number): Promise<void> {
    const rows = await query<{ id: number }>(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId],
    );

    if (rows.length === 0) {
      throw new NotFoundError(`Task with id ${id} was not found.`);
    }
  },
};

function validateTitle(title: string): void {
  if (title.length === 0) {
    throw new ValidationError('"title" is required and cannot be empty.');
  }

  if (title.length > MAX_TITLE_LENGTH) {
    throw new ValidationError(
      `"title" cannot be longer than ${MAX_TITLE_LENGTH} characters.`,
    );
  }
}

function normaliseDescription(
  description: string | null | undefined,
): string | null {
  if (description === undefined || description === null) {
    return null;
  }

  if (typeof description !== 'string') {
    throw new ValidationError('"description" must be a string.');
  }

  const trimmed = description.trim();
  return trimmed.length === 0 ? null : trimmed;
}