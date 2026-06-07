import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import polyline from '@mapbox/polyline';
import { format, formatDistanceToNow, parseISO, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';

// ============================================================================
// cn() — className utility
// ============================================================================

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================================================
// Format — Currency (Peruvian Soles)
// ============================================================================

const PEN_FORMATTER = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});

export function formatCurrency(amount: number): string {
  return PEN_FORMATTER.format(amount);
}

// ============================================================================
// Format — Date / Time
// ============================================================================

export function formatDate(iso: string, pattern = "d 'de' MMMM, yyyy"): string {
  return format(parseISO(iso), pattern, { locale: es });
}

export function formatTime(iso: string, pattern = 'HH:mm'): string {
  return format(parseISO(iso), pattern, { locale: es });
}

export function formatDateTime(iso: string, pattern = "d MMM yyyy · HH:mm"): string {
  return format(parseISO(iso), pattern, { locale: es });
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: es });
}

// ============================================================================
// Format — Distance / Duration
// ============================================================================

export function formatDistance(km: number | undefined): string {
  if (km === undefined || Number.isNaN(km)) return '—';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins} min`;
}

// ============================================================================
// Math — Time helpers
// ============================================================================

export function minutesBetween(startIso: string, endIso: string): number {
  return differenceInMinutes(parseISO(endIso), parseISO(startIso));
}

export function calculateReservationPrice(
  startIso: string,
  endIso: string,
  pricePerHour: number,
): number {
  const minutes = minutesBetween(startIso, endIso);
  if (minutes <= 0) return 0;
  // Cobro por hora completa hacia arriba (mínimo 1 hora)
  const hours = Math.ceil(minutes / 60);
  return hours * pricePerHour;
}

// ============================================================================
// Maps — Polyline decoder
// ============================================================================

/** Decodifica un `overviewPolyline` de Google a `LatLng[]` para dibujar en el mapa. */
export function decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  return polyline
    .decode(encoded)
    .map(([lat, lng]) => ({ lat, lng }));
}

// ============================================================================
// Validation helpers
// ============================================================================

/** "HH:MM" → minutos desde medianoche. */
export function timeStringToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Minutos desde medianoche → "HH:MM". */
export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ============================================================================
// Misc
// ============================================================================

export function truncate(text: string, max = 80): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function getInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
