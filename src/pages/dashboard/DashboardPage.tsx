import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  MapPin,
  ParkingCircle,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useReservations } from '@/hooks/useReservations';
import { useParkingSpaces } from '@/hooks/useParkingSpaces';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CenteredLoader } from '@/components/ui/Spinner';
import { MapFirstView } from '@/components/dashboard/MapFirstView';
import { formatCurrency, formatRelative } from '@/lib/utils';
import {
  RESERVATION_STATUS,
  type ReservationStatus,
} from '@/lib/types';

export function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading) return <CenteredLoader />;
  if (!user) return <Navigate to="/auth/login" replace />;

  // El conductor entra directo al mapa.
  if (user.role === 'DRIVER') {
    return <MapFirstView />;
  }

  // El owner mantiene el overview con sus estacionamientos.
  return <OwnerOverview />;
}

// ============================================================================
// OWNER OVERVIEW
// ============================================================================

function OwnerOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { spaces, isLoading } = useParkingSpaces();
  const { reservations, isLoading: resLoading } = useReservations();

  const mySpaces = spaces.filter((s) => s.ownerId === user?.id);
  const mySpaceIds = new Set(mySpaces.map((s) => s.id));
  const myReservations = reservations.filter((r) => mySpaceIds.has(r.parkingSpaceId));
  const activeReservations = myReservations.filter(
    (r) =>
      r.status === RESERVATION_STATUS.CONFIRMED ||
      r.status === RESERVATION_STATUS.ACTIVE,
  );
  const totalRevenue = myReservations
    .filter((r) => r.status === RESERVATION_STATUS.COMPLETED)
    .reduce((sum, r) => sum + r.totalPrice, 0);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm text-fg-muted">Hola, {user?.fullName.split(' ')[0]}</p>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-fg">Mi panel</h1>
        </div>
        <Button
          onClick={() => navigate('/dashboard/parking-spaces/new')}
          leftIcon={<Plus className="size-4" />}
        >
          Nuevo estacionamiento
        </Button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          icon={<ParkingCircle className="size-5" />}
          label="Mis estacionamientos"
          value={String(mySpaces.length)}
        />
        <StatCard
          icon={<CalendarDays className="size-5" />}
          label="Reservas activas"
          value={String(activeReservations.length)}
        />
        <StatCard
          icon={<TrendingUp className="size-5" />}
          label="Ingresos completados"
          value={formatCurrency(totalRevenue)}
          valueClassName="text-success"
        />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-fg">Mis estacionamientos</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/parking-spaces')}
            rightIcon={<Plus className="size-3.5" />}
          >
            Ver todos
          </Button>
        </CardHeader>
        <CardBody className="space-y-2">
          {isLoading ? (
            <CenteredLoader label="Cargando…" />
          ) : mySpaces.length === 0 ? (
            <p className="text-sm text-fg-muted py-4 text-center">
              Aún no publicaste ningún estacionamiento.{' '}
              <Link
                to="/dashboard/parking-spaces/new"
                className="text-primary hover:underline"
              >
                Crear el primero
              </Link>
            </p>
          ) : (
            mySpaces.slice(0, 3).map((s) => (
              <Link
                key={s.id}
                to={`/dashboard/parking-spaces/${s.id}/edit`}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-lg bg-bg-subtle border border-border flex items-center justify-center shrink-0">
                    <MapPin className="size-5 text-fg-muted" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-fg truncate">{s.name}</p>
                    <p className="text-xs text-fg-muted truncate">{s.address}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary shrink-0">
                  {formatCurrency(s.pricePerHour)}/h
                </span>
              </Link>
            ))
          )}
        </CardBody>
      </Card>

      {resLoading && activeReservations.length === 0 ? null : activeReservations.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-display font-semibold text-fg">Reservas activas</h2>
          </CardHeader>
          <CardBody className="space-y-2">
            {activeReservations.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div>
                  <p className="text-sm font-mono font-medium text-fg">{r.reservationCode}</p>
                  <p className="text-xs text-fg-muted mt-0.5">
                    {formatRelative(r.startTime)}
                  </p>
                </div>
                <Badge variant="info">{RESERVATION_STATUS_LABEL[r.status]}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// Shared
// ============================================================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}

function StatCard({ icon, label, value, valueClassName }: StatCardProps) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3 p-4">
        <div className="size-10 rounded-lg bg-bg border border-border flex items-center justify-center text-primary shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-fg-subtle">{label}</p>
          <p
            className={
              'text-xl font-display font-bold text-fg truncate' +
              (valueClassName ? ` ${valueClassName}` : '')
            }
          >
            {value}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  PENDING_PAYMENT: 'Pago pendiente',
  CONFIRMED: 'Confirmada',
  ACTIVE: 'En curso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};
