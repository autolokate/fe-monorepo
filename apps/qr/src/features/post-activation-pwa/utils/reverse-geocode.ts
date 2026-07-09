import type { PwaGeoPoint } from '../context/pwa-scan-types.js';

type BigDataCloudReverseGeocode = {
  locality?: string;
  city?: string;
  principalSubdivision?: string;
};

/** Resolve GPS coordinates to a human-readable place label (e.g. "Andheri West, Mumbai"). */
export async function reverseGeocodeLocation(point: PwaGeoPoint): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      latitude: String(point.lat),
      longitude: String(point.lng),
      localityLanguage: 'en',
    });
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?${params.toString()}`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as BigDataCloudReverseGeocode;
    return formatReverseGeocodeLabel(data);
  } catch {
    return null;
  }
}

function formatReverseGeocodeLabel(data: BigDataCloudReverseGeocode): string | null {
  const locality = data.locality?.trim();
  const city = data.city?.trim();
  const region = data.principalSubdivision?.trim();

  if (locality && city && locality.toLowerCase() !== city.toLowerCase()) {
    return `${locality}, ${city}`;
  }
  if (city && region && city.toLowerCase() !== region.toLowerCase()) {
    return `${city}, ${region}`;
  }
  if (city) {
    return city;
  }
  if (locality) {
    return locality;
  }
  if (region) {
    return region;
  }
  return null;
}
