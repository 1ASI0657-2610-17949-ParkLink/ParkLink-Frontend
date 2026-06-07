import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/lib/types';

/**
 * Hook que expone el estado de auth de forma semántica.
 * Usa selectors individuales para evitar re-renders innecesarios.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = Boolean(token && user);

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    isDriver: user?.role === 'DRIVER',
    isOwner: user?.role === 'OWNER',
    isAdmin: user?.role === 'ADMIN',
    hasRole: (role: UserRole) => user?.role === role,
  };
}
