# Phase 1: Foundation & Data Pipeline - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<domain>
## Phase Boundary

CSV import for offices and employees, geocoding addresses to map coordinates, and seed data generation. Users can import data and see it parsed correctly with coordinates.

Map visualization and filtering are Phase 2 — this phase focuses purely on data ingestion.

</domain>

<decisions>
## Implementation Decisions

### CSV Format & Validation
- **Lenient validation** — Import valid rows, skip/flag invalid ones (don't reject entire import)
- **Core required fields:** name, address, team (must be present)
- **Optional fields:** department, role, assigned office
- **Flexible address format** — Accept single 'address' column OR split columns (street, postcode, city); auto-detect which format
- **Auto-detect separator** — Handle both comma and semicolon delimiters automatically

### Import UI Experience
- **Both paste and file upload** — User can paste CSV text OR upload .csv file
- **Preview before import** — Show parsed data in table, user confirms before finalizing
- **Merge behavior** — New imports add to existing data (don't replace unless explicitly cleared)

### Geocoding Behavior
- **Automatic on import** — Geocode all addresses immediately after CSV is parsed
- **Progress bar** — Visual progress showing X of Y addresses geocoded
- **Flag and continue** — If address can't be geocoded, mark record with warning, continue with others, show summary at end
- **No manual coordinate entry in v1** — Failed geocodes simply won't appear on map; manual entry is future feature

### Seed Data Characteristics
- **Clustered near offices** — Most employees within reasonable commute of one of the 5 offices
- **6-10 teams** — Realistic team count for ~50 employees
- **Engineering + Product departments** — Focus on devs plus product managers
- **Realistic German names** — Names like 'Anna Müller', 'Thomas Schmidt' (not 'Test User 1')

### Claude's Discretion
- Import area presentation (page vs panel vs modal)
- Exact progress bar styling
- How to handle encoding detection for German characters
- Team name generation for seed data

</decisions>

<specifics>
## Specific Ideas

- Office addresses: Frankfurt, Berlin, Munich, Hamburg, Düsseldorf (major German cities with tech presence)
- Employee CSV should include columns for the team swap feature later — ensure role field exists even if optional
- Research mentioned PapaParse for CSV parsing and GDPR-compliant geocoding — consider in implementation

</specifics>

<deferred>
## Deferred Ideas

- Manual coordinate entry for failed geocodes — future feature
- Real-time geocoding API integration with rate limiting — research suggests caching geocoded results

</deferred>

---

*Phase: 01-foundation-data-pipeline*
*Context gathered: 2026-02-06*
