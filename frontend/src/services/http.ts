/**
 * Base URL of the backend API.
 * Empty in development, because Vite proxies `/api` to the backend.
 * Set VITE_API_BASE_URL on Vercel, e.g. https://my-api.onrender.com/api
 */
const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '';

/** Thrown for any failed request, with the HTTP status attached. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Fired when the API rejects our token, so the app can log the user out. */
export const UNAUTHORIZED_EVENT = 'task-manager:unauthorized';

const TOKEN_KEY = 'task-manager-token';

/**
 * The auth token lives in localStorage so a refresh keeps you logged in.
 * localStorage is readable by JavaScript, so this is the trade-off that comes
 * with bearer tokens. httpOnly cookies would avoid it but need a different
 * backend setup.
 */
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

interface RequestOptions extends RequestInit {
  /** Overrides the stored token. Rarely needed. */
  token?: string | null;
}

/**
 * Small fetch wrapper: adds JSON headers and the auth token, and normalises
 * error messages. Every service uses this so behaviour stays consistent.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, ...init } = options;
  const authToken = token === undefined ? getStoredToken() : token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError('Could not reach the server. Is the backend running?', 0);
  }

  if (!response.ok) {
    // An expired or revoked token means the app should return to the login screen.
    if (response.status === 401 && authToken) {
      setStoredToken(null);
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    throw new ApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json()) as { data: T };
  return body.data;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    if (body.error) return body.error;
  } catch {
    // A 500 from the Vite dev proxy has an empty body, so fall through.
  }

  if (response.status >= 500) {
    return 'The server had a problem. Check that the backend is running.';
  }

  return `Request failed with status ${response.status}.`;
}