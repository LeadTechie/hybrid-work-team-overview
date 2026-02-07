/**
 * Calculate the straight-line (haversine) distance between two coordinates in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * When useRoadEstimate is true, applies circuity factor and formats with ~ prefix
 */
export function formatDistance(km: number | null, useRoadEstimate?: boolean): string {
  if (km === null) return '—';

  if (!useRoadEstimate) {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  }

  // Apply circuity factor for road estimate
  const roadKm = estimateRoadDistance(km);

  // Round based on magnitude for appropriate precision
  if (roadKm < 10) {
    return `~${Math.max(1, Math.round(roadKm))} km`;
  } else if (roadKm < 100) {
    return `~${Math.round(roadKm / 5) * 5} km`;
  } else {
    return `~${Math.round(roadKm / 10) * 10} km`;
  }
}

// Circuity factor constants (distance-dependent, research-backed for Germany/Europe)
// Based on Mennicken, Lemoy & Caruso 2024; average 1.343
const CIRCUITY_FACTOR_SHORT = 1.4;   // < 20km straight-line (urban, local roads)
const CIRCUITY_FACTOR_MEDIUM = 1.35; // 20-100km (mixed roads)
const CIRCUITY_FACTOR_LONG = 1.25;   // > 100km (mostly Autobahn)

/**
 * Get the circuity factor for a given straight-line distance.
 * Returns a multiplier to estimate road distance from haversine distance.
 */
export function getCircuityFactor(straightLineKm: number): number {
  if (straightLineKm < 20) return CIRCUITY_FACTOR_SHORT;
  if (straightLineKm <= 100) return CIRCUITY_FACTOR_MEDIUM;
  return CIRCUITY_FACTOR_LONG;
}

/**
 * Estimate road distance from straight-line (haversine) distance.
 * Applies a distance-dependent circuity factor.
 */
export function estimateRoadDistance(straightLineKm: number): number {
  return straightLineKm * getCircuityFactor(straightLineKm);
}
