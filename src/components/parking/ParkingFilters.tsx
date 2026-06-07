import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn, formatCurrency } from '@/lib/utils';
import type { ParkingSpaceSearchParams } from '@/lib/types';

interface ParkingFiltersProps {
  onSearch: (params: ParkingSpaceSearchParams) => void;
  initial?: ParkingSpaceSearchParams;
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

export function ParkingFilters({ onSearch, initial }: ParkingFiltersProps) {
  const [address, setAddress] = useState('');
  const [filters, setFilters] = useState<ParkingSpaceSearchParams>(initial ?? DEFAULT_FILTERS);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Si los `initial` cambian, sincronizamos
  useEffect(() => {
    if (initial) setFilters(initial);
  }, [initial]);

  function update<K extends keyof ParkingSpaceSearchParams>(
    key: K,
    value: ParkingSpaceSearchParams[K],
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(filters);
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS);
    setAddress('');
    onSearch(DEFAULT_FILTERS);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Input
            placeholder="Buscar por dirección (ej. Miraflores, Lima)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            leftIcon={<Search className="size-4" />}
            name="address-search"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowAdvanced((s) => !s)}
          leftIcon={<SlidersHorizontal className="size-4" />}
        >
          {showAdvanced ? 'Ocultar' : 'Filtros'}
        </Button>
        <Button type="submit">Buscar</Button>
      </div>

      {showAdvanced && (
        <div className="rounded-xl border border-border bg-bg-elevated p-4 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RangeField
              label="Distancia máxima"
              value={filters.maxDistance ?? 5}
              min={1}
              max={20}
              step={1}
              unit="km"
              onChange={(v) => update('maxDistance', v)}
            />
            <PriceRangeField
              minPrice={filters.minPrice ?? 0}
              maxPrice={filters.maxPrice ?? 30}
              onMinChange={(v) => update('minPrice', v)}
              onMaxChange={(v) => update('maxPrice', v)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="time"
              label="Hora de entrada"
              value={filters.startTime ?? ''}
              onChange={(e) => update('startTime', e.target.value || undefined)}
            />
            <Input
              type="time"
              label="Hora de salida"
              value={filters.endTime ?? ''}
              onChange={(e) => update('endTime', e.target.value || undefined)}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              leftIcon={<X className="size-4" />}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}

interface RangeFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}

function RangeField({ label, value, min, max, step, unit, onChange }: RangeFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-fg">{label}</label>
        <span className="text-sm text-primary font-semibold">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}

interface PriceRangeFieldProps {
  minPrice: number;
  maxPrice: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
}

function PriceRangeField({ minPrice, maxPrice, onMinChange, onMaxChange }: PriceRangeFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-fg">Rango de precio</label>
        <span className="text-sm text-primary font-semibold">
          {formatCurrency(minPrice)} – {formatCurrency(maxPrice)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          min={0}
          value={minPrice}
          onChange={(e) => onMinChange(Number(e.target.value))}
          className={cn(
            'h-9 px-2 rounded-md text-sm',
            'bg-bg border border-border text-fg',
            'focus:outline-none focus:border-primary',
          )}
          aria-label="Precio mínimo"
        />
        <input
          type="number"
          min={0}
          value={maxPrice}
          onChange={(e) => onMaxChange(Number(e.target.value))}
          className={cn(
            'h-9 px-2 rounded-md text-sm',
            'bg-bg border border-border text-fg',
            'focus:outline-none focus:border-primary',
          )}
          aria-label="Precio máximo"
        />
      </div>
    </div>
  );
}
