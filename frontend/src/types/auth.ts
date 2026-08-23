export type UserRole = "ADMIN" | "USER";

export interface AuthUser {
  id: string;
  username?: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: "bearer";
}

export interface RegisterResponse {
  id: string;
  username: string;
  role: UserRole;
}
