import { GERMAN_POSTCODES } from '../data/germanPostcodes';

export interface LocalGeocodeResult {
  postcode: string;
  coords: { lat: number; lon: number } | null;
  city: string | null;
  accuracy: 'postcode-centroid';
}

/**
 * Geocode using bundled postcode data - NO external requests.
 * Returns centroid coordinates for the postcode area (~5km accuracy).
 */
export function geocodeByPostcode(postcode: string): LocalGeocodeResult {
  // Normalize: remove spaces, ensure 5 digits
  const normalized = postcode.trim().replace(/\s/g, '');
  const data = GERMAN_POSTCODES[normalized];

  return {
    postcode: normalized,
    coords: data ? { lat: data.lat, lon: data.lon } : null,
    city: data?.place ?? null,
    accuracy: 'postcode-centroid',
  };
}

/**
 * Batch geocode multiple postcodes - all synchronous, no network.
 */
export function batchGeocodeByPostcode(postcodes: string[]): LocalGeocodeResult[] {
  return postcodes.map(geocodeByPostcode);
}

/**
 * Check if a postcode exists in the bundled data.
 */
export function isValidPostcode(postcode: string): boolean {
  const normalized = postcode.trim().replace(/\s/g, '');
  return normalized in GERMAN_POSTCODES;
}
