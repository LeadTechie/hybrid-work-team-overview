# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-06)

**Core value:** Employees can see which office is closest to them, and leadership can identify team composition changes that would reduce overall commute burden.
**Current focus:** Phase 2 - Map & Filtering

## Current Position

Phase: 2.1 of 4 (Security & Privacy Hardening)
Plan: 3 of 3 in current phase
Status: Phase complete
Last activity: 2026-02-07 - Completed 02.1-03-PLAN.md

Progress: [###############-----] 75% (9/12 plans total)

## Performance Metrics

**Velocity:**
- Total plans completed: 9
- Average duration: 3 min
- Total execution time: 26 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 3 | 15 min | 5 min |
| 02-map-filtering | 3 | 6 min | 2 min |
| 02.1-security-privacy-hardening | 3 | 5 min | 1.7 min |

**Recent Trend:**
- Last 5 plans: 02-02 (~2 min), 02-03 (2 min), 02.1-01 (1 min), 02.1-02 (2 min), 02.1-03 (2 min)
- Trend: Stable

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: 4 phases (quick depth) - Foundation, Map & Filtering, Distance & Intelligence, Export
- [Roadmap]: Team intelligence (TEAM-01, TEAM-02, TEAM-03) grouped with distance calculations in Phase 3
- [01-01]: Pre-geocoded seed offices - no API calls needed for initial data
- [01-01]: fakerDE locale with seed(12345) for reproducible German employee data
- [01-01]: Zustand stores with persist middleware for localStorage persistence
- [01-02]: Zod v4 uses `issues` array (not `errors`) for validation failures
- [01-02]: CSV addresses with internal commas require proper quoting (standard CSV behavior)
- [01-02]: Geocoding returns early with all-failed when no API key
- [01-02]: 200ms delay between geocode requests (5 req/sec free tier limit)
- [02-01]: No persist middleware for filterStore - filter state is session-specific
- [02-01]: Leaflet namespace import (`import * as L`) for TypeScript compatibility
- [02-02]: Office markers not clustered - offices should always be visible as landmarks
- [02-02]: React.memo on EmployeeMarker to prevent cascade re-renders
- [02-02]: Controller pattern for non-visual map operations via useMap hook
- [02-03]: useMemo for filtered employees - memoizes filter computation
- [02-03]: 250ms debounce for search - balances responsiveness with avoiding excessive filtering
- [02-03]: 5 suggestions max - keeps dropdown manageable
- [02.1-01]: crypto-js for AES encryption with versioned storage key (hwto-v1)
- [02.1-01]: CSP allows openstreetmap tiles, blocks external API calls (connect-src 'self')
- [02.1-01]: DATA_LIMITS centralized validation constants
- [02.1-02]: WZB plz_geocoord dataset for German postcode centroids (Apache 2.0)
- [02.1-02]: Synchronous geocoding returns null for unknown postcodes (graceful failure)
- [02.1-02]: ~5km postcode centroid accuracy for privacy-first distance calculations
- [02.1-03]: createJSONStorage wrapper for Zustand encrypted storage compatibility
- [02.1-03]: geocodeAccuracy field tracks postcode-centroid vs address precision
- [02.1-03]: Breaking type changes (address->postcode) deferred to Plan 04 for migration

### Pending Todos

None yet.

### Blockers/Concerns

- Build warning about chunk size (766KB) due to @faker-js/faker bundling - acceptable for dev tooling
- Geocoding requires VITE_GEOAPIFY_KEY environment variable - without it, all geocoding fails gracefully
- Build currently broken due to type migration (address->postcode) - Plan 04 required to fix dependent files

### Roadmap Evolution

- Phase 2.1 inserted after Phase 2: Security & Privacy Hardening (URGENT) - local postcode geocoding, encrypted localStorage, clear data button, CSP headers, optional accurate geocoding with consent

## Session Continuity

Last session: 2026-02-07T09:58:00Z
Stopped at: Completed 02.1-03-PLAN.md (Phase 02.1 complete)
Resume file: None

---
*State initialized: 2026-02-06*
*Last updated: 2026-02-07*
