# Requirements: Hybrid Office Finder

**Defined:** 2026-02-06
**Core Value:** Employees can see which office is closest to them, and leadership can identify team composition changes that would reduce overall commute burden.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Map & Visualization

- [ ] **MAP-01**: User sees a map of Germany with office locations marked
- [ ] **MAP-02**: User sees employee home locations as markers on the map
- [ ] **MAP-03**: User can color-code markers by attribute (team, department, or assigned office)

### Data Management

- [ ] **DATA-01**: User can import offices via CSV paste (name, city, street, postcode)
- [ ] **DATA-02**: User can import employees via CSV paste (name, department, team, role, address, assigned office)
- [ ] **DATA-03**: System geocodes addresses to map coordinates
- [ ] **DATA-04**: User can export current data state (including calculated distances) as CSV
- [ ] **DATA-05**: User can export view as PDF or Excel report

### Filtering & Search

- [ ] **FILT-01**: User can filter employees by team
- [ ] **FILT-02**: User can filter employees by department
- [ ] **FILT-03**: User can filter employees by assigned office
- [ ] **FILT-04**: User can search for an employee by name

### Distance & Recommendations

- [ ] **DIST-01**: User sees straight-line distance (km) from employee to each office
- [ ] **DIST-02**: System identifies and highlights nearest office for each employee

### Team Intelligence

- [ ] **TEAM-01**: User can see team co-location analysis (aggregate commute impact if team moved to different office)
- [ ] **TEAM-02**: System suggests potential team transfers to reduce total travel (developers with same role who could swap)
- [ ] **TEAM-03**: User can see office coverage metrics (% of employees within X km of each office)

### Seed Data

- [ ] **SEED-01**: System includes sample offices (Frankfurt, Berlin, Munich, Hamburg, Düsseldorf)
- [ ] **SEED-02**: System includes 30-50 sample employees scattered across Germany

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Visualization

- **VIZ-01**: Heatmap showing employee density clusters
- **VIZ-02**: Commute isochrones (30-min zones from offices)

### Travel Time APIs

- **TRAV-01**: Driving time via routing API
- **TRAV-02**: Transit time via public transport API

### Advanced Planning

- **PLAN-01**: Scenario modeling ("what if we closed Office X?")
- **PLAN-02**: Database backend for persistent storage

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real-time desk booking | Separate problem domain, overkill for 60 people |
| Live location tracking | GDPR nightmare, not the use case |
| Calendar integration | Scope creep, adds complexity |
| Full HR system features | Already have HR systems, avoid duplication |
| User authentication | Browser-only tool, no persistent users |
| Mobile native apps | Web works on mobile, small user base |
| Multi-country support | Germany-only for foreseeable future |
| AI-powered recommendations | Simple heuristics work for 60 people |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| MAP-01 | TBD | Pending |
| MAP-02 | TBD | Pending |
| MAP-03 | TBD | Pending |
| DATA-01 | TBD | Pending |
| DATA-02 | TBD | Pending |
| DATA-03 | TBD | Pending |
| DATA-04 | TBD | Pending |
| DATA-05 | TBD | Pending |
| FILT-01 | TBD | Pending |
| FILT-02 | TBD | Pending |
| FILT-03 | TBD | Pending |
| FILT-04 | TBD | Pending |
| DIST-01 | TBD | Pending |
| DIST-02 | TBD | Pending |
| TEAM-01 | TBD | Pending |
| TEAM-02 | TBD | Pending |
| TEAM-03 | TBD | Pending |
| SEED-01 | TBD | Pending |
| SEED-02 | TBD | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 0
- Unmapped: 19 ⚠️

---
*Requirements defined: 2026-02-06*
*Last updated: 2026-02-06 after initial definition*
