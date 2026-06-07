import { useAuth } from '@/hooks/useAuth';
import { useReservations } from '@/hooks/useReservations';
import { useParkingSpaces } from '@/hooks/useParkingSpaces';
import { ReservationCard } from '@/components/reservations/ReservationCard';
import { CenteredLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { CalendarDays } from 'lucide-react';

export function OwnerReservationsPage() {
  const { user } = useAuth();
  const { reservations, isLoading } = useReservations();
  const { spaces } = useParkingSpaces();

  const mySpaceIds = new Set(
    spaces.filter((s) => s.ownerId === user?.id).map((s) => s.id),
  );
  const myReservations = reservations.filter((r) => mySpaceIds.has(r.parkingSpaceId));
  const parkingById = new Map(spaces.map((s) => [s.id, s]));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-fg">Reservas</h1>
        <p className="text-sm text-fg-muted mt-1">
          Todas las reservas de tus estacionamientos
        </p>
      </header>

      {isLoading ? (
        <CenteredLoader label="Cargando reservas…" />
      ) : myReservations.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="size-5" />}
          title="Aún no tenés reservas"
          description="Cuando un conductor reserve en tus estacionamientos, lo vas a ver acá."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {myReservations.map((r) => {
            const parking = parkingById.get(r.parkingSpaceId);
            return (
              <ReservationCard
                key={r.id}
                reservation={r}
                parkingName={parking?.name}
                parkingAddress={parking?.address}
                showParking
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
