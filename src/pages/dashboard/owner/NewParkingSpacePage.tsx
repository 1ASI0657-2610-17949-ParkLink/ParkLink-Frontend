import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost, extractErrorMessage } from '@/lib/api';
import { Card, CardBody } from '@/components/ui/Card';
import { ParkingForm, type ParkingFormValues } from '@/components/parking/ParkingForm';
import type { ParkingSpaceRecord } from '@/lib/types';

export function NewParkingSpacePage() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: ParkingFormValues) {
    setIsSaving(true);
    setError(null);
    try {
      const created = await apiPost<ParkingSpaceRecord>('/parking-spaces', values);
      navigate('/dashboard/parking-spaces', {
        replace: true,
        state: { createdId: created.id },
      });
    } catch (err) {
      setError(extractErrorMessage(err, 'No pudimos crear el estacionamiento'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <header>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-fg">
          Nuevo estacionamiento
        </h1>
        <p className="text-sm text-fg-muted mt-1">
          Publicá tu espacio y empezá a recibir reservas
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <Card variant="elevated">
        <CardBody className="p-6 sm:p-8">
          <ParkingForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/dashboard/parking-spaces')}
            submitLabel={isSaving ? 'Creando…' : 'Publicar estacionamiento'}
          />
        </CardBody>
      </Card>
    </div>
  );
}
