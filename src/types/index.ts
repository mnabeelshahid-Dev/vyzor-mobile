// Common types used throughout the app

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  role?: string;
  isVerified?: boolean;
  dateOfBirth?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
  emailVerified?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}
