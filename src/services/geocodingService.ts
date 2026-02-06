/**
 * Geocoding service using Geoapify API
 * - Rate limited to 5 requests/second (free tier)
 * - Restricted to Germany (countrycode:de)
 * - Graceful error handling - failed geocodes don't block batch
 */

export interface GeocodeResult {
  address: string;
  coords?: { lat: number; lon: number };
  status: 'success' | 'failed';
  error?: string;
}

export interface GeocodeProgress {
  current: number;
  total: number;
  address: string;
  status: 'processing' | 'success' | 'failed';
}

const GEOAPIFY_ENDPOINT = 'https://api.geoapify.com/v1/geocode/search';
const RATE_LIMIT_DELAY_MS = 200; // 5 requests per second = 200ms between requests

/**
 * Geocode a single address using Geoapify
 */
async function geocodeAddress(
  address: string,
  apiKey: string
): Promise<GeocodeResult> {
  try {
    const params = new URLSearchParams({
      text: address,
      filter: 'countrycode:de',
      limit: '1',
      apiKey,
    });

    const response = await fetch(`${GEOAPIFY_ENDPOINT}?${params}`);

    if (!response.ok) {
      return {
        address,
        status: 'failed',
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lon, lat] = data.features[0].geometry.coordinates;
      return {
        address,
        coords: { lat, lon },
        status: 'success',
      };
    }

    return {
      address,
      status: 'failed',
      error: 'No results found for address',
    };
  } catch (error) {
    return {
      address,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delay helper for rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Batch geocode multiple addresses
 * - Processes sequentially with rate limiting
 * - Calls onProgress for each address
 * - Returns results in same order as input
 * - Failed geocodes don't block the batch
 */
export async function batchGeocode(
  addresses: string[],
  onProgress?: (progress: GeocodeProgress) => void
): Promise<GeocodeResult[]> {
  // Read API key from environment (safely handle missing import.meta.env)
  const apiKey = typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_GEOAPIFY_KEY
    : undefined;

  // If no API key, return all as failed
  if (!apiKey) {
    return addresses.map((address) => ({
      address,
      status: 'failed' as const,
      error: 'No API key configured',
    }));
  }

  const results: GeocodeResult[] = [];

  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];

    // Call progress callback - processing
    onProgress?.({
      current: i + 1,
      total: addresses.length,
      address,
      status: 'processing',
    });

    // Geocode the address
    const result = await geocodeAddress(address, apiKey);
    results.push(result);

    // Call progress callback - result
    onProgress?.({
      current: i + 1,
      total: addresses.length,
      address,
      status: result.status,
    });

    // Rate limiting - wait before next request (except for last one)
    if (i < addresses.length - 1) {
      await delay(RATE_LIMIT_DELAY_MS);
    }
  }

  return results;
}

/**
 * Geocode a single address (convenience wrapper)
 */
export async function geocodeSingle(address: string): Promise<GeocodeResult> {
  const results = await batchGeocode([address]);
  return results[0];
}
