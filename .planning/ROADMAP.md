# Roadmap: Hybrid Office Finder

## Overview

This roadmap delivers a browser-based visualization tool for mapping employee home locations against German office locations. The journey moves from data pipeline (import offices and employees, geocode addresses) through map visualization with filtering, to distance calculations and team co-location intelligence, ending with export capabilities for leadership presentations. All processing stays client-side for GDPR compliance.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Data Pipeline** - CSV import, geocoding, seed data generation
- [ ] **Phase 2: Map & Filtering** - Germany map with markers, color-coding, filtering by team/department/office
- [ ] **Phase 3: Distance & Team Intelligence** - Distance calculations, nearest office, team co-location analysis
- [ ] **Phase 4: Export & Polish** - CSV/PDF/Excel export, production hardening

## Phase Details

### Phase 1: Foundation & Data Pipeline
**Goal**: Users can import office and employee data via CSV and see it parsed correctly with geocoded coordinates
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, SEED-01, SEED-02
**Success Criteria** (what must be TRUE):
  1. User can paste office CSV (name, city, street, postcode) and see parsed offices with coordinates
  2. User can paste employee CSV (name, department, team, role, address, assigned office) and see parsed employees with coordinates
  3. System displays sample data (5 German offices, 30-50 employees) on first load
  4. German characters (umlauts, eszett) display correctly after import
  5. Geocoding progress is visible and completes without silent failures
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md - Project setup, types, stores, and seed data generation
- [ ] 01-02-PLAN.md - CSV parsing and geocoding services
- [ ] 01-03-PLAN.md - Import UI with preview and progress

### Phase 2: Map & Filtering
**Goal**: Users can visualize offices and employees on an interactive Germany map and filter by attributes
**Depends on**: Phase 1
**Requirements**: MAP-01, MAP-02, MAP-03, FILT-01, FILT-02, FILT-03, FILT-04
**Success Criteria** (what must be TRUE):
  1. User sees interactive Germany map with office locations as distinct markers
  2. User sees employee home locations as markers on the map
  3. User can color-code markers by team, department, or assigned office
  4. User can filter employees by team, department, or assigned office
  5. User can search for an employee by name and see them highlighted on map
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Distance & Team Intelligence
**Goal**: Users can see distances from employees to offices and analyze team co-location impact
**Depends on**: Phase 2
**Requirements**: DIST-01, DIST-02, TEAM-01, TEAM-02, TEAM-03
**Success Criteria** (what must be TRUE):
  1. User sees straight-line distance (km) from each employee to each office
  2. System highlights nearest office for each employee (with visual indicator)
  3. User can view team co-location analysis (aggregate commute impact if team moved to different office)
  4. System suggests potential team transfers to reduce total travel
  5. User can see office coverage metrics (percentage of employees within X km of each office)
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Export & Polish
**Goal**: Users can export data and visualizations for leadership presentations
**Depends on**: Phase 3
**Requirements**: DATA-04, DATA-05
**Success Criteria** (what must be TRUE):
  1. User can export current data state (including calculated distances) as CSV
  2. User can export view as PDF or Excel report
  3. Exported data can be re-imported to restore state
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Data Pipeline | 0/3 | Planned | - |
| 2. Map & Filtering | 0/TBD | Not started | - |
| 3. Distance & Team Intelligence | 0/TBD | Not started | - |
| 4. Export & Polish | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-06*
*Depth: quick (3-5 phases)*
