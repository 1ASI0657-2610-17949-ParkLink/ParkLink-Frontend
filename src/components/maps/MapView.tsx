import { Circle, GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Compass, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ParkingSpaceWithDistance } from '@/lib/types';

const LIBRARIES: ('places')[] = ['places'];

const containerStyle = {
  width: '100%',
  height: '100%',
};

const darkMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#737373' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#a3a3a3' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#737373' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#111111' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#161616' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0a0a0a' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#a3a3a3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1f1f1f' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#0a0a0a' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#111111' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1a1f' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#525252' }] },
];

interface MapViewProps {
  spaces: ParkingSpaceWithDistance[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  /** Click en un pin → abre modal (no navega). */
  onPinClick?: (id: string) => void;
  /** Ubicación del usuario (marker distintivo). */
  userLocation?: { lat: number; lng: number } | null;
  /** Si true, centra el mapa en `userLocation`. */
  centerOnUser?: boolean;
}

/**
 * Construye un SVG premium para marcadores de Google Maps.
 * Diseño editorial: tipografía nítida, jerarquía visual, sombras suaves, estado semántico.
 */
function buildMarkerSvgUrl(space: ParkingSpaceWithDistance): string {
  const statusColor = getStatusHex(space.status);
  const available = space.status === 'AVAILABLE';
  const price = `S/.${space.pricePerHour.toFixed(0)}`;
  const opacity = available ? '1' : '0.65';
  const statusLabel = getStatusLabel(space.status);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="64" viewBox="0 0 128 64" fill="none">
      <defs>
        <!-- Sombra suave estilo material elevation -->
        <filter id="elevation" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.25"/>
        </filter>
        <!-- Glow sutil para AVAILABLE -->
        <filter id="glow-available" x="-30%" y="-30%" width="160%" height="160%" filterUnits="objectBoundingBox">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <g opacity="${opacity}">
        <!-- Cuerpo principal del pin con elevación -->
        <g filter="url(#elevation)${available ? ' url(#glow-available)' : ''}">
          <!-- Pin background - forma orgánica redondeada -->
          <path 
            d="M64 58 L74 42 Q74 30 64 30 Q54 30 54 42 L64 58 Z" 
            fill="#0d0d0d" 
            stroke="${statusColor}" 
            stroke-width="2"
            stroke-linejoin="round"
          />
          
          <!-- Badge de estado - círculo semántico -->
          <circle cx="64" cy="36" r="14" fill="#0d0d0d" stroke="${statusColor}" stroke-width="2"/>
          <circle cx="64" cy="36" r="9" fill="${statusColor}"/>
          
          <!-- Icono de estado dentro del círculo -->
          ${getStatusIcon(statusColor)}
          
          <!-- Precio - tipografía editorial, legible a distancia -->
          <text 
            x="64" 
            y="22" 
            fill="#ffffff" 
            font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
            font-size="15" 
            font-weight="700" 
            text-anchor="middle"
            dominant-baseline="middle"
            paint-order="stroke fill"
            stroke="#000000"
            stroke-width="4"
          >${escapeSvgText(price)}</text>
          <text 
            x="64" 
            y="22" 
            fill="#ffffff" 
            font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
            font-size="15" 
            font-weight="700" 
            text-anchor="middle"
            dominant-baseline="middle"
          >${escapeSvgText(price)}</text>
          
          <!-- Label de estado opcional (para debugging/accesibilidad) -->
          <text 
            x="64" 
            y="50" 
            fill="${statusColor}" 
            font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
            font-size="9" 
            font-weight="600" 
            text-anchor="middle"
            text-transform="uppercase"
            letter-spacing="0.5"
          >${escapeSvgText(statusLabel)}</text>
        </g>
        
        <!-- Pulso sutil solo para AVAILABLE (animación CSS via SMIL) -->
        ${available ? `
        <animate 
          attributeName="opacity" 
          values="1;0.7;1" 
          dur="2.5s" 
          repeatCount="indefinite"
          begin="0.5s"
        />` : ''}
      </g>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getStatusLabel(status: ParkingSpaceWithDistance['status']): string {
  switch (status) {
    case 'AVAILABLE': return 'Libre';
    case 'RESERVED': return 'Reservado';
    case 'OCCUPIED': return 'Ocupado';
    case 'DISABLED': return 'Inactivo';
    default: return 'Desconocido';
  }
}

function getStatusIcon(color: string): string {
  // Checkmark para disponible, reloj para reservado, X para ocupado, línea para inactivo
  const icons: Record<string, string> = {
    '#4ade80': `<path d="M58 34 L62 38 L70 30" fill="none" stroke="#0d0d0d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    '#fbbf24': `<circle cx="64" cy="36" r="5" fill="none" stroke="#0d0d0d" stroke-width="2" stroke-dasharray="2 2"/>`,
    '#f87171': `<path d="M58 31 L70 41 M70 31 L58 41" fill="none" stroke="#0d0d0d" stroke-width="2.5" stroke-linecap="round"/>`,
    '#737373': `<path d="M56 36 L72 36" fill="none" stroke="#0d0d0d" stroke-width="2.5" stroke-linecap="round"/>`,
  };
  return icons[color] || '';
}

function escapeSvgText(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function getStatusHex(status: ParkingSpaceWithDistance['status']): string {
  switch (status) {
    case 'AVAILABLE': return '#4ade80';
    case 'RESERVED': return '#fbbf24';
    case 'OCCUPIED': return '#f87171';
    case 'DISABLED': return '#737373';
    default: return '#2dd4bf';
  }
}

export function MapView({
  spaces,
  center,
  zoom = 13,
  className,
  onPinClick,
  userLocation,
  centerOnUser = false,
}: MapViewProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'parklink-google-map',
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  const mapCenter = getMapCenter({ spaces, center, userLocation, centerOnUser });

  function handleMarkerClick(id: string) {
    onPinClick?.(id);
  }

  if (!apiKey) {
    return (
      <MapFallback
        className={className}
        message="Configurá VITE_GOOGLE_MAPS_API_KEY para ver el mapa interactivo"
      />
    );
  }

  if (loadError) {
    return (
      <MapFallback className={className} message="No pudimos cargar Google Maps" />
    );
  }

  if (!isLoaded) {
    return <MapFallback className={className} message="Cargando mapa…" loading />;
  }

  return (
    <div className={cn('relative overflow-hidden bg-bg', className)}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={zoom}
        options={{
          styles: darkMapStyle,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          backgroundColor: '#0a0a0a',
        }}
      >
        {/* Pines de estacionamientos — diseño editorial premium */}
        {spaces.map((space) => (
          <Marker
            key={space.id}
            position={{ lat: space.latitude, lng: space.longitude }}
            onClick={() => handleMarkerClick(space.id)}
            icon={{
              url: buildMarkerSvgUrl(space),
              anchor: new google.maps.Point(64, 58),
              origin: new google.maps.Point(0, 0),
              scaledSize: new google.maps.Size(128, 64),
            }}
            zIndex={10}
            title={`${getStatusLabel(space.status)} • S/.${space.pricePerHour.toFixed(0)}/h`}
          />
        ))}

        {/* Dot de ubicación del usuario — símbolo nativo + halo */}
        {userLocation && (
          <>
            <Circle
              center={userLocation}
              radius={90}
              options={{
                clickable: false,
                fillColor: '#2dd4bf',
                fillOpacity: 0.14,
                strokeColor: '#2dd4bf',
                strokeOpacity: 0.42,
                strokeWeight: 1,
              }}
            />
            <Marker
              position={userLocation}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#2dd4bf',
                fillOpacity: 1,
                strokeColor: '#fafafa',
                strokeOpacity: 1,
                strokeWeight: 3,
                scale: 8,
              }}
              zIndex={30}
              title="Tu ubicación"
            />
          </>
        )}
      </GoogleMap>
    </div>
  );
}

interface GetMapCenterParams {
  spaces: ParkingSpaceWithDistance[];
  center?: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number } | null;
  centerOnUser: boolean;
}

function getMapCenter({
  spaces,
  center,
  userLocation,
  centerOnUser,
}: GetMapCenterParams) {
  if (centerOnUser && userLocation) return userLocation;
  if (center) return center;
  if (userLocation) return userLocation;
  if (spaces.length > 0 && spaces[0]) {
    return { lat: spaces[0].latitude, lng: spaces[0].longitude };
  }
  return { lat: -12.046374, lng: -77.042793 };
}

interface MapFallbackProps {
  className?: string;
  message: string;
  loading?: boolean;
}

function MapFallback({ className, message, loading = false }: MapFallbackProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'bg-bg-elevated border border-border',
        className,
      )}
    >
      {loading ? (
        <Navigation className="size-8 text-primary animate-pulse mb-3" />
      ) : (
        <Compass className="size-8 text-fg-subtle mb-3" />
      )}
      <p className="text-sm text-fg-muted px-4">{message}</p>
    </div>
  );
}
