import { api } from './clients';
import type { Role } from '../types/types';

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}

interface TokenResponse {
  token: string;
}

export async function register(payload: RegisterPayload): Promise<string> {
  const { data } = await api.post<TokenResponse>('/auth/register', payload);
  return data.token;
}

export async function login(payload: LoginPayload): Promise<string> {
  const { data } = await api.post<TokenResponse>('/auth/login', payload);
  return data.token;
}
