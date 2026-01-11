import { apiClient } from '../lib/api-client';
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from '../types/auth';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/auth/login',
      credentials
    );
    const { token, user } = response.data;
    this.setToken(token);
    this.setUser(user);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/auth/register',
      credentials
    );
    const { token, user } = response.data;
    this.setToken(token);
    this.setUser(user);
    return response.data;
  },

  async verifyToken(): Promise<User | null> {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const response = await apiClient.get<{ user: User }>('/auth/me');
      const user = response.data.user;
      this.setUser(user);
      return user;
    } catch {
      this.clearAuth();
      return null;
    }
  },

  logout(): void {
    this.clearAuth();
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) {
      return null;
    }
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
