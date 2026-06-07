import { create } from 'zustand';
import { RESERVATION_STATUS, type ReservationRecord } from '@/lib/types';

interface ReservationCacheState {
  recentReservations: ReservationRecord[];
  upsertReservation: (reservation: ReservationRecord) => void;
  upsertReservations: (reservations: ReservationRecord[]) => void;
  markReservationConfirmed: (reservationId: string) => void;
  removeReservation: (reservationId: string) => void;
}

function sortReservations(reservations: ReservationRecord[]): ReservationRecord[] {
  return [...reservations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function mergeReservations(
  current: ReservationRecord[],
  incoming: ReservationRecord[],
): ReservationRecord[] {
  const byId = new Map<string, ReservationRecord>();

  for (const reservation of current) {
    byId.set(reservation.id, reservation);
  }

  for (const reservation of incoming) {
    byId.set(reservation.id, reservation);
  }

  return sortReservations([...byId.values()]);
}

export const useReservationCacheStore = create<ReservationCacheState>((set) => ({
  recentReservations: [],

  upsertReservation: (reservation) =>
    set((state) => ({
      recentReservations: mergeReservations(state.recentReservations, [reservation]),
    })),

  upsertReservations: (reservations) =>
    set((state) => ({
      recentReservations: mergeReservations(state.recentReservations, reservations),
    })),

  markReservationConfirmed: (reservationId) =>
    set((state) => ({
      recentReservations: state.recentReservations.map((reservation) =>
        reservation.id === reservationId
          ? {
              ...reservation,
              status: RESERVATION_STATUS.CONFIRMED,
              updatedAt: new Date().toISOString(),
            }
          : reservation,
      ),
    })),

  removeReservation: (reservationId) =>
    set((state) => ({
      recentReservations: state.recentReservations.filter(
        (reservation) => reservation.id !== reservationId,
      ),
    })),
}));

export function mergeReservationLists(
  remoteReservations: ReservationRecord[],
  cachedReservations: ReservationRecord[],
): ReservationRecord[] {
  return mergeReservations(cachedReservations, remoteReservations);
}
