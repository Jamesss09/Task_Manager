import { useState } from 'react';
import type { Task, TaskFilter } from '../types/task';
import { TaskItem } from './TaskItem';
import './TaskList.css';

interface TaskListProps {
  tasks: Task[];
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  onToggle: (task: Task) => void;
  onUpdate: (id: number, values: { title: string; description: string }) => void;
  onDelete: (id: number) => void;
  busyTaskIds: Set<number>;
}

const FILTERS: Array<{ value: TaskFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

/** Renders the task list plus the filter tabs and summary numbers. */
export function TaskList({
  tasks,
  filter,
  onFilterChange,
  onToggle,
  onUpdate,
  onDelete,
  busyTaskIds,
}: TaskListProps) {
  const activeCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.length - activeCount;

  function matchesFilter(task: Task): boolean {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  }

  const visibleTasks = tasks.filter(matchesFilter);

  return (
    <section className="task-list">
      <div className="task-list__header">
        <div className="task-list__filters" role="tablist" aria-label="Task filters">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={filter === option.value}
              className={`chip ${filter === option.value ? 'chip--active' : ''}`}
              onClick={() => onFilterChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <p className="task-list__summary">
          {activeCount} active &middot; {completedCount} completed
        </p>
      </div>

      {visibleTasks.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <ul className="task-list__items">
          {visibleTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onUpdate={onUpdate}
              onDelete={onDelete}
              isBusy={busyTaskIds.has(task.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyState({ filter }: { filter: TaskFilter }) {
  const message =
    filter === 'completed'
      ? 'No completed tasks yet.'
      : filter === 'active'
        ? 'Nothing left to do.'
        : 'No tasks yet. Add your first one above.';

  return <p className="task-list__empty">{message}</p>;
}

/** Keeps the currently selected filter in local state. */
export function useTaskFilter() {
  const [filter, setFilter] = useState<TaskFilter>('all');
  return { filter, setFilter };
}