import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../services/http';
import { taskApi } from '../services/taskApi';
import type { Task } from '../types/task';

interface UseTasksResult {
  tasks: Task[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  busyTaskIds: Set<number>;
  createTask: (values: { title: string; description: string }) => Promise<boolean>;
  updateTask: (
    id: number,
    values: { title: string; description: string },
  ) => Promise<void>;
  toggleTask: (task: Task) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
}

/**
 * Holds all task data and API calls for the app.
 * Components just render data and call these functions.
 */
export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyTaskIds, setBusyTaskIds] = useState<Set<number>>(new Set());

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setTasks(await taskApi.list());
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  /** Marks one task as busy so only its buttons are disabled. */
  function markBusy(id: number, busy: boolean) {
    setBusyTaskIds((previous) => {
      const next = new Set(previous);

      if (busy) {
        next.add(id);
      } else {
        next.delete(id);
      }

      return next;
    });
  }

  async function createTask(values: { title: string; description: string }) {
    setIsCreating(true);
    setError(null);

    try {
      const created = await taskApi.create({
        title: values.title,
        description: values.description || null,
      });

      setTasks((previous) => [created, ...previous]);
      return true;
    } catch (caught) {
      setError(getErrorMessage(caught));
      return false;
    } finally {
      setIsCreating(false);
    }
  }

  async function updateTask(
    id: number,
    values: { title: string; description: string },
  ) {
    setError(null);
    markBusy(id, true);

    try {
      const updated = await taskApi.update(id, {
        title: values.title,
        description: values.description || null,
      });

      setTasks((previous) =>
        previous.map((task) => (task.id === id ? updated : task)),
      );
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      markBusy(id, false);
    }
  }

  /** Mark a task as completed or incomplete (only sends the completed flag). */
  async function toggleTask(task: Task) {
    setError(null);
    markBusy(task.id, true);

    try {
      const updated = await taskApi.update(task.id, {
        completed: !task.completed,
      });

      setTasks((previous) =>
        previous.map((item) => (item.id === task.id ? updated : item)),
      );
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      markBusy(task.id, false);
    }
  }

  async function deleteTask(id: number) {
    setError(null);
    markBusy(id, true);

    try {
      await taskApi.remove(id);
      setTasks((previous) => previous.filter((task) => task.id !== id));
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      markBusy(id, false);
    }
  }

  return {
    tasks,
    isLoading,
    isCreating,
    error,
    busyTaskIds,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
  };
}

function getErrorMessage(caught: unknown): string {
  if (caught instanceof ApiError) return caught.message;
  if (caught instanceof Error) return caught.message;
  return 'Unexpected error.';
}