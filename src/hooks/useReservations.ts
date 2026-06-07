import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import {
  mergeReservationLists,
  useReservationCacheStore,
} from '@/store/reservation-cache-store';
import type { ReservationRecord } from '@/lib/types';

interface UseReservationsResult {
  reservations: ReservationRecord[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReservations(): UseReservationsResult {
  const cachedReservations = useReservationCacheStore((state) => state.recentReservations);
  const upsertReservations = useReservationCacheStore((state) => state.upsertReservations);
  const [remoteReservations, setRemoteReservations] = useState<ReservationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchReservations() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGet<ReservationRecord[]>('/reservations/my');
      setRemoteReservations(data);
      upsertReservations(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar reservas';
      setError(message);
      setRemoteReservations([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchReservations();
  }, []);

  const reservations = mergeReservationLists(remoteReservations, cachedReservations);

  return { reservations, isLoading, error, refetch: fetchReservations };
}
