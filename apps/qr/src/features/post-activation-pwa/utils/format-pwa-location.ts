import type { PwaGeoPoint } from '../context/pwa-scan-types.js';

/** Location chip / map card — human-readable place when available. */
export function formatPwaLocationLabel(
  location: PwaGeoPoint | null,
  denied = false,
  locationName: string | null = null,
): string {
  if (denied) {
    return 'Location unavailable';
  }
  if (!location) {
    return 'Turn on location';
  }
  if (locationName) {
    return locationName;
  }
  return 'Finding your location…';
}

/** Secondary line on capture cards — place name once resolved. */
export function formatPwaLocationDetail(
  location: PwaGeoPoint | null,
  locationName: string | null = null,
): string | undefined {
  if (!location) {
    return undefined;
  }
  if (locationName) {
    return locationName;
  }
  return 'Finding your location…';
}

/** Coordinate fallback for diagnostics only — not shown in UI. */
export function formatPwaLocationCoordinates(location: PwaGeoPoint | null): string | undefined {
  if (!location) {
    return undefined;
  }
  const lat = location.lat.toFixed(4);
  const lng = Math.abs(location.lng).toFixed(4);
  const latHem = location.lat >= 0 ? 'N' : 'S';
  const lngHem = location.lng >= 0 ? 'E' : 'W';
  return `${lat}° ${latHem}, ${lng}° ${lngHem}`;
}
