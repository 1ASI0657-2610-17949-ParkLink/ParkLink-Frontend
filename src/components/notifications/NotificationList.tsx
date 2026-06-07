import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Bell, BellOff } from 'lucide-react';
import { apiGet, apiPatch } from '@/lib/api';
import { formatRelative } from '@/lib/utils';
import { useEffect, useState } from 'react';
import {
  NOTIFICATION_TYPE,
  type NotificationRecord,
  type NotificationType,
} from '@/lib/types';

const ICON_BY_TYPE: Record<NotificationType, string> = {
  [NOTIFICATION_TYPE.RESERVATION_CONFIRMED]: '🅿️',
  [NOTIFICATION_TYPE.PAYMENT_APPROVED]: '💳',
  [NOTIFICATION_TYPE.RESERVATION_CANCELLED]: '✖️',
  [NOTIFICATION_TYPE.RESERVATION_EXPIRING]: '⏰',
  [NOTIFICATION_TYPE.REFUND_PROCESSED]: '↩️',
};

export function NotificationList() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchNotifications() {
    setIsLoading(true);
    try {
      const data = await apiGet<NotificationRecord[]>('/notifications');
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchNotifications();
  }, []);

  async function markAsRead(id: string) {
    try {
      const updated = await apiPatch<NotificationRecord>(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
    } catch {
      // ignore
    }
  }

  async function markAllAsRead() {
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.all(unread.map((n) => markAsRead(n.id)));
  }

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Spinner size="lg" label="Cargando notificaciones…" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<BellOff className="size-5" />}
        title="No tenés notificaciones"
        description="Te avisaremos acá cuando haya algo importante."
      />
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-fg-muted">
            {unreadCount} {unreadCount === 1 ? 'sin leer' : 'sin leer'}
          </p>
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            Marcar todas como leídas
          </Button>
        </div>
      )}

      {notifications.map((n) => (
        <button
          key={n.id}
          type="button"
          onClick={() => !n.isRead && markAsRead(n.id)}
          className="w-full text-left"
        >
          <Card
            className={
              n.isRead
                ? 'opacity-70'
                : 'border-primary/30 ring-1 ring-primary/10'
            }
          >
            <CardBody className="flex items-start gap-3 p-4">
              <div className="size-10 rounded-lg bg-bg-subtle flex items-center justify-center text-lg shrink-0">
                {ICON_BY_TYPE[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm text-fg">{n.title}</h3>
                  {!n.isRead && (
                    <Badge variant="primary" className="shrink-0">
                      Nuevo
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-fg-muted mt-0.5">{n.message}</p>
                <p className="text-xs text-fg-subtle mt-2 flex items-center gap-1">
                  <Bell className="size-3" />
                  {formatRelative(n.createdAt)}
                </p>
              </div>
            </CardBody>
          </Card>
        </button>
      ))}
    </div>
  );
}
