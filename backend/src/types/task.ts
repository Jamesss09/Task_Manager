/** A task as it is stored in the database and returned by the API. */
export interface Task {
  id: number;
  user_id: number | null;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

/** Fields a client may send when creating a task. */
export interface CreateTaskInput {
  title: string;
  description?: string | null;
}

/** Fields a client may send when updating a task (all optional). */
export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  completed?: boolean;
}

/** Filter options supported by GET /api/tasks. */
export interface TaskFilters {
  completed?: boolean;
}