import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthForm.css';

type Mode = 'login' | 'register';

const MIN_PASSWORD_LENGTH = 8;

/**
 * One form for both logging in and registering, since the fields are the same.
 * `initialMode` lets the app open on "register" when no account exists yet.
 */
export function AuthForm({ initialMode = 'login' }: { initialMode?: Mode }) {
  const { login, register, isSubmitting, error, clearError } = useAuth();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const isRegister = mode === 'register';

  // Clear any stale message when switching between login and register.
  useEffect(() => {
    clearError();
    setLocalError(null);
    setConfirmPassword('');
  }, [mode, clearError]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const cleanEmail = email.trim();

    if (isRegister && password !== confirmPassword) {
      setLocalError('Those passwords do not match.');
      return;
    }

    const didAuthenticate = isRegister
      ? await register({ email: cleanEmail, password })
      : await login({ email: cleanEmail, password });

    if (!didAuthenticate) {
      setPassword('');
    }
  }

  const message = localError ?? error;

  return (
    <div className="auth">
      <header className="auth__header">
        <h1 className="auth__title">Task Manager</h1>
        <p className="auth__subtitle">
          {isRegister
            ? 'Create an account to start organising your tasks.'
            : 'Log in to see your tasks.'}
        </p>
      </header>

      <form className="auth__form" onSubmit={handleSubmit}>
        <label className="auth__field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            autoFocus
          />
        </label>

        <label className="auth__field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={
              isRegister ? `At least ${MIN_PASSWORD_LENGTH} characters` : 'Your password'
            }
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            minLength={isRegister ? MIN_PASSWORD_LENGTH : undefined}
            required
          />
        </label>

        {isRegister ? (
          <label className="auth__field">
            <span>Confirm password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
              required
            />
          </label>
        ) : null}

        {message ? (
          <p className="error-message" role="alert">
            {message}
          </p>
        ) : null}

        <button
          className="button button--primary auth__submit"
          type="submit"
          disabled={isSubmitting || email.trim().length === 0 || password.length === 0}
        >
          {isSubmitting
            ? 'Please wait...'
            : isRegister
              ? 'Create account'
              : 'Log in'}
        </button>
      </form>

      <p className="auth__switch">
        {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
        <button
          className="auth__switch-button"
          type="button"
          onClick={() => setMode(isRegister ? 'login' : 'register')}
        >
          {isRegister ? 'Log in' : 'Create one'}
        </button>
      </p>
    </div>
  );
}