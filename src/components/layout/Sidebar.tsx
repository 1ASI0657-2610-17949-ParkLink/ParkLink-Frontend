import { NavLink } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  Car,
  LayoutDashboard,
  LogOut,
  Map as MapIcon,
  ParkingCircle,
  X,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/lib/types';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const navByRole: Record<UserRole, NavItem[]> = {
  DRIVER: [
    { to: '/dashboard', label: 'Mapa', icon: MapIcon, end: true },
    { to: '/dashboard/reservations', label: 'Mis reservas', icon: CalendarDays },
    { to: '/dashboard/notifications', label: 'Notificaciones', icon: Bell },
  ],
  OWNER: [
    { to: '/dashboard', label: 'Resumen', icon: LayoutDashboard, end: true },
    { to: '/dashboard/parking-spaces', label: 'Mis estacionamientos', icon: ParkingCircle },
    { to: '/dashboard/reservations', label: 'Reservas', icon: CalendarDays },
    { to: '/dashboard/notifications', label: 'Notificaciones', icon: Bell },
  ],
  ADMIN: [
    { to: '/dashboard', label: 'Resumen', icon: LayoutDashboard, end: true },
    { to: '/dashboard/parking-spaces', label: 'Estacionamientos', icon: ParkingCircle },
    { to: '/dashboard/reservations', label: 'Reservas', icon: CalendarDays },
    { to: '/dashboard/notifications', label: 'Notificaciones', icon: Bell },
  ],
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sidebar minimalista estilo UntitledUI.
 * Negro plano + bordes delgados + item activo con acento teal a la izquierda.
 */
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  if (!user) return null;

  const items = navByRole[user.role];
  const roleLabel = user.role === 'DRIVER' ? 'Conductor' : user.role === 'OWNER' ? 'Propietario' : 'Admin';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/70 animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          // En mobile: drawer fixed. En desktop (lg+): sticky dentro del flex.
          'fixed lg:sticky lg:top-0 lg:self-start inset-y-0 left-0 z-40 w-64 shrink-0',
          'bg-bg border-r border-border',
          'transform transition-transform duration-200 ease-out lg:transform-none',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'flex flex-col h-dvh lg:h-[calc(100dvh)]',
        )}
      >
        {/* Header mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border">
          <span className="font-display text-base font-semibold">Menú</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-fg-muted hover:text-fg hover:bg-bg-subtle"
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <div className="px-3 mb-2">
            <p className="text-[10px] uppercase tracking-wider text-fg-subtle font-semibold">
              {roleLabel}
            </p>
          </div>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 px-3 h-9 rounded-md text-sm font-medium',
                    'transition-colors',
                    isActive
                      ? 'bg-bg-elevated text-fg'
                      : 'text-fg-muted hover:text-fg hover:bg-bg-elevated',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-primary"
                        aria-hidden="true"
                      />
                    )}
                    <Icon
                      className={cn(
                        'size-4 shrink-0',
                        isActive ? 'text-primary' : 'text-fg-subtle group-hover:text-fg-muted',
                      )}
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-md">
            <div className="size-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-fg text-xs font-semibold shrink-0">
              {getInitials(user.fullName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-fg truncate">{user.fullName}</p>
              <p className="text-[11px] text-fg-subtle truncate flex items-center gap-1">
                <Car className="size-2.5" />
                {user.role}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => useAuthStore.getState().logout()}
            className="mt-2 w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-fg-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="size-4 shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
