import { useEffect, useState } from 'react';

interface GeolocationState {
  /** Latitud / longitud del usuario, o `null` si todavía no se obtuvo. */
  coords: { lat: number; lng: number } | null;
  /** `true` mientras se pide permiso / se obtiene la posición. */
  isLoading: boolean;
  /** Mensaje de error si el browser negó permiso o falló. */
  error: string | null;
  /** Si el browser negó permiso o no hay API. */
  isDenied: boolean;
  /** Vuelve a pedir permiso manualmente. */
  refetch: () => void;
}

const PERMISSION_DENIED = 'Permiso de ubicación denegado. Activá la geolocalización para ver estacionamientos cerca tuyo.';
const POSITION_UNAVAILABLE = 'No pudimos obtener tu ubicación.';
const TIMEOUT = 'La solicitud de ubicación tardó demasiado.';

/**
 * Pide la geolocalización del usuario una sola vez al montar.
 * Si el browser no tiene la API o el usuario denegó, setea `isDenied = true`.
 */
export function useGeolocation(): GeolocationState {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDenied, setIsDenied] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setError('Tu navegador no soporta geolocalización.');
      setIsDenied(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLoading(false);
      },
      (err) => {
        setIsDenied(err.code === err.PERMISSION_DENIED);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError(PERMISSION_DENIED);
            break;
          case err.POSITION_UNAVAILABLE:
            setError(POSITION_UNAVAILABLE);
            break;
          case err.TIMEOUT:
            setError(TIMEOUT);
            break;
          default:
            setError('Error desconocido al obtener tu ubicación.');
        }
        setIsLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }, [tick]);

  return {
    coords,
    isLoading,
    error,
    isDenied,
    refetch: () => setTick((n) => n + 1),
  };
}
