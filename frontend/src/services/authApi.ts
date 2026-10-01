import type { AuthResponse, Credentials } from '../types/user';
import { ApiError, apiRequest } from './http';

/** Authentication endpoints. */
export const authApi = {
  register(credentials: Credentials): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  login(credentials: Credentials): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /** Confirms a stored token is still valid and returns its owner. */
  async me(token: string): Promise<{ user: AuthResponse['user'] }> {
    return apiRequest<{ user: AuthResponse['user'] }>('/api/auth/me', { token });
  },

  async hasUsers(): Promise<boolean> {
    const result = await apiRequest<{ hasUsers: boolean }>(
      '/api/auth/has-users',
    );

    return result.hasUsers;
  },
};

export { ApiError };