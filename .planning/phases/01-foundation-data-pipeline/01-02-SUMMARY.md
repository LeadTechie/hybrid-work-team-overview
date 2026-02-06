---
phase: 01-foundation-data-pipeline
plan: 02
subsystem: data-pipeline
tags: [csv-parsing, geocoding, validation, papaparse, zod, geoapify]

# Dependency graph
requires:
  - phase: 01-foundation-data-pipeline
    provides: Types (Office, Employee) and Zustand stores with persistence
provides:
  - CSV parsing with auto-delimiter detection (comma, semicolon, tab)
  - Flexible address column handling (single or split)
  - Lenient validation (valid rows import, invalid flagged)
  - German header variant support (strasse, plz, stadt)
  - Geocoding service with Geoapify integration
  - Batch geocoding with rate limiting and progress callbacks
affects: [01-03-csv-ui, 02-map-visualization, 03-distance-calculations]

# Tech tracking
tech-stack:
  added: [papaparse, zod, geoapify-api]
  patterns: [lenient-validation, flexible-address-detection, rate-limited-api-calls]

key-files:
  created:
    - src/services/validationService.ts
    - src/services/csvService.ts
    - src/services/geocodingService.ts
  modified: []

key-decisions:
  - "Zod v4 uses issues array (not errors array) for validation failures"
  - "CSV addresses with internal commas require proper quoting"
  - "Geocoding returns early with all-failed results when no API key"
  - "200ms delay between geocode requests (5 req/sec free tier limit)"

patterns-established:
  - "Lenient validation: collect errors per row, don't reject entire import"
  - "German header normalization: strasse->street, plz->postcode, stadt/ort->city"
  - "Flexible address: try single column first, then combine street+postcode+city"

# Metrics
duration: 5min
completed: 2026-02-06
---

# Phase 1 Plan 2: Core Services Summary

**CSV parsing with auto-delimiter detection, Zod validation, German header support, and Geoapify geocoding with rate limiting**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-06T14:53:54Z
- **Completed:** 2026-02-06T14:58:41Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments

- CSV parsing handles comma, semicolon, and tab delimiters automatically
- German header variants (strasse, plz, stadt) normalized to canonical names
- Lenient validation: valid rows import with UUIDs, invalid rows flagged with row numbers and errors
- Geocoding service with Geoapify API, Germany-only filter, and 200ms rate limiting
- Progress callback support for UI feedback during batch geocoding

## Task Commits

Each task was committed atomically:

1. **Task 1: Create validation schemas and CSV parsing service** - `96063fb` (feat)
2. **Task 2: Create geocoding service with batch processing** - `8b2fb83` (feat)

## Files Created/Modified

- `src/services/validationService.ts` - Zod schemas for Office and Employee, CsvParseResult types
- `src/services/csvService.ts` - parseOfficeCsv and parseEmployeeCsv with auto-detection
- `src/services/geocodingService.ts` - batchGeocode with Geoapify integration and rate limiting

## Decisions Made

- **Zod v4 API:** Uses `result.error.issues` array instead of v3's `result.error.errors`
- **CSV quoting:** Addresses containing commas must be quoted in CSV; this is standard CSV behavior
- **Geocoding without API key:** Returns immediately with all addresses marked as failed, error "No API key configured"
- **Rate limiting:** 200ms between requests (5 req/sec) to stay within Geoapify free tier

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Zod v4 error structure**
- **Found during:** Task 1 (CSV parsing implementation)
- **Issue:** Zod v4 uses `issues` array, not `errors` array for validation failures
- **Fix:** Changed `result.error.errors` to `result.error.issues`
- **Files modified:** src/services/csvService.ts
- **Verification:** TypeScript compiles, all CSV parsing tests pass
- **Committed in:** 96063fb (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Essential fix for Zod v4 compatibility. No scope creep.

## Issues Encountered

- tsx cannot run TypeScript files outside the project directory (module resolution fails) - resolved by running tests from project root

## User Setup Required

Geocoding requires a Geoapify API key:

1. Get a free API key from https://www.geoapify.com/
2. Add to `.env` file: `VITE_GEOAPIFY_KEY=your_api_key_here`

Without the API key, geocoding will fail gracefully with "No API key configured" error.

## Next Phase Readiness

- CSV parsing and validation services ready for UI integration
- Geocoding service ready for batch processing of imported addresses
- Next: 01-03-PLAN.md - CSV import UI components

## Self-Check: PASSED

---
*Phase: 01-foundation-data-pipeline*
*Completed: 2026-02-06*
