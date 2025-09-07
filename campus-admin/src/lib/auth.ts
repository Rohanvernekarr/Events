import { api } from './api';

export interface User {
  email: string;
  role: string;
  userId?: string;
  collegeId?: string;
}

export class AuthService {
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  static setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  static removeToken(): void {
    localStorage.removeItem('token');
  }

  static async login(email: string, password: string): Promise<User> {
    try {
      const response = await api.loginAdmin(email, password);
      this.setToken(response.token);
      return response.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid email or password');
    }
  }

  static logout(): void {
    this.removeToken();
    window.location.href = '/login';
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      if (!this.isAuthenticated()) return null;
      const user = await api.getCurrentUser();
      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      this.logout();
      return null;
    }
  }
}
