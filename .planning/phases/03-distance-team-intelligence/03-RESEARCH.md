# Phase 3: Distance & Team Intelligence - Research

**Researched:** 2026-02-07
**Domain:** Geospatial distance calculation, commute estimation, team co-location analysis
**Confidence:** MEDIUM (novel territory - no standard library for offline road distances in browser)

## Summary

This phase upgrades from straight-line (haversine) distances to approximate road distances and driving times, adds team co-location analysis, and optionally provides rail time estimates. The core research question was: **can we do road routing entirely client-side without external APIs?**

**Answer: True client-side road routing is not feasible** for this use case. No production-ready WASM-compiled routing engine exists for the browser (OSRM, Valhalla, GraphHopper are all server-side only). The Germany road network graph has 11.5M nodes / 12.4M edges - even compressed to 57MB, this is impractical to load in a browser for an app where routing is a secondary feature. The A* pathfinding in WASM becomes "very sluggish" even for Greater London-sized areas.

**However, the privacy requirement is fully achievable** through a different architecture: **pre-computed lookup tables + circuity factor estimation**. Since we only need distances from ~8,200 postcodes to 5 offices, the actual data matrix is tiny (~120KB gzip). This can be generated offline using a self-hosted OSRM/OpenRouteService instance and bundled as static data - no runtime API calls, full privacy.

**Primary recommendation:** Use a two-tier approach: (1) circuity-factor-adjusted haversine for instant estimates (zero data overhead), (2) optional pre-computed OSRM distance matrix for road-accurate distances (generated offline, bundled as static data, ~120-400KB). Rail times are deferred - GTFS data is too large and DB APIs require external calls.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| (existing) haversine | n/a | Straight-line distance | Already implemented in `src/utils/distance.ts` |
| Circuity factor math | n/a | Road distance estimation | Pure math - multiply haversine by 1.3-1.4, no library needed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none new) | - | - | All computation uses existing haversine + arithmetic |

### Build-Time Tools (NOT bundled in app)

| Tool | Purpose | When to Use |
|------|---------|-------------|
| OSRM Docker (`osrm/osrm-backend`) | Generate pre-computed distance matrix | One-time offline data generation script |
| Geofabrik Germany extract | OSM road data for OSRM | Input for OSRM processing |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Circuity factor | Full OSRM in WASM | Impossible - no WASM build exists, 57MB+ data |
| Circuity factor | Client-side GraphHopper | Old TeaVM experiment (2014), not maintained, impractical data sizes |
| Circuity factor | Valhalla in browser | No WASM build exists; Valhalla is C++ server-side only |
| Pre-computed matrix | Runtime API calls to OSRM/ORS | Violates privacy requirement (CSP blocks external API calls) |
| Pre-computed matrix | Google/HERE Distance Matrix API | Commercial, requires API calls, privacy violation |
| Bundled GTFS data | Rail time estimation | Germany GTFS is massive (500K+ stops, 2M journeys), parsing in browser impractical |
| hafas-client / db-vendo-client | DB journey queries | Requires external API calls to DB servers, no CORS support in browser |

**Installation:**
```bash
# No new npm packages needed for the app itself
# For offline data generation (developer tooling only):
# docker pull osrm/osrm-backend
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── utils/
│   ├── distance.ts              # Existing haversine + NEW road distance estimation
│   └── distanceTypes.ts         # Distance result types (straight-line, road estimate, road actual)
├── data/
│   ├── germanPostcodes.ts       # Existing postcode centroids
│   └── roadDistanceMatrix.ts    # NEW: Pre-computed office distances (optional, generated offline)
├── services/
│   └── distanceService.ts       # NEW: Orchestrates distance calculations with fallback chain
├── components/
│   ├── tables/
│   │   └── EmployeesTable.tsx   # Updated to show road distances + nearest office
│   │   └── TeamAnalysis.tsx     # NEW: Team co-location analysis view
│   └── map/
│       └── DistanceLines.tsx    # Updated to show road distance labels
└── hooks/
    └── useDistanceCalculation.ts # NEW: Hook for distance computation with memoization
```

### Pattern 1: Distance Calculation Fallback Chain

**What:** Multi-tier distance calculation that uses the best available data
**When to use:** Every distance computation in the app

```typescript
// Distance calculation priority:
// 1. Pre-computed road distance (if matrix loaded) -> HIGH accuracy
// 2. Circuity-adjusted haversine -> MEDIUM accuracy (~85-90% of road distance)
// 3. Raw haversine (straight-line) -> LOW accuracy (baseline)

interface DistanceResult {
  straightLine: number;        // km, haversine
  roadEstimate: number;        // km, haversine * circuity factor
  roadActual: number | null;   // km, from pre-computed matrix (null if not available)
  driveTimeEstimate: number;   // minutes, from road distance / average speed
  driveTimeActual: number | null; // minutes, from pre-computed matrix
  accuracy: 'actual' | 'estimated' | 'straight-line';
  source: 'precomputed' | 'circuity' | 'haversine';
}

function calculateRoadDistance(
  fromPostcode: string,
  toOfficeId: string,
  straightLineKm: number,
  matrix: RoadDistanceMatrix | null
): DistanceResult {
  // Tier 1: Check pre-computed matrix
  if (matrix) {
    const entry = matrix[fromPostcode]?.[toOfficeId];
    if (entry) {
      return {
        straightLine: straightLineKm,
        roadEstimate: straightLineKm * CIRCUITY_FACTOR,
        roadActual: entry.distanceKm,
        driveTimeEstimate: estimateDriveTime(entry.distanceKm),
        driveTimeActual: entry.durationMin,
        accuracy: 'actual',
        source: 'precomputed',
      };
    }
  }

  // Tier 2: Circuity-adjusted estimate
  const roadEstimate = straightLineKm * CIRCUITY_FACTOR;
  return {
    straightLine: straightLineKm,
    roadEstimate,
    roadActual: null,
    driveTimeEstimate: estimateDriveTime(roadEstimate),
    driveTimeActual: null,
    accuracy: 'estimated',
    source: 'circuity',
  };
}
```

### Pattern 2: Circuity Factor with Distance-Dependent Adjustment

**What:** Apply empirically-validated multiplier to convert straight-line to road distance
**When to use:** Default road distance estimation

```typescript
// Research-backed circuity factors for Germany/Europe:
// - European average: 1.343 (Mennicken, Lemoy, Caruso 2024)
// - Germany logistics approximation: 1.3 (Ballou et al. 2002)
// - European intercity average: 1.46
// - Short distances (<10km): higher circuity ~1.4-1.6
// - Long distances (>100km): lower circuity ~1.2-1.3

const CIRCUITY_FACTOR_SHORT = 1.4;  // < 20km (urban, local roads)
const CIRCUITY_FACTOR_MEDIUM = 1.35; // 20-100km (mixed roads)
const CIRCUITY_FACTOR_LONG = 1.25;   // > 100km (mostly Autobahn)

function getCircuityFactor(straightLineKm: number): number {
  if (straightLineKm < 20) return CIRCUITY_FACTOR_SHORT;
  if (straightLineKm < 100) return CIRCUITY_FACTOR_MEDIUM;
  return CIRCUITY_FACTOR_LONG;
}

function estimateRoadDistance(straightLineKm: number): number {
  return straightLineKm * getCircuityFactor(straightLineKm);
}
```

### Pattern 3: Drive Time Estimation from Road Distance

**What:** Convert road distance to drive time using average speeds
**When to use:** Driving time display

```typescript
// German speed context:
// - Urban (< 20km road distance): ~30 km/h average (traffic, lights)
// - Suburban/mixed (20-80km): ~60 km/h average
// - Autobahn-heavy (> 80km): ~90 km/h average (includes exits, merges)
// - Motorway median speed: 83.4 km/h (actual measurement)
// - Practical rule: ~1 hour per 100km for Autobahn journeys

function estimateDriveTime(roadDistanceKm: number): number {
  if (roadDistanceKm < 20) {
    return (roadDistanceKm / 30) * 60; // minutes
  }
  if (roadDistanceKm < 80) {
    return (roadDistanceKm / 60) * 60; // minutes
  }
  return (roadDistanceKm / 90) * 60; // minutes
}
```

### Pattern 4: Team Co-location Analysis

**What:** Aggregate commute metrics per team and simulate office reassignment impact
**When to use:** Team analysis view (TEAM-01, TEAM-02, TEAM-03)

```typescript
interface TeamAnalysis {
  teamName: string;
  memberCount: number;
  avgDistanceToNearest: number;    // km, average distance to nearest office
  avgDistanceToCurrent: number;    // km, average distance to assigned office
  suggestedOffice: string;         // office that minimizes total team distance
  savingsKm: number;              // total km saved if team moved to suggested
  coverageByRadius: {              // % of members within X km
    within25km: number;
    within50km: number;
    within100km: number;
  };
}

function analyzeTeam(
  employees: Employee[],
  offices: Office[],
  distanceFn: (emp: Employee, office: Office) => DistanceResult
): TeamAnalysis {
  // For each office, compute total team commute
  // Suggest the office with lowest total
  // Compute coverage percentages
}
```

### Pattern 5: Pre-computed Matrix Data Format

**What:** Compact bundled lookup table format
**When to use:** Optional high-accuracy road distances

```typescript
// Format: postcode -> office distances
// Generated offline by OSRM, bundled as static TypeScript
interface RoadDistanceEntry {
  d: number;  // distance in km (1 decimal)
  t: number;  // drive time in minutes (integer)
}

// Keyed by postcode, then office postcode
// ~8,200 postcodes x 5 offices = ~41,000 entries
// At ~10 bytes per entry = ~400KB uncompressed, ~120KB gzip
type RoadDistanceMatrix = Record<string, Record<string, RoadDistanceEntry>>;

// Example:
const ROAD_DISTANCES: RoadDistanceMatrix = {
  "01067": {
    "60311": { d: 478.2, t: 302 },  // Dresden -> Frankfurt
    "10117": { d: 193.4, t: 118 },  // Dresden -> Berlin
    "80539": { d: 461.7, t: 285 },  // Dresden -> Munich
    "20354": { d: 476.1, t: 298 },  // Dresden -> Hamburg
    "40212": { d: 571.3, t: 342 },  // Dresden -> Duesseldorf
  },
  // ... ~8,199 more postcodes
};
```

### Anti-Patterns to Avoid

- **Running OSRM/Valhalla in the browser:** No WASM builds exist. The Germany road graph is 57MB compressed (11.5M nodes). Do not attempt this.
- **Calling external routing APIs at runtime:** Violates CSP and privacy requirements. All distance data must be bundled or computed locally.
- **Full N*N postcode matrix:** 8,200 x 8,200 = 67M pairs = ~500MB. Only compute postcode-to-office pairs.
- **Bundling GTFS data:** Germany's full GTFS has 500K+ stops and 2M journeys. The stop_times.txt alone can be gigabytes. Do not bundle.
- **Using hafas-client/db-vendo-client in browser:** These require external API calls to DB servers and have no CORS support.
- **Treating circuity factor as exact:** It's an approximation. Label distances as "~X km (estimated road)" not "X km".

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Haversine distance | Custom great-circle formula | Existing `calculateDistance()` | Already correctly implemented and tested |
| Nearest office detection | Manual min-distance loop | `Math.min()` over office distances | Simple, but centralize in a utility to avoid duplication |
| Distance formatting | Custom format strings | Existing `formatDistance()` | Already handles m/km formatting |
| Road graph parsing | OSM PBF parser in JS | Pre-computed matrix from OSRM | OSRM handles the graph; we just consume the output |
| Average/median statistics | Custom stats functions | Simple reduce/sort operations | Dataset is tiny (~100 employees), no stats library needed |
| GTFS parsing in browser | Custom GTFS reader | Defer rail times entirely | GTFS is too large; no lightweight client-side solution exists |

**Key insight:** The trick is to NOT do routing in the browser. Instead, move the expensive computation to a one-time offline build step (OSRM Docker), and bundle the tiny result (~120KB) as static data. This preserves privacy (no runtime API calls) while giving accurate road distances.

## Common Pitfalls

### Pitfall 1: Assuming Haversine Is "Good Enough"

**What goes wrong:** Haversine underestimates real commute distances by 25-60%. An employee who appears "50km away" might actually be 70km by road, especially in mountainous or river-divided areas.
**Why it happens:** Straight-line distances ignore roads, rivers, terrain. In urban areas the circuity is higher (1.4-1.6) due to street grids.
**How to avoid:** Always apply circuity factor. Display both straight-line and estimated road distance, or only show road estimate with "estimated" label.
**Warning signs:** Users questioning why Google Maps shows much longer distances than the app.

### Pitfall 2: Single Circuity Factor for All Distances

**What goes wrong:** Using a flat 1.3x multiplier for both 5km urban commutes and 500km cross-country drives leads to systematic errors.
**Why it happens:** Short distances have higher circuity (1.4-1.6) due to urban street patterns; long distances have lower circuity (1.2-1.3) because Autobahn routes are more direct.
**How to avoid:** Use distance-dependent circuity factor as shown in Pattern 2.
**Warning signs:** Short-distance estimates feel too low, long-distance too high.

### Pitfall 3: Treating Estimated Distance as Exact

**What goes wrong:** UI shows "47.3 km" when the real road distance could be anywhere from 40-55km.
**Why it happens:** False precision from computation. Users trust numbers that look precise.
**How to avoid:** Round to nearest 5km for estimates. Use "~" prefix. Show accuracy indicator. Example: "~50 km (estimated)" vs "47.3 km (road)" for actual OSRM data.
**Warning signs:** Users making decisions based on small distance differences that are within the estimation error margin.

### Pitfall 4: Pre-computed Matrix Staleness

**What goes wrong:** Road distances change as roads are built/closed. Matrix generated once becomes stale.
**Why it happens:** OSM data evolves, but bundled data is static.
**How to avoid:** This is acceptable for our use case. Road distances between postcodes change very slowly (maybe 1-2% per year). Document the generation date. Regenerate annually at most.
**Warning signs:** Not a practical concern for postcode-level commute estimation.

### Pitfall 5: Trying to Show Rail Times Without External APIs

**What goes wrong:** Over-committing to offline rail time estimation. Rail times depend on schedules, connections, walking time to stations - impossible to estimate from geography alone.
**Why it happens:** Rail time seems conceptually similar to driving time, but it's fundamentally different (discrete stations, fixed schedules, transfers).
**How to avoid:** Either: (a) defer rail times entirely, (b) use very rough estimates based on straight-line distance + fixed overhead, or (c) add optional API integration with user consent (like existing accurate geocoding flow).
**Warning signs:** Spending >2 days on rail time feature with diminishing accuracy returns.

### Pitfall 6: Matrix Size Explosion with Custom Offices

**What goes wrong:** If users add offices, the pre-computed matrix won't have entries for them.
**Why it happens:** Matrix is pre-computed for the 5 seed offices only.
**How to avoid:** Fall back to circuity estimate for any postcode/office pair not in the matrix. This is seamless because the circuity estimate is the base tier anyway.
**Warning signs:** Runtime errors when looking up non-existent matrix entries.

## Code Examples

### Example 1: Enhanced Distance Calculation Service

```typescript
// src/services/distanceService.ts

import { calculateDistance } from '../utils/distance';
import type { Employee } from '../types/employee';
import type { Office } from '../types/office';

// Distance-dependent circuity factors (European/German research)
const CIRCUITY_BREAKPOINTS = [
  { maxKm: 20, factor: 1.4 },   // Urban
  { maxKm: 100, factor: 1.35 }, // Mixed
  { maxKm: Infinity, factor: 1.25 }, // Intercity
] as const;

// Average speed by distance band (km/h)
const SPEED_BREAKPOINTS = [
  { maxKm: 20, speed: 30 },    // Urban traffic
  { maxKm: 80, speed: 60 },    // Suburban/regional
  { maxKm: Infinity, speed: 90 }, // Autobahn-dominant
] as const;

export interface DistanceResult {
  straightLineKm: number;
  roadEstimateKm: number;
  driveTimeMinutes: number;
  accuracy: 'estimated';
  nearestOffice: boolean;
}

function getCircuityFactor(straightLineKm: number): number {
  const bp = CIRCUITY_BREAKPOINTS.find(b => straightLineKm <= b.maxKm);
  return bp?.factor ?? 1.3;
}

function getAverageSpeed(roadKm: number): number {
  const bp = SPEED_BREAKPOINTS.find(b => roadKm <= b.maxKm);
  return bp?.speed ?? 60;
}

export function calculateEmployeeOfficeDistance(
  employee: Employee,
  office: Office
): DistanceResult | null {
  if (!employee.coords || !office.coords) return null;

  const straightLine = calculateDistance(
    employee.coords.lat, employee.coords.lon,
    office.coords.lat, office.coords.lon
  );

  const circuity = getCircuityFactor(straightLine);
  const roadEstimate = straightLine * circuity;
  const avgSpeed = getAverageSpeed(roadEstimate);
  const driveTime = (roadEstimate / avgSpeed) * 60;

  return {
    straightLineKm: straightLine,
    roadEstimateKm: roadEstimate,
    driveTimeMinutes: driveTime,
    accuracy: 'estimated',
    nearestOffice: false, // Set by caller after comparing all offices
  };
}

export function findNearestOffice(
  employee: Employee,
  offices: Office[]
): { office: Office; distance: DistanceResult } | null {
  let nearest: { office: Office; distance: DistanceResult } | null = null;

  for (const office of offices) {
    const dist = calculateEmployeeOfficeDistance(employee, office);
    if (!dist) continue;
    if (!nearest || dist.roadEstimateKm < nearest.distance.roadEstimateKm) {
      nearest = { office, distance: dist };
    }
  }

  if (nearest) nearest.distance.nearestOffice = true;
  return nearest;
}
```

### Example 2: Team Co-location Analysis

```typescript
// src/services/teamAnalysisService.ts

import type { Employee } from '../types/employee';
import type { Office } from '../types/office';
import { calculateEmployeeOfficeDistance, findNearestOffice } from './distanceService';

export interface TeamCoLocationAnalysis {
  teamName: string;
  members: number;
  currentOffice: string | null;
  avgDistanceToNearest: number;
  bestOffice: { id: string; name: string; avgDistance: number };
  potentialSavingKm: number;
  coverageWithin25km: number;  // percentage
  coverageWithin50km: number;
  coverageWithin100km: number;
}

export function analyzeTeamCoLocation(
  teamName: string,
  employees: Employee[],
  offices: Office[]
): TeamCoLocationAnalysis {
  const teamMembers = employees.filter(e => e.team === teamName);

  // For each office, calculate total/average distance
  const officeMetrics = offices.map(office => {
    const distances = teamMembers
      .map(emp => calculateEmployeeOfficeDistance(emp, office))
      .filter((d): d is NonNullable<typeof d> => d !== null);

    const avgDistance = distances.length > 0
      ? distances.reduce((sum, d) => sum + d.roadEstimateKm, 0) / distances.length
      : Infinity;

    return { office, avgDistance, distances };
  });

  const bestOfficeMetric = officeMetrics.reduce((a, b) =>
    a.avgDistance < b.avgDistance ? a : b
  );

  // Nearest office analysis
  const nearestDistances = teamMembers
    .map(emp => findNearestOffice(emp, offices))
    .filter((n): n is NonNullable<typeof n> => n !== null);

  const avgNearest = nearestDistances.length > 0
    ? nearestDistances.reduce((sum, n) => sum + n.distance.roadEstimateKm, 0) / nearestDistances.length
    : 0;

  // Coverage metrics (using road estimates)
  const allNearestKm = nearestDistances.map(n => n.distance.roadEstimateKm);
  const total = allNearestKm.length || 1;

  return {
    teamName,
    members: teamMembers.length,
    currentOffice: null, // Could be derived from assigned offices
    avgDistanceToNearest: Math.round(avgNearest),
    bestOffice: {
      id: bestOfficeMetric.office.id,
      name: bestOfficeMetric.office.name,
      avgDistance: Math.round(bestOfficeMetric.avgDistance),
    },
    potentialSavingKm: Math.round(avgNearest - bestOfficeMetric.avgDistance),
    coverageWithin25km: Math.round((allNearestKm.filter(d => d <= 25).length / total) * 100),
    coverageWithin50km: Math.round((allNearestKm.filter(d => d <= 50).length / total) * 100),
    coverageWithin100km: Math.round((allNearestKm.filter(d => d <= 100).length / total) * 100),
  };
}
```

### Example 3: Distance Display with Accuracy Indicator

```typescript
// Formatting road distance estimates
export function formatRoadDistance(km: number, accuracy: 'actual' | 'estimated'): string {
  if (accuracy === 'actual') {
    return `${km.toFixed(1)} km`;
  }
  // Round estimated distances to reduce false precision
  if (km < 10) return `~${Math.round(km)} km`;
  if (km < 100) return `~${Math.round(km / 5) * 5} km`;
  return `~${Math.round(km / 10) * 10} km`;
}

export function formatDriveTime(minutes: number): string {
  if (minutes < 60) return `~${Math.round(minutes / 5) * 5} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round((minutes % 60) / 5) * 5;
  if (mins === 0) return `~${hours}h`;
  return `~${hours}h ${mins}m`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| External routing APIs (Google, HERE) | Privacy-first local computation | 2024-2025 GDPR enforcement | No employee location data leaves the browser |
| Full road graph in browser | Pre-computed sparse matrices | Ongoing | Practical solution for known-office scenarios |
| Single circuity factor (1.3x) | Distance-dependent circuity | 2024 (Mennicken et al.) | Better accuracy at short and long distances |
| Server-side OSRM | Docker-based offline generation | 2023+ | One-time batch computation, results bundled |
| HAFAS API for rail times | db-vendo-client (new DB API) | 2025 | Old HAFAS deprecated, new Vendo/Movas platform |

**Deprecated/outdated:**
- `db-hafas` npm package: Deutsche Bahn switched to Vendo/Movas platform; use `db-vendo-client` instead
- GraphHopper TeaVM browser routing (2014): Proof of concept, never productionized
- OSRM WASM: Never existed as a real project despite periodic community interest

## Open Questions

1. **Pre-computed matrix: build it now or defer?**
   - What we know: The circuity factor approach gives ~85-90% accuracy with zero data overhead. The OSRM matrix would give ~98% accuracy but requires a build tooling setup (Docker, script, data generation).
   - What's unclear: Whether the user wants to invest in the build tooling now or is satisfied with circuity estimates.
   - Recommendation: **Start with circuity factors only (Phase 3 v1).** Design the architecture so the pre-computed matrix can be plugged in later without UI changes. Add matrix generation as a separate follow-up task.

2. **Rail time estimation approach**
   - What we know: No viable client-side solution exists. GTFS data is too large (~GB). DB APIs require external calls and have no CORS support.
   - What's unclear: How important rail times are to the user vs driving times.
   - Recommendation: **Defer rail times.** If needed later, add an optional API integration behind user consent (like the existing accurate geocoding flow). Could use db-vendo-client behind a proxy, or use rough estimates (straight-line distance / 150 km/h + 30 min overhead for ICE-served routes).

3. **Dynamic office additions**
   - What we know: Pre-computed matrix only covers the 5 seed offices. Users can add offices.
   - What's unclear: Whether custom offices need road-accurate distances.
   - Recommendation: Fall back to circuity estimation for offices not in the pre-computed matrix. This is seamless with the fallback chain architecture.

4. **Accuracy labeling in UI**
   - What we know: Users need to understand that "~65 km" is an estimate, not exact GPS routing.
   - What's unclear: Best UX pattern for showing accuracy confidence.
   - Recommendation: Use "~" prefix for estimates, "(estimated)" or "(road est.)" suffix. Use tooltip for explanation. Show a small legend: "Distances are estimated road distances based on postcode centroids."

## Feasibility Analysis: Client-Side Routing Options

### Option A: Full Client-Side Routing Engine (NOT FEASIBLE)

| Factor | Assessment |
|--------|------------|
| OSRM in WASM | Does not exist. OSRM is C++ with complex dependencies (Boost, TBB). No emscripten build. |
| Valhalla in WASM | Does not exist. Valhalla is C++ server-side only. |
| GraphHopper in browser | 2014 TeaVM experiment only. Not maintained. Java->JS transpilation. |
| BRouter in browser | Java-based, no WASM. Web client talks to server. |
| Germany road data size | 11.5M nodes, 12.4M edges. 57MB compressed (graph only, no attributes). |
| Browser memory | Loading 57MB+ graph + routing algorithm = impractical for secondary feature |
| Performance | A* in WASM is "very sluggish" for even London-sized areas |
| **Verdict** | **Do not attempt. No viable path.** |

### Option B: Pre-computed OSRM Matrix (FEASIBLE, deferred)

| Factor | Assessment |
|--------|------------|
| Data generation | Self-hosted OSRM Docker + batch script |
| Input | 8,200 postcode centroids x 5 office coordinates |
| Output | ~41,000 distance/time pairs |
| File size | ~400KB uncompressed JSON, ~120KB gzip |
| Accuracy | ~98% (postcode centroid to office address) |
| Privacy | 100% - generated offline, bundled as static data |
| Maintenance | Regenerate annually (road network changes slowly) |
| **Verdict** | **Viable enhancement. Defer to Phase 3 v2.** |

### Option C: Circuity Factor Estimation (RECOMMENDED for v1)

| Factor | Assessment |
|--------|------------|
| Implementation | Pure arithmetic: haversine * distance-dependent factor |
| Data overhead | Zero - no additional data files |
| Accuracy | ~85-90% for distances > 20km; lower for short urban distances |
| Privacy | 100% - pure client-side math |
| Complexity | Low - ~50 lines of code |
| Research backing | European circuity: 1.343 avg (Mennicken et al. 2024), Germany ~1.3 (Ballou) |
| **Verdict** | **Implement first. Sufficient for commute estimation.** |

### Option D: Runtime API with Consent (FEASIBLE for rail, deferred)

| Factor | Assessment |
|--------|------------|
| Architecture | Like existing accurate geocoding: user opts in, CSP relaxed |
| Rail times | db-vendo-client -> DB proxy server -> Deutsche Bahn API |
| Driving times | OSRM demo server or self-hosted instance |
| Privacy | User-consented; data sent only when user approves |
| **Verdict** | **Pattern already exists in app. Use for rail times if ever needed.** |

## Sources

### Primary (HIGH confidence)

- [Network Data Repository - Germany OSM road graph](https://networkrepository.com/road-germany-osm.php) - 11.5M nodes, 12.4M edges, 57MB compressed
- [OSRM GitHub repository](https://github.com/Project-OSRM/osrm-backend) - Confirmed no WASM build exists, server-side only
- [Geofabrik Germany extract](https://download.geofabrik.de/europe/germany.html) - 4.4GB PBF file for full Germany OSM data
- [GTFS.de feeds](https://gtfs.de/en/feeds/) - Germany transit GTFS data, CC 4.0 license, 500K+ stops
- [db-vendo-client GitHub](https://github.com/public-transport/db-vendo-client) - Replacement for db-hafas, requires external API calls, no CORS

### Secondary (MEDIUM confidence)

- Mennicken, Lemoy, Caruso (2024) "Road network distances and detours in Europe" - European avg circuity 1.343
- Ballou et al. (2002) "Selected country circuity factors" - Germany ~1.3, global ~1.3
- [route_snapper issue #22](https://github.com/dabreegster/route_snapper/issues/22) - WASM routing "very sluggish" for London-sized areas
- [OSRM Table API documentation](https://project-osrm.org/docs/v5.5.1/api/) - No limit on matrix size when self-hosted
- German speed data: Urban 50 km/h limit, rural 100 km/h, Autobahn median 83.4 km/h, advisory 130 km/h
- Average Autobahn speed: ~125 km/h passenger cars; practical rule ~1h/100km

### Tertiary (LOW confidence)

- GraphHopper TeaVM browser experiment (2014) - Likely abandoned, no recent activity
- GTFS Germany file sizes (estimated multi-GB based on 2M journeys) - Not directly verified by download
- Circuity factor variation by terrain - General principle from multiple sources but no Germany-specific terrain model

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries needed; arithmetic + existing utils
- Architecture: HIGH - Fallback chain pattern is well-established; data format is straightforward
- Circuity factors: MEDIUM - Research-backed values but vary by specific geography
- Drive time estimates: MEDIUM - Based on published speed data but highly route-dependent
- Pitfalls: HIGH - Well-documented failure modes from routing community
- Rail times: LOW - No viable client-side solution confirmed; deferred

**Research date:** 2026-02-07
**Valid until:** 2026-06-07 (stable domain, circuity research doesn't change frequently)
