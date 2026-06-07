import { Badge } from '@/components/ui/Badge';
import { PARKING_STATUS, type ParkingSpaceStatus } from '@/lib/types';

interface ParkingStatusBadgeProps {
  status: ParkingSpaceStatus;
  className?: string;
}

const STATUS_CONFIG: Record<ParkingSpaceStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  [PARKING_STATUS.AVAILABLE]: { label: 'Disponible', variant: 'success' },
  [PARKING_STATUS.RESERVED]: { label: 'Reservado', variant: 'warning' },
  [PARKING_STATUS.OCCUPIED]: { label: 'Ocupado', variant: 'danger' },
  [PARKING_STATUS.DISABLED]: { label: 'Deshabilitado', variant: 'neutral' },
};

export function ParkingStatusBadge({ status, className }: ParkingStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant={config.variant} dot className={className}>
      {config.label}
    </Badge>
  );
}
