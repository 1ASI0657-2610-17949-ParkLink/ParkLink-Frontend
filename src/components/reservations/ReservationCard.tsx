import { Compass, Calendar, Clock, MapPin, X } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/ui-store';
import { formatCurrency, formatDateTime, truncate } from '@/lib/utils';
import {
  RESERVATION_STATUS,
  type ReservationRecord,
  type ReservationStatus,
} from '@/lib/types';

interface ReservationCardProps {
  reservation: ReservationRecord;
  parkingName?: string;
  parkingAddress?: string;
  onCancel?: (id: string) => void;
  onExtend?: (id: string) => void;
  showParking?: boolean;
}

const STATUS_CONFIG: Record<
  ReservationStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }
> = {
  [RESERVATION_STATUS.PENDING_PAYMENT]: { label: 'Pago pendiente', variant: 'warning' },
  [RESERVATION_STATUS.CONFIRMED]: { label: 'Confirmada', variant: 'info' },
  [RESERVATION_STATUS.ACTIVE]: { label: 'En curso', variant: 'success' },
  [RESERVATION_STATUS.COMPLETED]: { label: 'Completada', variant: 'neutral' },
  [RESERVATION_STATUS.CANCELLED]: { label: 'Cancelada', variant: 'danger' },
};

export function ReservationCard({
  reservation,
  parkingName,
  parkingAddress,
  onCancel,
  onExtend,
  showParking = true,
}: ReservationCardProps) {
  const config = STATUS_CONFIG[reservation.status];
  const openModal = useUIStore((s) => s.openModal);
  const canCancel = reservation.status === RESERVATION_STATUS.CONFIRMED ||
    reservation.status === RESERVATION_STATUS.PENDING_PAYMENT;
  const canExtend = reservation.status === RESERVATION_STATUS.CONFIRMED ||
    reservation.status === RESERVATION_STATUS.ACTIVE;

  function handleViewParking() {
    openModal({ type: 'parkingDetail', parkingId: reservation.parkingSpaceId });
  }

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-fg-subtle font-mono">{reservation.reservationCode}</p>
            {showParking && parkingName && (
              <h3 className="font-display font-semibold text-fg mt-0.5 truncate">
                {parkingName}
              </h3>
            )}
            {showParking && parkingAddress && (
              <p className="text-xs text-fg-muted flex items-center gap-1 mt-0.5">
                <MapPin className="size-3" />
                {truncate(parkingAddress, 50)}
              </p>
            )}
          </div>
          <Badge variant={config.variant} dot>
            {config.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm pt-3 border-t border-border">
          <div>
            <p className="text-xs text-fg-subtle flex items-center gap-1 mb-0.5">
              <Calendar className="size-3" /> Inicio
            </p>
            <p className="text-fg font-medium">{formatDateTime(reservation.startTime)}</p>
          </div>
          <div>
            <p className="text-xs text-fg-subtle flex items-center gap-1 mb-0.5">
              <Clock className="size-3" /> Fin
            </p>
            <p className="text-fg font-medium">{formatDateTime(reservation.endTime)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <p className="text-xs text-fg-subtle">Total</p>
            <p className="text-lg font-display font-semibold text-primary">
              {formatCurrency(reservation.totalPrice)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {showParking && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewParking}
                leftIcon={<Compass className="size-3.5" />}
              >
                Ver espacio
              </Button>
            )}
            {canExtend && onExtend && (
              <Button variant="outline" size="sm" onClick={() => onExtend(reservation.id)}>
                Extender
              </Button>
            )}
            {canCancel && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(reservation.id)}
                leftIcon={<X className="size-3.5" />}
                className="text-danger hover:bg-danger/10"
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
