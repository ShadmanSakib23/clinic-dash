export interface User {
  id: string;
  email: string;
  password: string; // In real app, this would never be exposed
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist';

export interface AuthToken {
  token: string;
  expiresAt: Date;
  userId: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}
