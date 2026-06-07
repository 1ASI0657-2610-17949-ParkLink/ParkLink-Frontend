import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Save } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StaticMap } from '@/components/maps/StaticMap';
import { useGeocode } from '@/hooks/useGeocode';
import { extractErrorMessage } from '@/lib/api';
import type { ParkingSpaceRecord } from '@/lib/types';

const parkingSchema = z
  .object({
    name: z.string().min(3, { error: 'Mínimo 3 caracteres' }),
    address: z.string().min(5, { error: 'Dirección completa' }),
    reference: z.string().min(3, { error: 'Agregá una referencia' }),
    pricePerHour: z.number().min(0, { error: 'Debe ser ≥ 0' }),
    openingTime: z.string().min(5, { error: 'Hora de apertura' }),
    closingTime: z.string().min(5, { error: 'Hora de cierre' }),
  })
  .refine((data) => data.openingTime < data.closingTime, {
    message: 'La apertura debe ser antes del cierre',
    path: ['closingTime'],
  });

export type ParkingFormValues = z.infer<typeof parkingSchema>;

interface ParkingFormProps {
  initial?: ParkingSpaceRecord;
  onSubmit: (data: ParkingFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ParkingForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Guardar',
}: ParkingFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ParkingFormValues>({
    resolver: zodResolver(parkingSchema),
    defaultValues: {
      name: initial?.name ?? '',
      address: initial?.address ?? '',
      reference: initial?.reference ?? '',
      pricePerHour: initial?.pricePerHour ?? 5,
      openingTime: initial?.openingTime ?? '08:00',
      closingTime: initial?.closingTime ?? '20:00',
    },
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const address = watch('address');
  const { result: geocode, isLoading: geocoding } = useGeocode(address);

  const previewLatLng =
    initial?.latitude && initial?.longitude
      ? { lat: initial.latitude, lng: initial.longitude }
      : geocode
        ? { lat: geocode.latitude, lng: geocode.longitude }
        : null;

  async function onFormSubmit(values: ParkingFormValues) {
    setSubmitError(null);
    try {
      const payload: ParkingFormValues = {
        ...values,
        // En update, el backend ignora campos no enviados, así que mandamos todo
      };
      await onSubmit(payload);
    } catch (err) {
      setSubmitError(extractErrorMessage(err, 'No pudimos guardar'));
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="grid lg:grid-cols-[1fr_400px] gap-6">
      <div className="space-y-4">
        <Input
          label="Nombre del estacionamiento"
          placeholder="Ej. Estacionamiento Miraflores"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Dirección"
          placeholder="Av. Larco 345, Miraflores"
          error={errors.address?.message}
          hint={
            geocoding
              ? 'Buscando coordenadas…'
              : geocode
                ? `✓ Coordenadas: ${geocode.latitude.toFixed(4)}, ${geocode.longitude.toFixed(4)}`
                : 'Tip: escribí la dirección completa para autocompletar el mapa'
          }
          {...register('address')}
        />
        <Input
          label="Referencia"
          placeholder="Al lado de la farmacia, portón negro"
          error={errors.reference?.message}
          {...register('reference')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Precio por hora (S/.)"
            type="number"
            step="0.5"
            min={0}
            leftIcon={<span className="text-xs">S/.</span>}
            error={errors.pricePerHour?.message}
            {...register('pricePerHour', { valueAsNumber: true })}
          />
          <Input
            label="Apertura"
            type="time"
            error={errors.openingTime?.message}
            {...register('openingTime')}
          />
          <Input
            label="Cierre"
            type="time"
            error={errors.closingTime?.message}
            {...register('closingTime')}
          />
        </div>

        {submitError && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {submitError}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button type="submit" isLoading={isSubmitting} leftIcon={<Save className="size-4" />}>
            {submitLabel}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {/* Preview de mapa */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-fg flex items-center gap-1.5">
          <MapPin className="size-4 text-primary" />
          Vista previa
        </p>
        {previewLatLng ? (
          <StaticMap
            lat={previewLatLng.lat}
            lng={previewLatLng.lng}
            zoom={16}
            width={400}
            height={300}
            className="w-full h-72"
          />
        ) : (
          <div className="h-72 mesh-bg rounded-xl border border-dashed border-border flex items-center justify-center">
            <p className="text-sm text-fg-muted text-center px-4">
              Empezá a escribir la dirección para ver la ubicación en el mapa
            </p>
          </div>
        )}
      </div>
    </form>
  );
}
