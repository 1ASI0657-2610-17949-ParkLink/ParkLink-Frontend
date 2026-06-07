import { useEffect, useState } from 'react';
import { useReservations } from '@/hooks/useReservations';
import { useParkingSpaces } from '@/hooks/useParkingSpaces';
import { ReservationCard } from '@/components/reservations/ReservationCard';
import { Button, LinkButton } from '@/components/ui/Button';
import { CenteredLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { AlertTriangle, CalendarDays, RefreshCw } from 'lucide-react';
import { apiPatch, extractErrorMessage } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { useReservationCacheStore } from '@/store/reservation-cache-store';
import type { ReservationRecord } from '@/lib/types';

export function MyReservationsPage() {
  const { reservations, isLoading, error, refetch } = useReservations();
  const { spaces } = useParkingSpaces();
  const upsertReservation = useReservationCacheStore((state) => state.upsertReservation);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [extendId, setExtendId] = useState<ReservationRecord | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);

  // Mapa rápido: id → parking
  const parkingById = new Map(spaces.map((s) => [s.id, s]));

  async function handleCancel(reason: string) {
    if (!cancelId) return;
    setIsActing(true);
    setActionError(null);
    try {
      const reservation = await apiPatch<ReservationRecord>(`/reservations/${cancelId}/cancel`, { reason });
      upsertReservation(reservation);
      setCancelId(null);
      await refetch();
    } catch (err) {
      setActionError(extractErrorMessage(err, 'No pudimos cancelar'));
    } finally {
      setIsActing(false);
    }
  }

  async function handleExtend(newEndTime: string) {
    if (!extendId) return;
    setIsActing(true);
    setActionError(null);
    try {
      const reservation = await apiPatch<ReservationRecord>(`/reservations/${extendId.id}/extend`, {
        newEndTime: new Date(newEndTime).toISOString(),
      });
      upsertReservation(reservation);
      setExtendId(null);
      await refetch();
    } catch (err) {
      setActionError(extractErrorMessage(err, 'No pudimos extender'));
    } finally {
      setIsActing(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-fg">Mis reservas</h1>
          <p className="text-sm text-fg-muted mt-1">
            Gestioná todas tus reservas activas y pasadas
          </p>
        </div>
      </header>

      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-fg sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-4 text-warning" />
            <div>
              <p className="font-semibold">No pudimos sincronizar tus reservas</p>
              <p className="mt-1 text-fg-muted">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            leftIcon={<RefreshCw className="size-3.5" />}
          >
            Reintentar
          </Button>
        </div>
      )}

      {isLoading ? (
        <CenteredLoader label="Cargando reservas…" />
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="size-5" />}
          title="Aún no tenés reservas"
          description="Buscá un estacionamiento y hacé tu primera reserva."
          action={
            <LinkButton to="/dashboard">Ir al mapa</LinkButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {reservations.map((r) => {
            const parking = parkingById.get(r.parkingSpaceId);
            return (
              <ReservationCard
                key={r.id}
                reservation={r}
                parkingName={parking?.name}
                parkingAddress={parking?.address}
                onCancel={(id) => setCancelId(id)}
                onExtend={(id) => {
                  const res = reservations.find((x) => x.id === id);
                  if (res) setExtendId(res);
                }}
              />
            );
          })}
        </div>
      )}

      <CancelModal
        isOpen={Boolean(cancelId)}
        onClose={() => {
          setCancelId(null);
          setActionError(null);
        }}
        onConfirm={handleCancel}
        isLoading={isActing}
        error={actionError}
      />

      <ExtendModal
        reservation={extendId}
        onClose={() => {
          setExtendId(null);
          setActionError(null);
        }}
        onConfirm={handleExtend}
        isLoading={isActing}
        error={actionError}
      />
    </div>
  );
}

// ============================================================================
// Cancel modal
// ============================================================================

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
  error: string | null;
}

function CancelModal({ isOpen, onClose, onConfirm, isLoading, error }: CancelModalProps) {
  const [reason, setReason] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (reason.trim().length < 3) return;
    onConfirm(reason.trim());
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancelar reserva" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-fg-muted">
          Contanos por qué cancelás. Esta información nos ayuda a mejorar.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ej. Cambio de planes"
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-fg placeholder:text-fg-subtle focus:outline-none focus:border-primary resize-none"
          required
          minLength={3}
        />
        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Volver
          </Button>
          <Button type="submit" variant="danger" isLoading={isLoading}>
            Confirmar cancelación
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ============================================================================
// Extend modal
// ============================================================================

interface ExtendModalProps {
  reservation: ReservationRecord | null;
  onClose: () => void;
  onConfirm: (newEndTime: string) => void;
  isLoading: boolean;
  error: string | null;
}

function ExtendModal({ reservation, onClose, onConfirm, isLoading, error }: ExtendModalProps) {
  // Default: 1 hora después del endTime actual
  const defaultExtend = reservation
    ? new Date(new Date(reservation.endTime).getTime() + 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16)
    : '';

  const [endTime, setEndTime] = useState(defaultExtend);

  // Reset cuando cambia la reserva
  useEffect(() => {
    if (reservation) {
      setEndTime(defaultExtend);
    }
  }, [reservation, defaultExtend]);

  return (
    <Modal isOpen={Boolean(reservation)} onClose={onClose} title="Extender reserva" size="sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (endTime) onConfirm(endTime);
        }}
        className="space-y-4"
      >
        <p className="text-sm text-fg-muted">
          Elegí la nueva hora de fin. El cargo adicional se calculará al confirmar.
        </p>
        <Input
          type="datetime-local"
          label="Nueva hora de fin"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Volver
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Extender
          </Button>
        </div>
      </form>
    </Modal>
  );
}
