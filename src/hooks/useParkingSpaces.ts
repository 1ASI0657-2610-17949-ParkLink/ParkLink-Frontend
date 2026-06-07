import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import type { ParkingSpaceSearchParams, ParkingSpaceWithDistance } from '@/lib/types';

interface UseParkingSpacesResult {
  spaces: ParkingSpaceWithDistance[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  search: (params: ParkingSpaceSearchParams) => Promise<void>;
}

/**
 * Hook que carga estacionamientos. Si recibe `params` busca con filtros,
 * si no, devuelve el listado completo.
 */
export function useParkingSpaces(initialParams?: ParkingSpaceSearchParams): UseParkingSpacesResult {
  const [spaces, setSpaces] = useState<ParkingSpaceWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<ParkingSpaceSearchParams | undefined>(initialParams);

  async function fetchSpaces(searchParams?: ParkingSpaceSearchParams) {
    setIsLoading(true);
    setError(null);
    try {
      const hasFilters = searchParams && Object.keys(searchParams).length > 0;
      const data = hasFilters
        ? await apiGet<ParkingSpaceWithDistance[]>('/parking-spaces/search', searchParams as Record<string, unknown>)
        : await apiGet<ParkingSpaceWithDistance[]>('/parking-spaces');
      setSpaces(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar estacionamientos';
      setError(message);
      setSpaces([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchSpaces(params);
  }, []); // carga inicial; búsquedas posteriores usan search()

  async function refetch() {
    await fetchSpaces(params);
  }

  async function search(newParams: ParkingSpaceSearchParams) {
    setParams(newParams);
    await fetchSpaces(newParams);
  }

  return { spaces, isLoading, error, refetch, search };
}
