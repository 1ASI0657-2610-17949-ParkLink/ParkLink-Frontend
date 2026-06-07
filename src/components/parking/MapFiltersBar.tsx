import { useEffect, useState, type FormEvent } from 'react';
import {
  CalendarDays,
  Clock,
  Compass,
  DollarSign,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGeocode } from '@/hooks/useGeocode';
import { cn, formatCurrency } from '@/lib/utils';
import type { ParkingSpaceSearchParams } from '@/lib/types';

interface MapFiltersBarProps {
  onSearch: (params: ParkingSpaceSearchParams) => void;
  initial?: ParkingSpaceSearchParams;
  hasUserLocation: boolean;
  isLocating: boolean;
  onUseMyLocation: () => void;
  onViewReservations: () => void;
}

const DEFAULT_FILTERS: ParkingSpaceSearchParams = {
  lat: undefined,
  lng: undefined,
  maxDistance: 5,
  minPrice: undefined,
  maxPrice: undefined,
  startTime: undefined,
  endTime: undefined,
  status: undefined,
};

/**
 * Control flotante del mapa.
 * UX map-first: un buscador tipo pill + opciones como burbujas laterales.
 * El detalle/reserva NO navega: los pins abren modal global.
 */
export function MapFiltersBar({
  onSearch,
  initial,
  hasUserLocation,
  isLocating,
  onUseMyLocation,
  onViewReservations,
}: MapFiltersBarProps) {
  const [address, setAddress] = useState('');
  const [filters, setFilters] = useState<ParkingSpaceSearchParams>(initial ?? DEFAULT_FILTERS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const geocode = useGeocode(address, 500);

  useEffect(() => {
    if (initial) setFilters(initial);
  }, [initial]);

  function update<K extends keyof ParkingSpaceSearchParams>(
    key: K,
    value: ParkingSpaceSearchParams[K],
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next: ParkingSpaceSearchParams = {
      ...filters,
    };

    if (geocode.result) {
      next.lat = geocode.result.latitude;
      next.lng = geocode.result.longitude;
    }

    onSearch(next);
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS);
    setAddress('');
    onSearch(DEFAULT_FILTERS);
  }

  const distanceLabel = `${filters.maxDistance ?? 5} km`;
  const priceLabel = getPriceLabel(filters);
  const timeLabel = getTimeLabel(filters);

  return (
    <div className="pointer-events-none absolute left-3 right-3 top-4 z-20">
      <div className="pointer-events-auto mx-auto flex w-full max-w-5xl flex-col items-center gap-2">
        <div className="flex w-full flex-wrap items-center justify-center gap-2">
          <form
            onSubmit={handleSubmit}
            className={cn(
              'flex h-12 min-w-0 flex-1 basis-[min(100%,28rem)] items-center gap-2',
              'rounded-full border border-border bg-bg-elevated px-3 shadow-lg',
            )}
            role="search"
          >
            <Search className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar zona o dirección…"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-fg-subtle focus:outline-none sm:text-base"
              aria-label="Buscar zona o dirección"
              autoComplete="street-address"
            />
            {geocode.isLoading && (
              <Loader2 className="size-4 shrink-0 animate-spin text-primary" aria-hidden="true" />
            )}
            <Button type="submit" size="sm" className="rounded-full px-4">
              Buscar
            </Button>
          </form>

          <BubbleButton
            icon={CalendarDays}
            label="Mis reservas"
            value="Estados"
            onClick={onViewReservations}
          />

          <BubbleButton
            icon={isLocating ? Loader2 : Compass}
            label={hasUserLocation ? 'Cerca mío' : 'Mi ubicación'}
            value={hasUserLocation ? 'Activo' : undefined}
            isActive={hasUserLocation}
            isSpinning={isLocating}
            onClick={onUseMyLocation}
          />

          <BubbleButton
            icon={SlidersHorizontal}
            label="Filtros"
            value={distanceLabel}
            isActive={showAdvanced}
            onClick={() => setShowAdvanced((open) => !open)}
          />

          <BubbleButton
            icon={DollarSign}
            label="Precio"
            value={priceLabel}
            isActive={Boolean(filters.minPrice || filters.maxPrice)}
            onClick={() => setShowAdvanced(true)}
          />

          <BubbleButton
            icon={Clock}
            label="Hora"
            value={timeLabel}
            isActive={Boolean(filters.startTime || filters.endTime)}
            onClick={() => setShowAdvanced(true)}
          />
        </div>

        {showAdvanced && (
          <div className="w-full max-w-3xl rounded-2xl border border-border bg-bg-elevated p-4 shadow-2xl animate-fade-in">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <RangeField
                label="Distancia máxima"
                value={filters.maxDistance ?? 5}
                min={1}
                max={20}
                step={1}
                unit="km"
                onChange={(value) => update('maxDistance', value)}
              />
              <PriceRangeField
                minPrice={filters.minPrice ?? 0}
                maxPrice={filters.maxPrice ?? 30}
                onMinChange={(value) => update('minPrice', value)}
                onMaxChange={(value) => update('maxPrice', value)}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TimeField
                label="Hora de entrada"
                value={filters.startTime ?? ''}
                onChange={(value) => update('startTime', value || undefined)}
              />
              <TimeField
                label="Hora de salida"
                value={filters.endTime ?? ''}
                onChange={(value) => update('endTime', value || undefined)}
              />
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                leftIcon={<X className="size-3.5" />}
              >
                Limpiar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface BubbleButtonProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  isActive?: boolean;
  isSpinning?: boolean;
  onClick: () => void;
}

function BubbleButton({
  icon: Icon,
  label,
  value,
  isActive = false,
  isSpinning = false,
  onClick,
}: BubbleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-12 shrink-0 items-center gap-2 rounded-full border px-3 text-sm font-medium shadow-lg',
        'transition-[transform,background-color,border-color,color] duration-150 active:scale-[0.97]',
        isActive
          ? 'border-primary bg-primary text-primary-fg'
          : 'border-border bg-bg-elevated text-fg-muted hover:border-border-strong hover:text-fg',
      )}
    >
      <Icon className={cn('size-4 shrink-0', isSpinning && 'animate-spin')} aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
      {value && (
        <span
          className={cn(
            'hidden rounded-full px-2 py-0.5 text-[11px] sm:inline-flex',
            isActive ? 'bg-black/10 text-primary-fg' : 'bg-bg text-fg-subtle',
          )}
        >
          {value}
        </span>
      )}
    </button>
  );
}

interface RangeFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

function RangeField({ label, value, min, max, step, unit, onChange }: RangeFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-medium text-fg-muted" htmlFor="map-distance-filter">
          {label}
        </label>
        <span className="text-xs font-semibold text-primary">
          {value} {unit}
        </span>
      </div>
      <input
        id="map-distance-filter"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}

interface PriceRangeFieldProps {
  minPrice: number;
  maxPrice: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}

function PriceRangeField({ minPrice, maxPrice, onMinChange, onMaxChange }: PriceRangeFieldProps) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="text-xs font-medium text-fg-muted">Rango de precio</legend>
      <span className="text-xs font-semibold text-primary">
        {formatCurrency(minPrice)} – {formatCurrency(maxPrice)}
      </span>
      <div className="grid grid-cols-2 gap-2">
        <label className="sr-only" htmlFor="map-min-price">
          Precio mínimo
        </label>
        <input
          id="map-min-price"
          type="number"
          min={0}
          value={minPrice}
          onChange={(event) => onMinChange(Number(event.target.value))}
          className="h-9 rounded-md border border-border bg-bg px-2 text-sm text-fg focus:border-primary focus:outline-none"
          placeholder="Mín"
        />
        <label className="sr-only" htmlFor="map-max-price">
          Precio máximo
        </label>
        <input
          id="map-max-price"
          type="number"
          min={0}
          value={maxPrice}
          onChange={(event) => onMaxChange(Number(event.target.value))}
          className="h-9 rounded-md border border-border bg-bg px-2 text-sm text-fg focus:border-primary focus:outline-none"
          placeholder="Máx"
        />
      </div>
    </fieldset>
  );
}

interface TimeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function TimeField({ label, value, onChange }: TimeFieldProps) {
  const id = label === 'Hora de entrada' ? 'map-start-time' : 'map-end-time';

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-fg-muted" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <Clock className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
        <input
          id={id}
          type="time"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-full rounded-md border border-border bg-bg py-0 pl-8 pr-2 text-sm text-fg focus:border-primary focus:outline-none"
        />
      </div>
    </div>
  );
}

function getPriceLabel(filters: ParkingSpaceSearchParams) {
  if (filters.minPrice === undefined && filters.maxPrice === undefined) {
    return 'Libre';
  }
  return `${formatCurrency(filters.minPrice ?? 0)}–${formatCurrency(filters.maxPrice ?? 30)}`;
}

function getTimeLabel(filters: ParkingSpaceSearchParams) {
  if (filters.startTime && filters.endTime) return `${filters.startTime}–${filters.endTime}`;
  if (filters.startTime) return `Desde ${filters.startTime}`;
  if (filters.endTime) return `Hasta ${filters.endTime}`;
  return 'Ahora';
}
