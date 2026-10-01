import { useState } from 'react';
import type { Task } from '../types/task';
import { TaskForm } from './TaskForm';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onUpdate: (id: number, values: { title: string; description: string }) => void;
  onDelete: (id: number) => void;
  isBusy?: boolean;
}

/** Shows one task in the list, with inline editing. */
export function TaskItem({
  task,
  onToggle,
  onUpdate,
  onDelete,
  isBusy = false,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  const createdAt = new Date(task.created_at).toLocaleString();
  const updatedAt = new Date(task.updated_at).toLocaleString();

  if (isEditing) {
    return (
      <li className="task-item task-item--editing">
        <TaskForm
          initialValues={{
            title: task.title,
            description: task.description,
          }}
          submitLabel="Save"
          isSubmitting={isBusy}
          onSubmit={({ title, description }) => {
            onUpdate(task.id, { title, description });
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className={`task-item ${task.completed ? 'task-item--completed' : ''}`}>
      <label className="task-item__content">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task)}
          disabled={isBusy}
          aria-label="Mark task as completed"
        />

        <div className="task-item__text">
          <h3 className="task-item__title">{task.title}</h3>

          {task.description ? (
            <p className="task-item__description">{task.description}</p>
          ) : null}

          <div className="task-item__meta">
            <span>Created: {createdAt}</span>
            <span>Updated: {updatedAt}</span>
          </div>
        </div>
      </label>

      <div className="task-item__actions">
        <button
          className="button button--ghost"
          type="button"
          onClick={() => setIsEditing(true)}
          disabled={isBusy}
        >
          Edit
        </button>
        <button
          className="button button--danger"
          type="button"
          onClick={() => onDelete(task.id)}
          disabled={isBusy}
        >
          Delete
        </button>
      </div>
    </li>
  );
}