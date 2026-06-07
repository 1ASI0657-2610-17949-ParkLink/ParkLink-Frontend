import { Link, Outlet } from 'react-router-dom';
import { Car } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-dvh mesh-bg flex flex-col">
      <header className="px-6 py-5">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="size-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Car className="size-5 text-primary-fg" />
          </div>
          <span className="font-display text-xl font-semibold text-fg">ParkLink</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-fade-in">
          <Outlet />
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-fg-subtle">
        Al continuar aceptas nuestros términos y política de privacidad.
      </footer>
    </div>
  );
}
