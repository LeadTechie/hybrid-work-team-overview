/**
 * Builds a Google Maps directions URL from origin to destination.
 *
 * @param origin - Starting coordinates
 * @param destination - Ending coordinates
 * @param travelMode - Travel mode for directions (default: 'driving')
 * @returns Google Maps directions URL
 */
export function buildGoogleMapsDirectionsUrl(
  origin: { lat: number; lon: number },
  destination: { lat: number; lon: number },
  travelMode: 'driving' | 'transit' | 'walking' | 'bicycling' = 'driving'
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lon}&destination=${destination.lat},${destination.lon}&travelmode=${travelMode}`;
}
