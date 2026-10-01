import type { CreateTaskInput, Task, UpdateTaskInput } from '../types/task';
import { apiRequest } from './http';

/** All API calls for tasks live here, so components stay simple. */
export const taskApi = {
  list(): Promise<Task[]> {
    return apiRequest<Task[]>('/api/tasks');
  },

  create(input: CreateTaskInput): Promise<Task> {
    return apiRequest<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(id: number, input: UpdateTaskInput): Promise<Task> {
    return apiRequest<Task>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  remove(id: number): Promise<void> {
    return apiRequest<void>(`/api/tasks/${id}`, { method: 'DELETE' });
  },
};