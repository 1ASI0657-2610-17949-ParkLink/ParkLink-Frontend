import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/lib/types';

interface RoleGuardProps {
  role: UserRole;
  children: ReactNode;
}

export function RoleGuard({ role, children }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  if (user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
