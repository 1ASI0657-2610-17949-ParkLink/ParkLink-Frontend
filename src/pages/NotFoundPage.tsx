import { Link } from 'react-router-dom';
import { MapPinOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export function NotFoundPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-dvh mesh-bg flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="inline-flex size-16 items-center justify-center rounded-full bg-bg-elevated border border-border text-fg-muted mb-6">
          <MapPinOff className="size-8" />
        </div>
        <h1 className="text-5xl sm:text-6xl font-display font-bold text-fg">404</h1>
        <p className="mt-3 text-lg text-fg-muted">No encontramos esta página</p>
        <p className="mt-1 text-sm text-fg-subtle">
          Es posible que el link esté roto o que la página ya no exista.
        </p>
        <Link
          to={isAuthenticated ? '/dashboard' : '/auth/login'}
          className={cn(
            'inline-flex items-center justify-center mt-6 h-10 px-4 text-sm font-medium gap-2 rounded-lg',
            'bg-primary text-primary-fg hover:bg-primary-hover active:scale-[0.98]',
            'shadow-sm transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          )}
        >
          {isAuthenticated ? 'Ir al panel' : 'Ir al login'}
        </Link>
      </div>
    </div>
  );
}
