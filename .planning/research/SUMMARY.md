# Project Research Summary

**Project:** Hybrid Work Team Overview
**Domain:** Browser-based geospatial visualization / office planning tool
**Researched:** 2026-02-06
**Confidence:** HIGH

## Executive Summary

This is an internal workforce planning tool for visualizing where employees live relative to office locations. The product sits in a gap between enterprise office management platforms (focused on desk booking) and geospatial analysis tools (focused on site selection). Research shows the core value proposition is enabling team co-location intelligence — answering questions like "if team A all moved to office X, what's the average commute impact?"

The recommended approach uses a lightweight, privacy-first stack: Vite + React 19 + TypeScript + Leaflet for mapping, OpenFreeMap for tiles (no API key needed), and PapaParse for CSV handling. This keeps the application fully client-side with no backend requirements while maintaining GDPR compliance for German employee data. The architecture follows clean separation with stores for state, services for business logic, and React components for UI, with explicit build phases that prevent common pitfalls.

Key risks center on data protection and performance. Geocoding employee home addresses to third-party services creates GDPR liability unless handled carefully (use providers with no-logging options or pre-geocode data). Rendering 500+ markers will crash browsers without clustering. CSV imports from German users will corrupt umlauts unless encoding is explicitly handled. Each risk has proven mitigation strategies that must be implemented during foundation phases, not retrofitted later.

## Key Findings

### Recommended Stack

The research strongly recommends a modern React ecosystem with open-source mapping. Vite 7.3 provides near-instant HMR and optimized builds, replacing the deprecated Create React App. React 19 is required for react-leaflet v5, which provides declarative mapping components. Leaflet remains the most popular open-source mapping library (2.3M weekly npm downloads) with a mature plugin ecosystem suitable for Germany-focused static maps.

**Core technologies:**
- **Vite 7.3 + React 19 + TypeScript 5.6**: Industry standard build tooling with type safety and excellent IDE support
- **Leaflet 1.9.4 + react-leaflet 5.0**: Battle-tested mapping library with declarative React bindings for simplified component architecture
- **OpenFreeMap tiles**: Zero-cost, zero-config tile provider (no API key, no registration, MIT license) using OpenStreetMap data
- **PapaParse 5.5**: Fastest browser CSV parser with Web Worker support for handling 500+ employee records
- **Turf.js 7.3 (@turf/distance)**: Modular geospatial calculations for haversine distance, tree-shakeable to ~3KB

**Critical version note**: react-leaflet v5 requires React 19. The ecosystem for v5 is still maturing, so some plugins may lag.

### Expected Features

Research shows users expect basic visualization and filtering as table stakes, with team co-location analysis as the key differentiator that neither GIS tools nor office management platforms provide well.

**Must have (table stakes):**
- Map visualization with employee home locations and office markers
- Employee-office distance display (straight-line acceptable for MVP)
- Filter by team/department (essential for 60+ employees)
- Search/find employee by name
- CSV import with address geocoding
- Basic access control (GDPR compliance requires explicit consent and role-based access)
- Office recommendation engine (nearest office)

**Should have (competitive advantage):**
- Team co-location analysis — "If team X all went to office Y, what's total commute impact?"
- Office coverage metrics — "What % of employees within X km of each office?"
- Heatmap of employee density — identify where new offices might make sense
- Export/reporting for leadership presentations

**Defer (v2+):**
- Team transfer suggestions (complex, needs user trust first)
- Scenario modeling (office closure impact)
- Commute isochrones (API costs, nice visualization but not essential)
- Driving/transit time calculations (adds API dependency)

**Anti-features (deliberately NOT building):**
- Real-time desk booking (separate problem domain, 60 people don't need it)
- Live location tracking (GDPR nightmare, invasive)
- Calendar integration (scope creep)
- Full HR system features (already have HR systems)

### Architecture Approach

The architecture follows layered separation with unidirectional data flow. All state changes flow through stores (using Zustand or React Context), components subscribe to stores and dispatch actions, services handle business logic and external API calls. This pattern prevents debugging nightmares from scattered state mutations while keeping components focused on presentation.

**Major components:**
1. **Presentation Layer**: MapContainer (React-Leaflet), FilterPanel (controls), DataTable (employee list) — all pure React components subscribing to stores
2. **State Management**: Employee Store (locations/attributes), Filter Store (active filters), Map View Store (center/zoom/bounds) — single source of truth
3. **Service Layer**: CSV Parser (PapaParse), Geocoding Service (Nominatim wrapper with rate limiting), Distance Calculator (Haversine), Data Validator (Zod schema) — testable business logic
4. **Data Layer**: In-memory working dataset + Browser Storage (localStorage for persistence) — no backend required

**Key patterns:**
- Derived state via selectors (filtered employees computed on render, not stored)
- Service layer abstraction (external APIs wrapped for testability)
- Component composition for maps (React-Leaflet's context-based architecture)

**Recommended build order** (from ARCHITECTURE.md):
1. Core data structure (types, utils, stores)
2. Data layer (CSV parsing, validation, store CRUD)
3. Map foundation (MapContainer, office markers, employee markers)
4. Filtering system (filter store, UI, derived state)
5. Distance features (calculation service, visualization)
6. Polish & performance (clustering, virtual scrolling, export)

### Critical Pitfalls

Research identified six critical pitfalls that must be addressed in foundation phases. Each has proven mitigation strategies.

1. **Geocoding Privacy Leak** — Sending employee home addresses to third-party geocoding APIs creates GDPR violations. Even client-side geocoding transmits personal data to external servers. **Mitigation**: Use providers with explicit GDPR compliance and no-record parameters (OpenCage offers `no_record=1`), or pre-geocode addresses before CSV import and only work with coordinates in the app.

2. **Marker Overload Crashes Browser** — Rendering 500+ individual DOM-based markers causes severe lag or crashes. Each marker creates DOM elements with event listeners. **Mitigation**: Implement marker clustering from day one using Leaflet.markercluster. Set clustering thresholds at 3-5 markers in proximity. Test with 500+ marker dataset.

3. **Haversine Distance Misleads Users** — Straight-line distance dramatically differs from actual travel distance. In Germany, rivers (Rhine, Elbe, Danube) commonly triple actual distances. **Mitigation**: Label distances explicitly as "straight-line distance" or "as the crow flies." Consider isochrone APIs for travel time contours if budget allows.

4. **CSV Encoding Destroys German Characters** — Excel exports CSV with Windows-1252 by default, not UTF-8. Umlauts (ä, ö, ü), eszett (ß) get corrupted, making addresses ungeocodable. **Mitigation**: Use PapaParse with encoding detection, provide clear instructions ("Save as CSV UTF-8"), display import preview so users catch encoding issues.

5. **Geocoding Rate Limits Block Batch Import** — Uploading 500 addresses triggers 500 simultaneous requests, exceeding free tier limits (1-5 req/sec). Most requests fail silently. **Mitigation**: Implement request queuing with throttling, show progress bar ("Geocoding 47/312..."), implement exponential backoff for 429 errors, cache results in localStorage.

6. **Initial Map Load Tanks Performance** — Map libraries (especially MapLibre GL JS at 800KB) destroy Core Web Vitals. Heavy JavaScript parsing blocks main thread. **Mitigation**: Lazy load map library using dynamic imports (`const L = await import('leaflet')`), show static placeholder initially, defer initialization until after DOMContentLoaded.

## Implications for Roadmap

Based on research findings, the roadmap should follow architecture build order while frontloading pitfall prevention. Team co-location features should come after core visualization is validated with users.

### Phase 1: Foundation & Data Pipeline
**Rationale:** Must establish type-safe data structures and CSV import before any visualization. Geocoding privacy and CSV encoding pitfalls must be addressed here, not retrofitted.

**Delivers:** CSV import with German character support, validated employee data structure, basic geocoding with GDPR compliance

**Addresses features:**
- Data import capability (table stakes)
- Basic privacy controls (GDPR requirement)

**Avoids pitfalls:**
- CSV encoding destroys German characters (implement encoding detection)
- Geocoding privacy leak (use GDPR-compliant provider with no-record flag)
- Rate limits block import (implement throttled queue from start)

**Research flag**: Standard patterns — CSV parsing and validation are well-documented. No phase-specific research needed.

### Phase 2: Map Visualization Core
**Rationale:** With data pipeline established, build basic map display. Marker clustering must be implemented immediately to avoid performance disasters. Lazy loading prevents initial load performance issues.

**Delivers:** Interactive map with Germany center, office markers, employee markers with clustering, lazy-loaded map library

**Addresses features:**
- Map visualization (table stakes)
- Office markers (table stakes)

**Uses stack:**
- Leaflet 1.9.4 + react-leaflet 5.0
- OpenFreeMap tiles (no API key)
- Leaflet.markercluster plugin

**Avoids pitfalls:**
- Marker overload crashes browser (clustering implemented day one)
- Initial load tanks performance (lazy loading, dynamic imports)

**Research flag**: Standard patterns — Leaflet integration and clustering are heavily documented. Follow React-Leaflet architecture guide.

### Phase 3: Filtering & Search
**Rationale:** With map rendering stable, add filtering to make 60+ employees manageable. Filter store and derived state patterns enable team-based views.

**Delivers:** Filter panel (team, department, distance), employee search, filtered marker display, data table view

**Addresses features:**
- Filter by team (table stakes)
- Search employee (table stakes)

**Implements architecture:**
- Filter Store with derived state via selectors
- useFilteredEmployees hook with useMemo

**Research flag**: Standard patterns — React state management for filters is straightforward. No additional research needed.

### Phase 4: Distance & Recommendations
**Rationale:** Distance calculations enable office recommendations. Must clearly label straight-line distances to avoid misleading users.

**Delivers:** Haversine distance calculation, office recommendation (nearest office), distance visualization on map, distance filter

**Addresses features:**
- Employee-office distance display (table stakes)
- Office recommendation engine (table stakes)

**Uses stack:**
- @turf/distance for haversine calculations

**Avoids pitfalls:**
- Haversine distance misleads users (clear "straight-line distance" labels, disclaimers)

**Research flag**: Standard patterns — Haversine formula is well-documented. Consider researching isochrone APIs if budget allows for v2.

### Phase 5: Team Co-Location Analysis
**Rationale:** Core differentiator that sets this tool apart. Requires validated foundation (phases 1-4) before adding complex team-based calculations.

**Delivers:** Team co-location analysis ("If team X went to office Y, what's impact?"), office coverage metrics, aggregate team statistics

**Addresses features:**
- Team co-location analysis (key differentiator)
- Office coverage analysis (competitive feature)

**Research flag**: **NEEDS RESEARCH** — Team-based optimization algorithms are less well-documented for this use case. Consider `/gsd:research-phase` for implementation strategies, performance optimization with large teams.

### Phase 6: Export & Polish
**Rationale:** After core features validated, add reporting for leadership presentations and production hardening.

**Delivers:** PDF/Excel export, heatmap visualization, error handling polish, accessibility improvements, production optimizations

**Addresses features:**
- Export/reporting (competitive feature)
- Heatmap (competitive feature)

**Research flag**: Standard patterns — Export libraries and heatmap plugins are well-documented.

### Phase Ordering Rationale

- **Foundation first** prevents technical debt. Geocoding privacy, CSV encoding, and rate limiting are architectural decisions that can't be easily retrofitted.
- **Clustering with initial map** avoids performance crisis. Adding clustering to 500+ existing markers is harder than starting with it.
- **Filter before distance** because filtering doesn't depend on calculations but enables meaningful distance views.
- **Distance before co-location** because team analysis depends on having reliable distance calculations.
- **Co-location after validation** because it's complex enough to warrant user feedback on simpler features first.
- **Export last** because it's polish for a working product, not core functionality.

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 5 (Team Co-Location)**: Complex optimization algorithms, performance considerations with aggregate calculations, UI design for multi-dimensional analysis

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation)**: CSV parsing and validation well-documented
- **Phase 2 (Map Core)**: Leaflet and React-Leaflet have extensive documentation
- **Phase 3 (Filtering)**: Standard React state patterns
- **Phase 4 (Distance)**: Haversine formula widely documented
- **Phase 6 (Export)**: Export libraries have good documentation

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations verified via official docs. Vite 7.3.1, Leaflet 1.9.4, react-leaflet v5 requirements confirmed. OpenFreeMap verified as zero-config option. |
| Features | MEDIUM | Based on ecosystem survey; no single authoritative source for this niche. Feature expectations derived from competitor analysis (Maptive, OfficeSpace, Robin) and office planning domain research. |
| Architecture | HIGH | React-Leaflet architecture patterns documented in official guides. Service layer and state management patterns are industry standard React practices. Build order validated against component dependencies. |
| Pitfalls | HIGH | All critical pitfalls verified through multiple sources. Geocoding privacy confirmed via OpenCage GDPR docs, performance issues documented in Mapbox/Leaflet guides, CSV encoding issues validated across multiple technical sources. |

**Overall confidence:** HIGH

Research sources are predominantly official documentation (Vite, Leaflet, React-Leaflet, PapaParse) with community validation for architectural patterns. Feature prioritization is medium confidence due to niche domain, but backed by multiple competitor analyses.

### Gaps to Address

**Driving vs. straight-line distance:** Research recommends starting with haversine (straight-line) distance but notes users may need driving distance. If straight-line proves insufficient during validation, Phase 4 should add routing API research (OSRM, GraphHopper, Valhalla — all OSM-based). This adds API dependency but may be necessary.

**Team co-location algorithms:** Phase 5 optimization strategies need validation during planning. Research suggests simple aggregation (average commute per team member) for MVP, but more sophisticated approaches (weighted by seniority, considering office capacity) may emerge during requirements.

**GDPR compliance details:** Research flags German BDSG requirements (explicit consent, data minimization, access restriction). Legal review recommended before Phase 1 to confirm geocoding provider selection and consent flows. Works council consultation may be required organizationally.

**React-leaflet v5 ecosystem maturity:** Some clustering plugins may not yet support React 19. If Leaflet.markercluster has compatibility issues, fallback is vanilla Leaflet clustering or wait for ecosystem to catch up. Test compatibility in Phase 2 scaffolding.

## Sources

### Primary (HIGH confidence)
Research drew from official documentation for all core technology decisions:
- Vite Getting Started (v7.3.1) — build tool requirements
- Leaflet Downloads (v1.9.4 stable) — mapping library versions
- React Leaflet Installation & Core Architecture — React bindings and component patterns
- OpenFreeMap — tile provider terms and configuration
- Turf.js — geospatial calculation modules
- PapaParse — CSV parsing capabilities

### Secondary (MEDIUM confidence)
Architectural patterns and feature prioritization validated through:
- Jawg MapLibre vs Leaflet Comparison — library performance trade-offs
- People Managing People Office Space Management — competitive feature analysis
- Maptive & eSpatial employee location mapping — use case patterns
- WINHELLER & RemoFirst German Employee Data Protection — GDPR/BDSG requirements
- Geoapify Batch Geocoding Tutorial — rate limiting strategies

### Tertiary (LOW confidence, validated through triangulation)
Performance and pitfall insights confirmed across multiple community sources:
- MDPI Vector Data Rendering Performance Analysis (2025) — marker rendering limits
- Medium & Tighten blog posts on map performance — clustering necessity
- CSV encoding guides — German character handling
- GitHub office workspace optimization examples — algorithm approaches

All four research files (STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md) contain detailed source citations with confidence ratings.

---
*Research completed: 2026-02-06*
*Ready for roadmap: yes*
