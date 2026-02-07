# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-06)

**Core value:** Employees can see which office is closest to them, and leadership can identify team composition changes that would reduce overall commute burden.
**Current focus:** Phase 5 - Better Visualizations

## Current Position

Phase: 5 of 5 (Better Visualizations)
Plan: 2 of 2 in current phase
Status: Phase complete
Last activity: 2026-02-07 - Completed 05-02-PLAN.md

Progress: [###################-] 93% (14/15 plans completed)

## Performance Metrics

**Velocity:**
- Total plans completed: 14
- Average duration: 3 min
- Total execution time: 42 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 3 | 15 min | 5 min |
| 02-map-filtering | 4 | 8 min | 2 min |
| 02.1-security-privacy-hardening | 5 | 12 min | 2.4 min |
| 05-better-visualizations | 2 | 7 min | 3.5 min |

**Recent Trend:**
- Last 5 plans: 02.1-03 (2 min), 02.1-04 (3 min), 02.1-05 (4 min), 05-01 (2 min), 05-02 (5 min)
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
- [02.1-04]: ClearDataButton clears stores, localStorage, sessionStorage then reloads
- [02.1-04]: Data limits enforced at import boundaries, not in stores
- [02.1-04]: Seed employees use real postcode centroids, not fake clustering near offices
- [02.1-04]: CSV import supports both postcode column and address extraction for compatibility
- [02.1-05]: API key stored in sessionStorage only (cleared on tab close)
- [02.1-05]: Seed employees use valid postcodes from bundled database (not faker random)
- [02.1-05]: AccurateGeocodingButton in sidebar triggers consent flow
- [02.1-05]: Tables display postcode, street, city columns instead of address
- [05-01]: mapMode not reset by clearFilters (visual preference, same as colorBy)
- [05-01]: employee-marker-selected className for CSS pulse animation targeting
- [05-02]: Closest office replaces assigned office for Google Maps navigation link
- [05-02]: Employee marker size 32px default / 42px highlighted for visibility
- [05-02]: fitBounds with maxZoom:10 for zoom-to-fit on employee select
- [05-02]: MapController receives offices prop for explicit data flow

### Pending Todos

None yet.

### Blockers/Concerns

- Build warning about chunk size (~1.4MB) due to @faker-js/faker and postcode data bundling - acceptable for dev tooling
- Geocoding now fully local - no API key required, no network calls

### Roadmap Evolution

- Phase 2.1 inserted after Phase 2: Security & Privacy Hardening (URGENT) - local postcode geocoding, encrypted localStorage, clear data button, CSP headers, optional accurate geocoding with consent
- Phase 5 added: Better Visualizations - Map B&W toggle, distance lines on employee click, Google Maps navigation links

## Session Continuity

Last session: 2026-02-07T14:27:00Z
Stopped at: Completed 05-02-PLAN.md - Phase 5 complete
Resume file: None

---
*State initialized: 2026-02-06*
*Last updated: 2026-02-07*
