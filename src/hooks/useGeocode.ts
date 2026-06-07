import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import type { GeocodeResult } from '@/lib/types';

/**
 * Geocoding con debounce. Útil para previews en formularios.
 * Devuelve `null` mientras no hay resultados o mientras está cargando.
 */
export function useGeocode(address: string, debounceMs = 600): {
  result: GeocodeResult | null;
  isLoading: boolean;
  error: string | null;
} {
  const [result, setResult] = useState<GeocodeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = address.trim();
    if (trimmed.length < 4) {
      setResult(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    const handle = window.setTimeout(async () => {
      try {
        const data = await apiGet<GeocodeResult>('/maps/geocode', { address: trimmed });
        setResult(data);
        setError(null);
      } catch (err) {
        setResult(null);
        const message = err instanceof Error ? err.message : 'No se pudo geocodificar';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => window.clearTimeout(handle);
  }, [address, debounceMs]);

  return { result, isLoading, error };
}
