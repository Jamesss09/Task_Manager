/** A user row as stored in the database. */
export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

/**
 * A user without the password hash. This is what the API returns,
 * so the hash can never leak to the client by accident.
 */
export interface SafeUser {
  id: number;
  email: string;
  created_at: string;
}

/** Fields accepted when registering. */
export interface RegisterInput {
  email: string;
  password: string;
}

/** Fields accepted when logging in. */
export interface LoginInput {
  email: string;
  password: string;
}

/** The response returned by register, login, and me. */
export interface AuthResponse {
  token: string;
  user: SafeUser;
}