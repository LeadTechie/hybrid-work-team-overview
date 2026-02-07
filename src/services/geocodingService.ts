/**
 * Geocoding service using Geoapify API
 * - Rate limited to 5 requests/second (free tier)
 * - Restricted to Germany (countrycode:de)
 * - API key provided by user at runtime (never bundled)
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
const API_KEY_STORAGE_KEY = 'geoapify_api_key';

// ============================================================
// API Key Management - stored in sessionStorage (cleared on tab close)
// ============================================================

/**
 * Get the stored API key from sessionStorage.
 * Returns null if no key is stored.
 */
export function getApiKey(): string | null {
  return sessionStorage.getItem(API_KEY_STORAGE_KEY);
}

/**
 * Store an API key in sessionStorage.
 * Key will be cleared when the browser tab is closed.
 */
export function setApiKey(key: string): void {
  sessionStorage.setItem(API_KEY_STORAGE_KEY, key);
}

/**
 * Remove the stored API key from sessionStorage.
 */
export function clearApiKey(): void {
  sessionStorage.removeItem(API_KEY_STORAGE_KEY);
}

/**
 * Check if an API key is currently stored.
 */
export function hasApiKey(): boolean {
  return !!getApiKey();
}

// ============================================================
// Geocoding Functions
// ============================================================

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
 * Batch geocode multiple addresses with explicit API key.
 * - Processes sequentially with rate limiting
 * - Calls onProgress for each address
 * - Returns results in same order as input
 * - Failed geocodes don't block the batch
 */
export async function batchGeocode(
  addresses: string[],
  apiKey: string,
  onProgress?: (progress: GeocodeProgress) => void
): Promise<GeocodeResult[]> {
  // If no API key provided, return all as failed
  if (!apiKey) {
    return addresses.map((address) => ({
      address,
      status: 'failed' as const,
      error: 'No API key provided',
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
 * Convenience wrapper that uses stored key from sessionStorage.
 * Use this when the user has already provided their API key via the consent modal.
 */
export async function batchGeocodeWithStoredKey(
  addresses: string[],
  onProgress?: (progress: GeocodeProgress) => void
): Promise<GeocodeResult[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return addresses.map((address) => ({
      address,
      status: 'failed' as const,
      error: 'No API key stored. Please enable accurate geocoding first.',
    }));
  }
  return batchGeocode(addresses, apiKey, onProgress);
}

/**
 * Geocode a single address using stored API key (convenience wrapper)
 */
export async function geocodeSingle(address: string): Promise<GeocodeResult> {
  const results = await batchGeocodeWithStoredKey([address]);
  return results[0];
}
