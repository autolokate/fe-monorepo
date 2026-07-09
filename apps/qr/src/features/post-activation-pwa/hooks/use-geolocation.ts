import { useCallback, useEffect, useRef, useState } from 'react';

import { reverseGeocodeLocation } from '../utils/reverse-geocode';

export type GeoResult = {
  lat: number;
  lng: number;
  name: string | null;
};

export type GeoErrorKind = 'denied' | 'unavailable' | null;

export function useGeolocationCapture() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<GeoErrorKind>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const requestLocation = useCallback((): Promise<GeoResult | null> => {
    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        if (mountedRef.current) {
          setError('unavailable');
          setLoading(false);
        }
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          void (async () => {
            const point = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            const name = await reverseGeocodeLocation(point);
            if (mountedRef.current) {
              setLoading(false);
            }
            resolve({ ...point, name });
          })();
        },
        (geoError) => {
          if (!mountedRef.current) {
            resolve(null);
            return;
          }
          setLoading(false);
          setError(geoError.code === geoError.PERMISSION_DENIED ? 'denied' : 'unavailable');
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
      );
    });
  }, []);

  return { requestLocation, loading, error };
}

export async function requestMediaPermissions(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach((track) => {
      track.stop();
    });
    return true;
  } catch {
    return false;
  }
}
