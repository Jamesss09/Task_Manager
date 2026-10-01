import { useEffect, useState } from 'react';
import { AuthForm } from './components/AuthForm';
import { ErrorMessage } from './components/ErrorMessage';
import { Header } from './components/Header';
import { TaskForm } from './components/TaskForm';
import { TaskList, useTaskFilter } from './components/TaskList';
import { useAuth } from './context/AuthContext';
import { useTasks } from './hooks/useTasks';
import { authApi } from './services/authApi';
import './App.css';

export default function App() {
  const { user, isRestoring } = useAuth();

  // Checking the stored token on first load. Showing a neutral screen here
  // avoids flashing the login form at someone who is already signed in.
  if (isRestoring) {
    return (
      <div className="app app--auth">
        <main className="app__card app__card--auth">
          <p className="app__loading app__loading--auth">Loading...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app app--auth">
        <main className="app__card app__card--auth">
          <AuthScreen />
        </main>
      </div>
    );
  }

  // Keyed by user id so switching accounts fully resets the task list state.
  return <SignedInApp key={user.id} />;
}

/**
 * Decides whether the auth form should open on "register" or "login".
 * The very first visitor sees register, because no account exists yet.
 */
function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register' | null>(null);

  useEffect(() => {
    let cancelled = false;

    authApi
      .hasUsers()
      .then((hasUsers) => {
        if (!cancelled) setMode(hasUsers ? 'login' : 'register');
      })
      .catch(() => {
        // If this check fails, fall back to the login form.
        if (!cancelled) setMode('login');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (mode === null) {
    return <p className="app__loading app__loading--auth">Loading...</p>;
  }

  return <AuthForm initialMode={mode} />;
}

/** The task manager itself, shown only to a signed-in user. */
function SignedInApp() {
  const {
    tasks,
    isLoading,
    isCreating,
    error,
    busyTaskIds,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
  } = useTasks();

  const { filter, setFilter } = useTaskFilter();
  const [formKey, setFormKey] = useState(0);

  return (
    <div className="app">
      <main className="app__card">
        <Header />

        <TaskForm
          key={formKey}
          isSubmitting={isCreating}
          onSubmit={async (values) => {
            const didCreate = await createTask(values);

            if (didCreate) {
              setFormKey((previous) => previous + 1);
              setFilter('all');
            }
          }}
        />

        {error ? <ErrorMessage>{error}</ErrorMessage> : null}

        {isLoading ? (
          <p className="app__loading">Loading tasks...</p>
        ) : (
          <TaskList
            tasks={tasks}
            filter={filter}
            onFilterChange={setFilter}
            onToggle={toggleTask}
            onUpdate={updateTask}
            onDelete={deleteTask}
            busyTaskIds={busyTaskIds}
          />
        )}
      </main>
    </div>
  );
}