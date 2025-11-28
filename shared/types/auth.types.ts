export type UserRole = 'patient' | 'worker' | 'doctor' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  areas?: number[];
  languages?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  areas?: number[];
  languages?: string[];
}
