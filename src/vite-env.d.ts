/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '@mapbox/polyline' {
  interface PolylineCodec {
    decode(encoded: string, precision?: number): Array<[number, number]>;
    encode(coordinates: Array<[number, number]>, precision?: number): string;
  }

  const polyline: PolylineCodec;
  export default polyline;
}
