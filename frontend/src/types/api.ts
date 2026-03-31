export interface ApiErrorResponse {
  error?: boolean;
  message: string;
  code?: string;
}

export interface AuthUser {
  id?: string;
  email?: string;
  username?: string;
}

export interface RegisterRequest {
  username?: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  error: boolean;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  error: boolean;
  message: string;
  token?: string;
  usuario?: AuthUser;
  user?: AuthUser;
}

export interface LogoutResponse {
  error: boolean;
  message: string;
}

export interface CreatePasswordRequest {
  serviceName: string;
  password: string;
  usernameAccount?: string;
  notes?: string;
}

export interface PasswordSummary {
  id: string;
  serviceName: string;
  usernameAccount: string | null;
  notes: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type PasswordCreatedResponse = PasswordSummary;

export type PasswordListResponse = PasswordSummary;

export interface PasswordDetailResponse extends PasswordSummary {
  password: string;
}

export interface UpdatePasswordRequest {
  serviceName?: string;
  usernameAccount?: string;
  password?: string;
  notes?: string;
}

export interface UpdatePasswordResponse {
  error?: boolean;
  message: string;
}

export interface DeletePasswordResponse {
  error?: boolean;
  message: string;
}
