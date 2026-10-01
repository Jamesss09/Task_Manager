/** A task returned by the backend API. */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

/** Fields used when creating a task. */
export interface CreateTaskInput {
  title: string;
  description?: string | null;
}

/** Fields used when updating a task (all optional). */
export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  completed?: boolean;
}

/** Which tasks to show in the list. */
export type TaskFilter = 'all' | 'active' | 'completed';