import { create } from 'zustand';
import { apiGet, apiPost } from '@/lib/api';
import type {
  AuthTokenResponse,
  LoginDto,
  PublicUser,
  RegisterDriverDto,
  RegisterOwnerDto,
} from '@/lib/types';

const TOKEN_KEY = 'parklink_token';
const USER_KEY = 'parklink_user';

interface AuthState {
  token: string | null;
  user: PublicUser | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Acciones
  login: (data: LoginDto) => Promise<void>;
  registerDriver: (data: RegisterDriverDto) => Promise<void>;
  registerOwner: (data: RegisterOwnerDto) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  initialize: () => void;
}

function readStoredUser(): PublicUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as PublicUser) : null;
  } catch {
    return null;
  }
}

function persistSession(token: string, user: PublicUser): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null,
  user: readStoredUser(),
  isLoading: false,
  isInitialized: false,

  initialize: () => {
    set({ isInitialized: true });
    // Rehidrata desde localStorage por si el módulo se importó antes que el storage estuviera listo
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token && !get().token) {
      set({ token, user: readStoredUser() });
    }
  },

  login: async ({ email, password }) => {
    set({ isLoading: true });
    try {
      const res = await apiPost<AuthTokenResponse>('/auth/login', { email, password });
      persistSession(res.accessToken, res.user);
      set({ token: res.accessToken, user: res.user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  registerDriver: async (data) => {
    set({ isLoading: true });
    try {
      const res = await apiPost<AuthTokenResponse>('/auth/register-driver', data);
      persistSession(res.accessToken, res.user);
      set({ token: res.accessToken, user: res.user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  registerOwner: async (data) => {
    set({ isLoading: true });
    try {
      const res = await apiPost<AuthTokenResponse>('/auth/register-owner', data);
      persistSession(res.accessToken, res.user);
      set({ token: res.accessToken, user: res.user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    clearSession();
    set({ token: null, user: null });
    // Usamos window.location para forzar reload limpio (limpia cualquier state de zustand)
    window.location.href = '/auth/login';
  },

  checkAuth: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const user = await apiGet<PublicUser>('/auth/me');
      set({ user });
    } catch {
      get().logout();
    }
  },
}));
