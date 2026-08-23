import { api } from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  username: string;
  role: string;
}

export const login = async (
  credentials: LoginRequest
): Promise<TokenResponse> => {
  const response = await api.post<TokenResponse>(
    "/api/auth/login",
    credentials
  );

  return response.data;
};

export const register = async (
  data: RegisterRequest
): Promise<UserResponse> => {
  const response = await api.post<UserResponse>(
    "/api/auth/register",
    data
  );

  return response.data;
};
