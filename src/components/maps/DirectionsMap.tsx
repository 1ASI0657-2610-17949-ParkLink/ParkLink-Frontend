import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { Navigation } from 'lucide-react';
import { decodePolyline, cn } from '@/lib/utils';
import type { DirectionsResult } from '@/lib/types';

interface DirectionsMapProps {
  directions: DirectionsResult;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  className?: string;
}

export function DirectionsMap({ directions, origin, destination, className }: DirectionsMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'parklink-directions-map',
    googleMapsApiKey: apiKey,
  });

  const path = decodePolyline(directions.overviewPolyline);

  if (!apiKey || loadError || !isLoaded) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border border-border bg-bg-elevated p-8',
          className,
        )}
      >
        <Navigation className="size-8 text-fg-subtle mb-3" />
        <p className="text-sm text-fg-muted">
          {directions.distanceText} · {directions.durationText}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden rounded-xl border border-border', className)}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={origin}
        zoom={14}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        <Marker position={origin} label={{ text: 'A', color: '#fff', fontWeight: '700' }} />
        <Marker position={destination} label={{ text: 'B', color: '#fff', fontWeight: '700' }} />
        <Polyline
          path={path}
          options={{
            strokeColor: '#3ddbd9',
            strokeWeight: 4,
            strokeOpacity: 0.9,
          }}
        />
      </GoogleMap>
    </div>
  );
}
