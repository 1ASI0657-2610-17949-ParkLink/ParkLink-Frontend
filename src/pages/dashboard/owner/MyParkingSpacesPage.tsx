import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, MoreVertical, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useParkingSpaces } from '@/hooks/useParkingSpaces';
import { Card, CardBody } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { CenteredLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StaticMap } from '@/components/maps/StaticMap';
import { ParkingStatusBadge } from '@/components/parking/ParkingStatusBadge';
import { ParkingForm, type ParkingFormValues } from '@/components/parking/ParkingForm';
import { Modal } from '@/components/ui/Modal';
import {
  PARKING_STATUS,
  type ParkingSpaceRecord,
  type ParkingSpaceStatus,
} from '@/lib/types';
import { apiPatch, extractErrorMessage } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { MapPin } from 'lucide-react';

export function MyParkingSpacesPage() {
  const { user } = useAuth();
  const { spaces, isLoading, refetch } = useParkingSpaces();
  const [editing, setEditing] = useState<ParkingSpaceRecord | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const mySpaces = spaces.filter((s) => s.ownerId === user?.id);

  async function handleStatusChange(id: string, status: ParkingSpaceStatus) {
    setActionError(null);
    try {
      await apiPatch(`/parking-spaces/${id}/status`, { status });
      await refetch();
    } catch (err) {
      setActionError(extractErrorMessage(err, 'No pudimos cambiar el estado'));
    }
  }

  async function handleUpdate(values: ParkingFormValues) {
    if (!editing) return;
    setIsSaving(true);
    try {
      await apiPatch<ParkingSpaceRecord>(`/parking-spaces/${editing.id}`, values);
      setEditing(null);
      await refetch();
    } catch (err) {
      setActionError(extractErrorMessage(err, 'No pudimos guardar los cambios'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-fg">
            Mis estacionamientos
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            {isLoading
              ? 'Cargando…'
              : `${mySpaces.length} ${mySpaces.length === 1 ? 'espacio' : 'espacios'} publicados`}
          </p>
        </div>
        <LinkButton to="/dashboard/parking-spaces/new" leftIcon={<Plus className="size-4" />}>
          Nuevo estacionamiento
        </LinkButton>
      </header>

      {actionError && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <CenteredLoader label="Cargando estacionamientos…" />
      ) : mySpaces.length === 0 ? (
        <EmptyState
          icon={<MapPin className="size-5" />}
          title="Aún no publicaste estacionamientos"
          description="Empezá creando tu primer espacio. Es rápido y gratis."
          action={
            <LinkButton to="/dashboard/parking-spaces/new">Crear el primero</LinkButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mySpaces.map((space) => (
            <Card key={space.id} className="overflow-hidden">
              <div className="h-36">
                <StaticMap
                  lat={space.latitude}
                  lng={space.longitude}
                  zoom={15}
                  width={400}
                  height={180}
                  className="w-full h-full"
                />
              </div>
              <CardBody className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-fg truncate">{space.name}</h3>
                    <p className="text-xs text-fg-muted truncate">{space.address}</p>
                  </div>
                  <ParkingStatusBadge status={space.status} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-fg-subtle">Precio</span>
                  <span className="font-semibold text-primary">
                    {formatCurrency(space.pricePerHour)}/h
                  </span>
                </div>

                {/* Status switcher */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-fg-subtle">Cambiar a:</span>
                  {(
                    [
                      PARKING_STATUS.AVAILABLE,
                      PARKING_STATUS.RESERVED,
                      PARKING_STATUS.OCCUPIED,
                      PARKING_STATUS.DISABLED,
                    ] as ParkingSpaceStatus[]
                  )
                    .filter((s) => s !== space.status)
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleStatusChange(space.id, s)}
                        className="text-xs px-2 py-1 rounded-md border border-border hover:border-primary/50 hover:bg-bg-subtle transition-colors text-fg-muted"
                      >
                        {s}
                      </button>
                    ))}
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <Link
                    to={`/dashboard/parking-spaces/${space.id}/edit`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 text-sm font-medium rounded-md border border-border text-fg hover:bg-bg-subtle transition-colors"
                  >
                    <Edit className="size-3.5" />
                    Editar
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(space)}
                    leftIcon={<MoreVertical className="size-3.5" />}
                  >
                    Ver / Editar
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={Boolean(editing)}
        onClose={() => {
          setEditing(null);
          setActionError(null);
        }}
        title="Editar estacionamiento"
        size="lg"
      >
        {editing && (
          <div className="space-y-3">
            {actionError && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                {actionError}
              </div>
            )}
            <ParkingForm
              initial={editing}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
              submitLabel={isSaving ? 'Guardando…' : 'Guardar cambios'}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
