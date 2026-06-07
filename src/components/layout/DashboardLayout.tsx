import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isDriverMap = user?.role === 'DRIVER' && pathname === '/dashboard';
  const showSidebar = !isDriverMap;

  return (
    <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-bg">
      {/* Sidebar persistente (drawer en mobile) */}
      {showSidebar && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Mobile top bar */}
        {showSidebar && (
          <div className="lg:hidden sticky top-0 z-20 h-14 px-4 flex items-center gap-3 border-b border-border bg-bg/95 backdrop-blur-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            leftIcon={<Menu className="size-5" />}
            aria-label="Abrir menú"
          >
            Menú
          </Button>
          <span className="font-display text-base font-semibold">Mi panel</span>
          </div>
        )}

        <main
          className={cn(
            'flex-1 min-h-0 min-w-0 max-w-full overflow-hidden',
            !isDriverMap && 'overflow-y-auto p-4 sm:p-6',
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
