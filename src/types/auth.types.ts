export enum UserRole {
  MANAGER = 'Manager',
  KEEPER = 'Keeper',
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: UserRole | string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: UserRole; // Optional: specify role for login
}

export interface ManagerLoginRequest {
  Email: string;
  Password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

