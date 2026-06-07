import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, DollarSign, Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { apiPost } from '@/lib/api';
import { extractErrorMessage } from '@/lib/api';
import {
  calculateReservationPrice,
  formatCurrency,
  minutesBetween,
} from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';
import { useReservationCacheStore } from '@/store/reservation-cache-store';
import type {
  CreateReservationDto,
  ParkingSpaceRecord,
  ReservationRecord,
} from '@/lib/types';

const reservationSchema = z
  .object({
    date: z.string().min(1, { error: 'Elegí una fecha' }),
    startTime: z.string().min(5, { error: 'Hora de inicio' }),
    endTime: z.string().min(5, { error: 'Hora de fin' }),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'La salida debe ser después de la entrada',
    path: ['endTime'],
  });

type ReservationFormValues = z.infer<typeof reservationSchema>;

const DEFAULT_RESERVATION_MINUTES = 120;
const MIN_RESERVATION_MINUTES = 60;
const RESERVATION_START_BUFFER_MINUTES = 60;
const TIME_ROUNDING_MINUTES = 30;

interface ReservationFormProps {
  parking: ParkingSpaceRecord;
  onSuccess?: (reservation: ReservationRecord) => void;
}

function toIsoFromLocal(date: string, time: string): string {
  // date: YYYY-MM-DD, time: HH:MM → ISO local sin Z
  return new Date(`${date}T${time}:00`).toISOString();
}

function getDefaultReservationValues(parking: ParkingSpaceRecord): ReservationFormValues {
  const now = new Date();
  const openingMinutes = parseTimeToMinutes(parking.openingTime);
  const closingMinutes = parseTimeToMinutes(parking.closingTime);

  const suggestedStart = roundUpToNextInterval(
    addMinutes(now, RESERVATION_START_BUFFER_MINUTES),
    TIME_ROUNDING_MINUTES,
  );
  const suggestedStartMinutes = getTimeOfDayMinutes(suggestedStart);

  const hasRoomToday =
    suggestedStartMinutes >= openingMinutes &&
    suggestedStartMinutes + MIN_RESERVATION_MINUTES <= closingMinutes;

  const reservationDate = hasRoomToday ? suggestedStart : addDays(now, 1);
  const startMinutes = hasRoomToday ? suggestedStartMinutes : openingMinutes;
  const availableMinutes = closingMinutes - startMinutes;
  const durationMinutes =
    availableMinutes >= MIN_RESERVATION_MINUTES
      ? Math.min(DEFAULT_RESERVATION_MINUTES, availableMinutes)
      : MIN_RESERVATION_MINUTES;
  const endMinutes = startMinutes + durationMinutes;

  return {
    date: toDateInputValue(reservationDate),
    startTime: minutesToTime(startMinutes),
    endTime: minutesToTime(endMinutes),
  };
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function roundUpToNextInterval(date: Date, intervalMinutes: number): Date {
  const rounded = new Date(date);
  rounded.setSeconds(0, 0);
  const minutes = rounded.getMinutes();
  const remainder = minutes % intervalMinutes;

  if (remainder > 0) {
    rounded.setMinutes(minutes + intervalMinutes - remainder);
  }

  return rounded;
}

function getTimeOfDayMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function parseTimeToMinutes(time: string): number {
  const [hoursRaw, minutesRaw] = time.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return 0;
  }

  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getFirstValidationMessage(errors: FieldErrors<ReservationFormValues>): string {
  const message = errors.date?.message ?? errors.startTime?.message ?? errors.endTime?.message;

  return typeof message === 'string'
    ? message
    : 'Completá fecha, entrada y salida con un horario válido.';
}

function getLivePrice(values: Partial<ReservationFormValues>, pricePerHour: number) {
  if (!values.date || !values.startTime || !values.endTime) return 0;
  try {
    const start = toIsoFromLocal(values.date, values.startTime);
    const end = toIsoFromLocal(values.date, values.endTime);
    return calculateReservationPrice(start, end, pricePerHour);
  } catch {
    return 0;
  }
}

function getLiveDuration(values: Partial<ReservationFormValues>) {
  if (!values.date || !values.startTime || !values.endTime) return 0;
  try {
    const start = toIsoFromLocal(values.date, values.startTime);
    const end = toIsoFromLocal(values.date, values.endTime);
    return Math.max(0, minutesBetween(start, end));
  } catch {
    return 0;
  }
}

export function ReservationForm({ parking, onSuccess }: ReservationFormProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const openModal = useUIStore((s) => s.openModal);
  const upsertReservation = useReservationCacheStore((s) => s.upsertReservation);

  // Default: próximo bloque reservable dentro del horario del estacionamiento.
  // useState initializer: se calcula una sola vez.
  const [defaults] = useState(() => getDefaultReservationValues(parking));

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: defaults,
  });

  const watched = watch();
  const livePrice = getLivePrice(watched, parking.pricePerHour);
  const liveDuration = getLiveDuration(watched);

  async function onFormSubmit(values: ReservationFormValues) {
    try {
      const payload: CreateReservationDto = {
        parkingSpaceId: parking.id,
        startTime: toIsoFromLocal(values.date, values.startTime),
        endTime: toIsoFromLocal(values.date, values.endTime),
      };
      const reservation = await apiPost<ReservationRecord>('/reservations', payload);
      upsertReservation(reservation);
      onSuccess?.(reservation);
      // Abrimos el modal de pago con la reserva recién creada
      openModal({
        type: 'payment',
        reservationId: reservation.id,
        reservationCode: reservation.reservationCode,
        amount: reservation.totalPrice,
      });
    } catch (err) {
      const msg = extractErrorMessage(err, 'No pudimos crear la reserva');
      toast.error('Error al reservar', { description: msg });
    }
  }

  function onInvalidSubmit(formErrors: FieldErrors<ReservationFormValues>) {
    toast.warning('Revisá la reserva', {
      description: getFirstValidationMessage(formErrors),
      duration: 6000,
    });
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-border bg-bg-elevated p-6 text-center space-y-3">
        <h3 className="font-display text-lg font-semibold text-fg">¿Querés reservar?</h3>
        <p className="text-sm text-fg-muted">
          Iniciá sesión para confirmar tu reserva y pagar en línea.
        </p>
        <Button onClick={() => navigate('/auth/login')}>Iniciar sesión</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit, onInvalidSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          type="date"
          label="Fecha"
          leftIcon={<Calendar className="size-4" />}
          min={toDateInputValue(new Date())}
          error={errors.date?.message}
          {...register('date')}
        />
        <Input
          type="time"
          label="Desde"
          leftIcon={<Clock className="size-4" />}
          error={errors.startTime?.message}
          {...register('startTime')}
        />
        <Input
          type="time"
          label="Hasta"
          leftIcon={<Clock className="size-4" />}
          error={errors.endTime?.message}
          {...register('endTime')}
        />
      </div>

      {/* Resumen en vivo */}
      <div className="rounded-lg border border-border bg-bg p-4 space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-fg-muted">Duración estimada</span>
          <span className="font-medium text-fg">
            {liveDuration > 0 ? `${(liveDuration / 60).toFixed(1)} horas` : '—'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-fg-muted flex items-center gap-1">
            <DollarSign className="size-3.5" />
            Total
          </span>
          <span className="text-2xl font-display font-bold text-fg">
            {formatCurrency(livePrice)}
          </span>
        </div>
      </div>

      <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Reservando…
          </>
        ) : (
          'Confirmar reserva y pagar'
        )}
      </Button>

      <p className="text-xs text-fg-subtle text-center">
        Te cobraremos {formatCurrency(livePrice)} al confirmar. Cancelación gratis hasta 1h antes.
      </p>
    </form>
  );
}
