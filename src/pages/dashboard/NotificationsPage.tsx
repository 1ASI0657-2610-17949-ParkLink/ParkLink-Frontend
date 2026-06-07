import { NotificationList } from '@/components/notifications/NotificationList';

export function NotificationsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-fg">Notificaciones</h1>
        <p className="text-sm text-fg-muted mt-1">
          Todas las novedades de tu cuenta, en un solo lugar
        </p>
      </header>
      <NotificationList />
    </div>
  );
}
