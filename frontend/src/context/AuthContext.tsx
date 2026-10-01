import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ApiError, authApi } from '../services/authApi';
import {
  UNAUTHORIZED_EVENT,
  getStoredToken,
  setStoredToken,
} from '../services/http';
import type { Credentials, User } from '../types/user';

interface AuthContextValue {
  user: User | null;
  /** True while the stored token is being checked on first load. */
  isRestoring: boolean;
  isSubmitting: boolean;
  error: string | null;
  login: (credentials: Credentials) => Promise<boolean>;
  register: (credentials: Credentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Holds the signed-in user and exposes login/register/logout.
 * The token itself lives in http.ts (localStorage) so every API call can
 * attach it automatically.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On first load, confirm the stored token is still valid.
  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      setIsRestoring(false);
      return;
    }

    let cancelled = false;

    authApi
      .me(token)
      .then((result) => {
        if (!cancelled) setUser(result.user);
      })
      .catch(() => {
        // Expired or tampered with: drop it and show the login screen.
        setStoredToken(null);
      })
      .finally(() => {
        if (!cancelled) setIsRestoring(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /** Shared by login and register, since both return a token and a user. */
  const authenticate = useCallback(
    async (action: (credentials: Credentials) => Promise<{ token: string; user: User }>, credentials: Credentials) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const { token, user: signedInUser } = await action(credentials);
        setStoredToken(token);
        setUser(signedInUser);
        return true;
      } catch (caught) {
        setError(
          caught instanceof ApiError ? caught.message : 'Something went wrong.',
        );
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const login = useCallback(
    (credentials: Credentials) => authenticate(authApi.login, credentials),
    [authenticate],
  );

  const register = useCallback(
    (credentials: Credentials) => authenticate(authApi.register, credentials),
    [authenticate],
  );

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
  }, []);

  // If any request is rejected with 401, drop the session so the user can
  // log in again instead of staring at a broken screen.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isRestoring,
      isSubmitting,
      error,
      login,
      register,
      logout,
      clearError,
    }),
    [user, isRestoring, isSubmitting, error, login, register, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the auth state. Throws if used outside AuthProvider. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider.');
  }

  return context;
}