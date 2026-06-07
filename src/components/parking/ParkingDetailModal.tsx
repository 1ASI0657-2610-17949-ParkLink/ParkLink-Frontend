import { useEffect, useState } from 'react';
import { Clock, Loader2, MapPin, Navigation, Star, Wallet } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useUIStore } from '@/store/ui-store';
import { useAuth } from '@/hooks/useAuth';
import { apiGet } from '@/lib/api';
import { cn, formatCurrency, truncate } from '@/lib/utils';
import { ReservationForm } from '@/components/reservations/ReservationForm';
import { ParkingStatusBadge } from '@/components/parking/ParkingStatusBadge';
import { StaticMap } from '@/components/maps/StaticMap';
import type { ParkingSpaceRecord } from '@/lib/types';

/**
 * Modal global que muestra el detalle de un estacionamiento y permite reservar.
 * Se abre desde el `ui-store` con `openModal({ type: 'parkingDetail', parkingId })`.
 *
 * Flujo: pin click → modal abre → carga detalle → muestra info + ReservationForm
 *        → form submit → crea reserva + abre modal de pago (en `ui-store`).
 */
export function ParkingDetailModal() {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const isOpen = activeModal?.type === 'parkingDetail';
  const parkingId = activeModal?.type === 'parkingDetail' ? activeModal.parkingId : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      size="lg"
      hideCloseButton={false}
    >
      {parkingId ? <ParkingDetailBody parkingId={parkingId} /> : null}
    </Modal>
  );
}

interface ParkingDetailBodyProps {
  parkingId: string;
}

function ParkingDetailBody({ parkingId }: ParkingDetailBodyProps) {
  const { isAuthenticated } = useAuth();
  const [parking, setParking] = useState<ParkingSpaceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    apiGet<ParkingSpaceRecord>(`/parking-spaces/${parkingId}`)
      .then((data) => {
        if (!cancelled) {
          setParking(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar');
          setParking(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [parkingId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !parking) {
    return (
      <div className="text-center py-8 space-y-3">
        <MapPin className="size-10 text-fg-subtle mx-auto" />
        <p className="text-sm text-fg-muted">
          {error ?? 'No encontramos este estacionamiento.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap -mt-1">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-fg leading-tight">
            {parking.name}
          </h2>
          <p className="text-sm text-fg-muted mt-1 flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{parking.address}</span>
          </p>
        </div>
        <ParkingStatusBadge status={parking.status} />
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <InfoTile
          icon={<Wallet className="size-3.5" />}
          label="Precio"
          value={formatCurrency(parking.pricePerHour)}
          valueClassName="text-primary"
        />
        <InfoTile
          icon={<Clock className="size-3.5" />}
          label="Horario"
          value={`${parking.openingTime} – ${parking.closingTime}`}
        />
        <InfoTile
          icon={<Navigation className="size-3.5" />}
          label="Lat / Lng"
          value={`${parking.latitude.toFixed(3)}, ${parking.longitude.toFixed(3)}`}
        />
        <InfoTile
          icon={<Star className="size-3.5" />}
          label="Estado"
          value={parking.status}
        />
      </div>

      {/* Mapa estático */}
      <div className="h-44 sm:h-52 rounded-xl overflow-hidden border border-border">
        <StaticMap
          lat={parking.latitude}
          lng={parking.longitude}
          zoom={16}
          width={800}
          height={400}
          className="w-full h-full"
        />
      </div>

      {/* Referencia */}
      {parking.reference && (
        <div className="rounded-lg border border-border bg-bg p-3">
          <p className="text-xs text-fg-subtle mb-1">Referencia</p>
          <p className="text-sm text-fg-muted">{truncate(parking.reference, 200)}</p>
        </div>
      )}

      {/* Form de reserva */}
      <div className="rounded-xl border border-border bg-bg-elevated p-4 sm:p-5">
        {parking.status !== 'AVAILABLE' ? (
          <div className="text-center py-4 space-y-2">
            <ParkingStatusBadge status={parking.status} className="mx-auto" />
            <p className="text-sm text-fg-muted">
              Este espacio no está disponible para reservar en este momento.
            </p>
          </div>
        ) : (
          <ReservationForm parking={parking} />
        )}
      </div>

      {!isAuthenticated && (
        <p className="text-xs text-fg-subtle text-center">
          ¿Sos el dueño?{' '}
          <a
            href="/auth/register"
            className="text-primary hover:underline"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/auth/register';
            }}
          >
            Publicá tu estacionamiento
          </a>
        </p>
      )}
    </div>
  );
}

interface InfoTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}

function InfoTile({ icon, label, value, valueClassName }: InfoTileProps) {
  return (
    <div className="rounded-lg border border-border bg-bg-elevated p-2.5">
      <p className="text-[10px] text-fg-subtle flex items-center gap-1 mb-0.5 uppercase tracking-wide">
        {icon}
        {label}
      </p>
      <p className={cn('text-sm font-semibold text-fg truncate', valueClassName)}>{value}</p>
    </div>
  );
}
