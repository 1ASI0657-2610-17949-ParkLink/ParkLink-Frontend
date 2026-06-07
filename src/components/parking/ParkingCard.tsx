import { Compass, MapPin, Clock } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { StaticMap } from '@/components/maps/StaticMap';
import { ParkingStatusBadge } from './ParkingStatusBadge';
import { useUIStore } from '@/store/ui-store';
import { formatCurrency, formatDistance } from '@/lib/utils';
import type { ParkingSpaceWithDistance } from '@/lib/types';

interface ParkingCardProps {
  space: ParkingSpaceWithDistance;
  variant?: 'default' | 'compact';
}

/**
 * Card de estacionamiento — abre el modal de detalle global al hacer click
 * (no navega a una ruta separada). El modal muestra info + form de reserva.
 */
export function ParkingCard({ space, variant = 'default' }: ParkingCardProps) {
  const isCompact = variant === 'compact';
  const openModal = useUIStore((s) => s.openModal);

  function handleOpen() {
    openModal({ type: 'parkingDetail', parkingId: space.id });
  }

  return (
    <Card hover className="overflow-hidden group">
      <button
        type="button"
        onClick={handleOpen}
        className="block w-full text-left cursor-pointer"
        aria-label={`Ver detalle de ${space.name}`}
      >
        <div className={isCompact ? 'h-32' : 'h-44'}>
          <StaticMap
            lat={space.latitude}
            lng={space.longitude}
            zoom={15}
            width={400}
            height={isCompact ? 160 : 220}
            className="w-full h-full"
            alt={`Mapa de ${space.name}`}
          />
        </div>

        <CardBody className="space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-fg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {space.name}
            </h3>
            <ParkingStatusBadge status={space.status} />
          </div>

          <p className="text-sm text-fg-muted line-clamp-1 flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            {space.address}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-fg-subtle">
            <Clock className="size-3.5" />
            {space.openingTime} – {space.closingTime}
            {space.distanceKm !== undefined && (
              <>
                <span className="text-border">·</span>
                <span>{formatDistance(space.distanceKm)}</span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <p className="text-xs text-fg-subtle">Precio por hora</p>
              <p className="text-lg font-display font-semibold text-primary">
                {formatCurrency(space.pricePerHour)}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Ver detalle
              <Compass className="size-4" />
            </span>
          </div>
        </CardBody>
      </button>
    </Card>
  );
}
