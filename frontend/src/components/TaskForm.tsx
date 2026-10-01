import { useEffect, useState, type FormEvent } from 'react';
import './TaskForm.css';

interface TaskFormProps {
  /** Called with the cleaned input values when the form is submitted. */
  onSubmit: (values: { title: string; description: string }) => void;
  /** When provided, the form starts in "edit" mode with these values. */
  initialValues?: { title: string; description: string | null };
  submitLabel?: string;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

/** Reusable form used for both creating and editing a task. */
export function TaskForm({
  onSubmit,
  initialValues,
  submitLabel = 'Add task',
  onCancel,
  isSubmitting = false,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');

  // Reset the fields whenever the form switches to a different task.
  useEffect(() => {
    setTitle(initialValues?.title ?? '');
    setDescription(initialValues?.description ?? '');
  }, [initialValues]);

  const isEditing = Boolean(initialValues);
  const canSubmit = title.trim().length > 0 && !isSubmitting;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) return;

    onSubmit({ title: title.trim(), description: description.trim() });
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form__row">
        <input
          className="task-form__title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to be done?"
          maxLength={255}
          aria-label="Task title"
        />

        <button
          className="button button--primary"
          type="submit"
          disabled={!canSubmit}
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>

      <textarea
        className="task-form__description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Add a description (optional)"
        rows={2}
        aria-label="Task description"
      />

      {isEditing && onCancel ? (
        <div className="task-form__actions">
          <button
            className="button button--ghost"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      ) : null}
    </form>
  );
}