import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, LinkButton } from '@/components/ui/Button';
import { CenteredLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useUIStore } from '@/store/ui-store';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  type ReservationRecord,
  type ReservationStatus,
} from '@/lib/types';

const STATUS_VARIANT: Record<
  ReservationStatus,
  'success' | 'warning' | 'danger' | 'info' | 'neutral'
> = {
  PENDING_PAYMENT: 'warning',
  CONFIRMED: 'info',
  ACTIVE: 'success',
  COMPLETED: 'neutral',
  CANCELLED: 'danger',
};

const STATUS_LABEL: Record<ReservationStatus, string> = {
  PENDING_PAYMENT: 'Pago pendiente',
  CONFIRMED: 'Confirmada',
  ACTIVE: 'En curso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

export function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const openModal = useUIStore((s) => s.openModal);
  const [reservation, setReservation] = useState<ReservationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    apiGet<ReservationRecord>(`/reservations/${id}`)
      .then((data) => {
        if (!cancelled) setReservation(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleViewParking() {
    if (reservation) {
      openModal({ type: 'parkingDetail', parkingId: reservation.parkingSpaceId });
    }
  }

  if (isLoading) return <CenteredLoader label="Cargando reserva…" />;

  if (error || !reservation) {
    return (
      <EmptyState
        title="No encontramos esta reserva"
        description={error ?? 'Es posible que haya sido eliminada.'}
        action={
          <LinkButton to="/dashboard/reservations">Volver a mis reservas</LinkButton>
        }
      />
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        leftIcon={<ArrowLeft className="size-4" />}
        className="self-start"
      >
        Volver
      </Button>

      <header>
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-xs font-mono text-fg-subtle">{reservation.reservationCode}</p>
          <Badge variant={STATUS_VARIANT[reservation.status]}>
            {STATUS_LABEL[reservation.status]}
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-fg mt-1">
          Detalle de la reserva
        </h1>
      </header>

      <Card variant="elevated">
        <CardBody className="space-y-4 p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <DetailRow label="Inicio" value={formatDateTime(reservation.startTime)} />
            <DetailRow label="Fin" value={formatDateTime(reservation.endTime)} />
            <DetailRow
              label="Estado"
              value={STATUS_LABEL[reservation.status as ReservationStatus]}
            />
            <DetailRow label="Total" value={formatCurrency(reservation.totalPrice)} highlight />
          </div>
          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewParking}
              leftIcon={<Compass className="size-3.5" />}
            >
              Ver el estacionamiento
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-fg-subtle mb-1">{label}</p>
      <p
        className={
          highlight
            ? 'text-2xl font-display font-bold text-primary'
            : 'text-base font-medium text-fg'
        }
      >
        {value}
      </p>
    </div>
  );
}
