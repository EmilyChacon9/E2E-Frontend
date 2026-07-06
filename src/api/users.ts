import { api } from './clients';
import type { User } from '../types/types';

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/users/me');
  return data;
}

export async function getAvailableDrivers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/drivers/available');
  return data;
}
