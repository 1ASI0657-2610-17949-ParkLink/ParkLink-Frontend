import axios, { AxiosError, type AxiosInstance } from 'axios';
import { useAuthStore } from '@/store/auth-store';
import type { ApiResponse } from './types';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://parklink-platform.vercel.app';

/**
 * Axios instance con interceptors para:
 * - Inyectar el JWT automáticamente en cada request
 * - Manejar 401 globalmente (limpia sesión + redirect)
 */
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<null>>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

/**
 * Helpers que extraen `data` del wrapper ApiResponse<T> del backend.
 * Si el response NO viene envuelto (ej: /maps/static-map que devuelve PNG),
 * usá `api` directamente.
 */
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await api.get<ApiResponse<T>>(url, { params });
  return res.data.data as T;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.post<ApiResponse<T>>(url, body);
  return res.data.data as T;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.patch<ApiResponse<T>>(url, body);
  return res.data.data as T;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const res = await api.delete<ApiResponse<T>>(url);
  return res.data.data as T;
}

/**
 * Extrae un mensaje legible de un error de Axios.
 * Prioriza el `message` del backend, después el mensaje genérico.
 */
export function extractErrorMessage(error: unknown, fallback = 'Algo salió mal'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    const msg = data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string' && msg.length > 0) return msg;
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export { BASE_URL };
export default api;
