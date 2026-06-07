import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardBody } from '@/components/ui/Card';
import { CenteredLoader } from '@/components/ui/Spinner';
import { ParkingForm, type ParkingFormValues } from '@/components/parking/ParkingForm';
import { apiGet, apiPatch, extractErrorMessage } from '@/lib/api';
import type { ParkingSpaceRecord } from '@/lib/types';

export function EditParkingSpacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [parking, setParking] = useState<ParkingSpaceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    apiGet<ParkingSpaceRecord>(`/parking-spaces/${id}`)
      .then((data) => {
        if (!cancelled) setParking(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(extractErrorMessage(err, 'No pudimos cargar el estacionamiento'));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(values: ParkingFormValues) {
    if (!id) return;
    setIsSaving(true);
    setError(null);
    try {
      await apiPatch(`/parking-spaces/${id}`, values);
      navigate('/dashboard/parking-spaces');
    } catch (err) {
      setError(extractErrorMessage(err, 'No pudimos guardar los cambios'));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <CenteredLoader label="Cargando estacionamiento…" />;
  }

  if (error && !parking) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
        {error}
      </div>
    );
  }

  if (!parking) return null;

  return (
    <div className="space-y-5 max-w-5xl">
      <header>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-fg">
          Editar estacionamiento
        </h1>
        <p className="text-sm text-fg-muted mt-1">{parking.name}</p>
      </header>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <Card variant="elevated">
        <CardBody className="p-6 sm:p-8">
          <ParkingForm
            initial={parking}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/dashboard/parking-spaces')}
            submitLabel={isSaving ? 'Guardando…' : 'Guardar cambios'}
          />
        </CardBody>
      </Card>
    </div>
  );
}
