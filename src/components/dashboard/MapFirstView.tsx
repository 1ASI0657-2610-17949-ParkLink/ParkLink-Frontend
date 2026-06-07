import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { sileo } from 'sileo';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useParkingSpaces } from '@/hooks/useParkingSpaces';
import { toast } from '@/lib/toast';
import { MapView } from '@/components/maps/MapView';
import { MapFiltersBar } from '@/components/parking/MapFiltersBar';
import { useUIStore } from '@/store/ui-store';
import type { ParkingSpaceSearchParams } from '@/lib/types';

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
 * Vista principal del conductor autenticado.
 * Mapa fullscreen + filtros flotantes + geolocation.
 * El click en un pin abre el modal de detalle (parkingDetail en ui-store).
 *
 * - Cuando hay resultados, se muestra un bottom sheet minimalista con el count.
 * - Cuando NO hay resultados, se dispara un aviso (toast) de Sileo.
 */
export function MapFirstView() {
  const navigate = useNavigate();
  const openModal = useUIStore((s) => s.openModal);
  const geolocation = useGeolocation();
  const { spaces, isLoading, search } = useParkingSpaces();
  const lastSearchKey = useRef<string | null>(null);

  const [params, setParams] = useState<ParkingSpaceSearchParams>(() => ({
    ...DEFAULT_FILTERS,
    lat: geolocation.coords?.lat,
    lng: geolocation.coords?.lng,
  }));

  useEffect(() => {
    if (geolocation.coords && !params.lat) {
      const next: ParkingSpaceSearchParams = {
        ...params,
        lat: geolocation.coords.lat,
        lng: geolocation.coords.lng,
      };
      setParams(next);
      void search(next);
    }
  }, [geolocation.coords]); // eslint-disable-line react-hooks/exhaustive-deps

  // Toast persistente con el conteo de espacios disponibles (Sileo, abajo)
  // Se actualiza cuando cambian los resultados. Usamos sileo directo para
  // poder pasar duration=null (persistente, nunca se auto-descarta).
  const resultsToastRef = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    const key = JSON.stringify(params);
    if (lastSearchKey.current === key) return;
    lastSearchKey.current = key;

    // Descarta toast anterior si existe
    if (resultsToastRef.current) {
      sileo.dismiss(resultsToastRef.current);
      resultsToastRef.current = null;
    }

    if (spaces.length === 0) {
      // Sin resultados — toast warning con duración normal
      toast.warning('No hay espacios disponibles', {
        description: 'Ampliá la distancia máxima o cambiá los filtros.',
        duration: 6000,
      });
    } else {
      // Con resultados — toast info persistente (hasta que el usuario lo cierre o cambie la búsqueda)
      const msg = `${spaces.length} ${spaces.length === 1 ? 'espacio disponible' : 'espacios disponibles'}`;
      const id = sileo.info({
        title: msg,
        description: 'Tocá un pin en el mapa para ver el detalle',
        duration: null, // persistente
      });
      resultsToastRef.current = id;
    }
  }, [isLoading, spaces.length, params]);

  // Cleanup del toast persistente al desmontar
  useEffect(() => {
    return () => {
      if (resultsToastRef.current) {
        sileo.dismiss(resultsToastRef.current);
      }
    };
  }, []);

  function handleUseMyLocation() {
    if (!geolocation.coords) {
      geolocation.refetch();
      return;
    }
    const next: ParkingSpaceSearchParams = {
      ...params,
      lat: geolocation.coords.lat,
      lng: geolocation.coords.lng,
    };
    setParams(next);
    void search(next);
  }

  function handleSearch(newParams: ParkingSpaceSearchParams) {
    const merged: ParkingSpaceSearchParams = {
      ...newParams,
      lat: newParams.lat ?? geolocation.coords?.lat,
      lng: newParams.lng ?? geolocation.coords?.lng,
    };
    setParams(merged);
    void search(merged);
  }

  const handlePinClick = (id: string) => {
    openModal({ type: 'parkingDetail', parkingId: id });
  };

  function handleViewReservations() {
    navigate('/dashboard/reservations');
  }

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {/* Mapa fullscreen */}
      <div className="absolute inset-0">
        <MapView
          spaces={spaces}
          userLocation={geolocation.coords}
          centerOnUser={Boolean(geolocation.coords)}
          zoom={geolocation.coords ? 14 : 12}
          className="h-full w-full rounded-none border-0"
          onPinClick={handlePinClick}
        />
      </div>

      {/* Barra flotante de búsqueda + filtros */}
      <MapFiltersBar
        onSearch={handleSearch}
        initial={params}
        hasUserLocation={Boolean(geolocation.coords)}
        isLocating={geolocation.isLoading}
        onUseMyLocation={handleUseMyLocation}
        onViewReservations={handleViewReservations}
      />

      {/* Banner de error de geolocation (no bloqueante) */}
      {geolocation.isDenied && (
        <div className="pointer-events-none absolute top-20 sm:top-24 left-4 right-4 z-10 flex justify-center">
          <div className="pointer-events-auto max-w-md rounded-lg border border-warning/40 bg-bg-elevated/95 backdrop-blur-md px-3 py-2 text-xs text-warning flex items-center gap-2 shadow-lg">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{geolocation.error ?? 'Activá la geolocalización para ver estacionamientos cerca tuyo.'}</span>
            <button
              type="button"
              onClick={geolocation.refetch}
              className="ml-auto font-semibold underline hover:no-underline"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
