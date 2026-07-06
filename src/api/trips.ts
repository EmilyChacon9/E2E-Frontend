import { api } from './clients';
import type { Trip } from '../types/types';

export interface RequestTripPayload {
  pickupAddress: string;
  dropoffAddress: string;
}

export interface RatePayload {
  rating: number;
  comment?: string;
}

export async function requestTrip(payload: RequestTripPayload): Promise<Trip> {
  const { data } = await api.post<Trip>('/trips', payload);
  return data;
}

export async function getMyTripsAsPassenger(): Promise<Trip[]> {
  const { data } = await api.get<Trip[]>('/trips');
  return data;
}

export async function getPendingTrips(): Promise<Trip[]> {
  const { data } = await api.get<Trip[]>('/trips/pending');
  return data;
}

export async function getMyTripsAsDriver(): Promise<Trip[]> {
  const { data } = await api.get<Trip[]>('/trips/my');
  return data;
}

export async function getTripById(id: number): Promise<Trip> {
  const { data } = await api.get<Trip>(`/trips/${id}`);
  return data;
}

export async function acceptTrip(id: number): Promise<Trip> {
  const { data } = await api.patch<Trip>(`/trips/${id}/accept`);
  return data;
}

export async function completeTrip(id: number): Promise<Trip> {
  const { data } = await api.patch<Trip>(`/trips/${id}/complete`);
  return data;
}

export async function rateTrip(id: number, payload: RatePayload): Promise<Trip> {
  const { data } = await api.post<Trip>(`/trips/${id}/rate`, payload);
  return data;
}
