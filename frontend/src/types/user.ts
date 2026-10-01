/** A user returned by the backend (never includes the password hash). */
export interface User {
  id: number;
  email: string;
  created_at: string;
}

/** Body sent when registering or logging in. */
export interface Credentials {
  email: string;
  password: string;
}

/** What the API returns after a successful register or login. */
export interface AuthResponse {
  token: string;
  user: User;
}