import { useEffect } from 'react';
import { CenteredLoader } from '@/components/ui/Spinner';
import { useAuthStore } from '@/store/auth-store';

/**
 * Ruta "/auth/logout" — limpia sesión y redirige a /auth/login.
 * Se usa para enlaces explícitos de cierre de sesión.
 */
export function LogoutPage() {
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    logout();
  }, [logout]);

  return <CenteredLoader label="Cerrando sesión…" />;
}
