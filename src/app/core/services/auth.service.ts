import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User, LoginCredentials, LoginResponse, UserRole } from '../models';
import { ApiClientService } from './api-client.service';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiClient = inject(ApiClientService);
  private readonly mockData = inject(MockDataService);

  private readonly currentUser = signal<Omit<User, 'password'> | null>(null);
  private readonly authToken = signal<string | null>(null);

  // Public signals for accessing authentication state
  readonly user = this.currentUser.asReadonly();
  readonly token = this.authToken.asReadonly();
  readonly isAuthenticated = computed(() => !!this.authToken());
  readonly userRole = computed(() => this.currentUser()?.role ?? null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');
  readonly isDoctor = computed(() => this.currentUser()?.role === 'doctor');
  readonly isNurse = computed(() => this.currentUser()?.role === 'nurse');
  readonly isReceptionist = computed(() => this.currentUser()?.role === 'receptionist');

  constructor() {
    // Try to restore session from localStorage
    this.restoreSession();
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    const user = this.mockData
      .getUsers()
      .find(
        (u) => u.email === credentials.email && u.password === credentials.password
      );

    if (!user) {
      return this.apiClient.mockError(
        'Invalid email or password',
        'INVALID_CREDENTIALS',
        401
      );
    }

    // Update last login
    this.mockData.updateUser(user.id, { lastLogin: new Date() });

    // Generate mock token
    const token = this.generateToken(user.id);
    const { password, ...userWithoutPassword } = user;

    const response: LoginResponse = {
      token,
      user: userWithoutPassword,
    };

    return this.apiClient.mockSuccess(response, 'Login successful').pipe(
      tap((result) => {
        this.setSession(result.data.token, result.data.user);
      }),
      map((result) => result.data)
    );
  }

  /**
   * Logout the current user
   */
  logout(): Observable<boolean> {
    return this.apiClient.mockSuccess(true, 'Logout successful').pipe(
      tap(() => {
        this.clearSession();
      }),
      map((response) => response.data)
    );
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<Omit<User, 'password'> | null> {
    const user = this.currentUser();
    return this.apiClient.mockSuccess(user).pipe(map((response) => response.data));
  }

  /**
   * Update current user profile
   */
  updateProfile(updates: Partial<User>): Observable<Omit<User, 'password'>> {
    const user = this.currentUser();
    if (!user) {
      return this.apiClient.mockError('Not authenticated', 'UNAUTHORIZED', 401);
    }

    this.mockData.updateUser(user.id, updates);
    const updatedUser = this.mockData.getUsers().find((u) => u.id === user.id);

    if (!updatedUser) {
      return this.apiClient.mockError('User not found', 'NOT_FOUND', 404);
    }

    const { password, ...userWithoutPassword } = updatedUser;
    this.currentUser.set(userWithoutPassword);
    this.saveToLocalStorage('user', userWithoutPassword);

    return this.apiClient
      .mockSuccess(userWithoutPassword, 'Profile updated successfully')
      .pipe(map((response) => response.data));
  }

  /**
   * Change password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<boolean> {
    const user = this.currentUser();
    if (!user) {
      return this.apiClient.mockError('Not authenticated', 'UNAUTHORIZED', 401);
    }

    const fullUser = this.mockData.getUsers().find((u) => u.id === user.id);
    if (!fullUser || fullUser.password !== currentPassword) {
      return this.apiClient.mockError(
        'Current password is incorrect',
        'INVALID_PASSWORD',
        400
      );
    }

    this.mockData.updateUser(user.id, { password: newPassword });

    return this.apiClient
      .mockSuccess(true, 'Password changed successfully')
      .pipe(map((response) => response.data));
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    return this.currentUser()?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.currentUser()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  // Private helper methods

  private generateToken(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `mock-token-${userId}-${timestamp}-${random}`;
  }

  private setSession(token: string, user: Omit<User, 'password'>): void {
    this.authToken.set(token);
    this.currentUser.set(user);
    this.saveToLocalStorage('token', token);
    this.saveToLocalStorage('user', user);
  }

  private clearSession(): void {
    this.authToken.set(null);
    this.currentUser.set(null);
    this.removeFromLocalStorage('token');
    this.removeFromLocalStorage('user');
  }

  private restoreSession(): void {
    const token = this.getFromLocalStorage<string>('token');
    const user = this.getFromLocalStorage<Omit<User, 'password'>>('user');

    if (token && user) {
      this.authToken.set(token);
      this.currentUser.set(user);
    }
  }

  private saveToLocalStorage(key: string, value: unknown): void {
    try {
      localStorage.setItem(`clinic_dash_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private getFromLocalStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`clinic_dash_${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  private removeFromLocalStorage(key: string): void {
    try {
      localStorage.removeItem(`clinic_dash_${key}`);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
}

