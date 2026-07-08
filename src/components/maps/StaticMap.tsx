import { cn } from '@/lib/utils';
import { BASE_URL } from '@/lib/api';

interface StaticMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
}

/**
 * Imagen estática del mapa servida por el backend.
 * No requiere API key del lado del cliente — el backend hace de proxy.
 */
export function StaticMap({
  lat,
  lng,
  zoom = 15,
  width = 400,
  height = 200,
  className,
  alt = 'Mapa de ubicación',
}: StaticMapProps) {
  const params = new URLSearchParams({
    centerLat: String(lat),
    centerLng: String(lng),
    zoom: String(zoom),
    width: String(width),
    height: String(height),
  });
  const src = `${BASE_URL}/maps/static-map?${params.toString()}`;

  return (
    <div className={cn('relative overflow-hidden bg-bg-subtle', className)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover"
        onError={(e) => {
          // Si el backend no devuelve la imagen, mostramos un fallback decorativo
          e.currentTarget.style.display = 'none';
        }}
      />
      {/* Fallback visual: si la imagen no carga, queda este pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 mesh-bg"
      />
    </div>
  );
}
