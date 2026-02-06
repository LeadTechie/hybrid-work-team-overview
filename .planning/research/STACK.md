# Stack Research

**Domain:** Browser-based geospatial visualization / office planning tool
**Researched:** 2026-02-06
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vite | ^7.3 | Build tool & dev server | Industry standard for React in 2025-2026. Near-instant HMR, optimized production builds with Rollup. Replaced Create React App as the default. |
| React | ^19.0 | UI framework | Required for react-leaflet v5. Mature ecosystem, familiar patterns. |
| TypeScript | ^5.6 | Type safety | Catches errors early, better IDE support, self-documenting code. All recommended libraries have TS types. |
| Leaflet | ^1.9.4 | Map rendering | Most popular open-source mapping library (2.3M weekly npm downloads). Simple API, extensive plugin ecosystem, works well for Germany-focused static maps. |
| react-leaflet | ^5.0 | React bindings for Leaflet | Official React wrapper. v5 requires React 19. Provides declarative map components. |

### Tile Provider

| Provider | Cost | Purpose | Why Recommended |
|----------|------|---------|-----------------|
| OpenFreeMap | Free | Base map tiles | No API key required, no registration, no usage limits. Uses OpenStreetMap data. MIT license. Perfect for static web apps. |

**Tile URL:** `https://tiles.openfreemap.org/styles/liberty/{z}/{x}/{y}.png`

**Attribution required:** `OpenFreeMap | OpenMapTiles | OpenStreetMap contributors`

**Alternative:** For self-hosting or custom needs, use [OpenMapTiles](https://openmaptiles.org/) to generate your own tiles from OpenStreetMap data.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| PapaParse | ^5.5 | CSV parsing | Import/export employee and office data. Fastest browser CSV parser with Web Worker support. |
| Turf.js | ^7.3 | Geospatial calculations | Distance calculations (haversine), point-in-polygon, buffering. Modular - import only what you need. |
| @turf/distance | ^7.3 | Distance calculation | Standalone module for as-crow-flies distance. ~3KB when tree-shaken. |
| Nominatim API | N/A | Geocoding (optional) | Convert addresses to coordinates. Free OSM-based API. Rate limit: 1 req/sec. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| @vitejs/plugin-react-swc | Fast React transforms | Uses SWC (Rust-based) instead of Babel. Significantly faster builds. |
| @types/leaflet | TypeScript types for Leaflet | Required for TS projects using Leaflet. |
| ESLint + Prettier | Code quality | Standard for React/TS projects. |
| Vitest | Unit testing | Vite-native test runner. Fast, compatible with Jest API. |

## Installation

```bash
# Create project
npm create vite@latest hybrid-office-finder -- --template react-swc-ts

# Core mapping
npm install leaflet react-leaflet

# Data handling
npm install papaparse @turf/distance

# Types (dev)
npm install -D @types/leaflet @types/papaparse
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Leaflet | MapLibre GL JS | Need 3D visualization, map rotation, or 500K+ markers. Higher learning curve, WebGL required. |
| Leaflet | OpenLayers | Need advanced GIS features (WMS, WFS, projections). Steeper learning curve, larger bundle. |
| react-leaflet | vanilla Leaflet | Performance-critical rendering of 10K+ markers. React abstraction adds overhead. |
| OpenFreeMap | MapTiler | Need premium styles or commercial SLA. Free tier available with API key. |
| PapaParse | d3-dsv | Already using D3 ecosystem. PapaParse is faster and has more features standalone. |
| Turf.js | haversine-distance | Only need simple point-to-point distance. Turf provides room to grow. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Google Maps API | Expensive ($7/1000 loads), requires API key, violates "no backend/tracking" requirement | Leaflet + OpenFreeMap |
| Mapbox GL JS | Proprietary license since 2020, requires API token, usage-based pricing | Leaflet or MapLibre GL JS |
| Create React App | Deprecated, slow, no longer maintained | Vite |
| Leaflet 2.0.0-alpha | Not stable (alpha), breaking changes expected | Leaflet 1.9.4 (stable) |
| react-leaflet-markercluster (old) | Compatibility issues with React 19 | Wait for stable v5 ecosystem or use vanilla Leaflet clustering |

## Stack Patterns by Variant

**If rendering > 1000 employee markers:**
- Use Leaflet marker clustering plugin (`leaflet.markercluster`)
- Or render markers to Canvas instead of DOM
- Because: Each Leaflet marker is a DOM element; performance degrades at scale

**If need address-to-coordinate conversion:**
- Use Nominatim API (free, OSM-based)
- Respect rate limit (1 request/second)
- Consider batch processing with delays
- Because: No API key required, GDPR-friendly (no tracking)

**If need route-based (driving) distances:**
- This requires additional research
- Options: OSRM, GraphHopper, Valhalla (all OSM-based)
- Because: Haversine only gives straight-line distance

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| react-leaflet@5.x | react@19, leaflet@1.9.x | v5 requires React 19 |
| react-leaflet@4.x | react@18, leaflet@1.8+ | Use if staying on React 18 |
| vite@7.x | node@20.19+ or node@22.12+ | Check Node version first |
| @turf/distance@7.x | ESM or CommonJS | Tree-shakeable, TypeScript native |

## Confidence Assessment

| Decision | Confidence | Rationale |
|----------|------------|-----------|
| Vite + React + TS | HIGH | Verified via official Vite docs (v7.3.1 current). Industry standard. |
| Leaflet 1.9.4 | HIGH | Verified via GitHub releases. Stable release, 1.x in maintenance mode. |
| react-leaflet 5.x | MEDIUM | Docs confirm React 19 requirement. Ecosystem still maturing for v5. |
| OpenFreeMap | HIGH | Verified via official site. No API key, MIT license, attribution required. |
| PapaParse | HIGH | Multiple sources confirm fastest browser CSV parser. 5.3M weekly downloads. |
| Turf.js 7.3 | HIGH | Verified via official site. Active development (Jan 2026 update). |

## Sources

### Official Documentation (HIGH confidence)
- [Vite Getting Started](https://vite.dev/guide/) - v7.3.1, Node 20.19+/22.12+ required
- [Leaflet Downloads](https://leafletjs.com/download.html) - v1.9.4 stable, v2.0.0-alpha.1 in development
- [React Leaflet Installation](https://react-leaflet.js.org/docs/start-installation/) - v5.x requires React 19
- [OpenFreeMap](https://openfreemap.org/) - No API key, MIT license
- [Turf.js](https://turfjs.org/) - v7.3.0, TypeScript native
- [PapaParse](https://www.papaparse.com/) - Browser-optimized CSV parser

### Comparative Analysis (MEDIUM confidence)
- [Jawg MapLibre vs Leaflet Comparison](https://blog.jawg.io/maplibre-gl-vs-leaflet-choosing-the-right-tool-for-your-interactive-map/)
- [Geoapify Map Libraries Comparison](https://www.geoapify.com/map-libraries-comparison-leaflet-vs-maplibre-gl-vs-openlayers-trends-and-statistics/)
- [LeanlyLabs CSV Parsers Benchmark](https://leanylabs.com/blog/js-csv-parsers-benchmarks/)

### Cost Analysis (MEDIUM confidence)
- [Google Maps API 2025 Pricing Changes](https://www.microlab.at/en/news/google-maps-api:-new-prices-starting-march-2025-what-you-need-to-know-now-16589.html)
- [GIS People Mapping Libraries Comparison](https://www.gispeople.com.au/mapbox-vs-maptiler-vs-maplibre-vs-leaflet-which-to-choose/)

---
*Stack research for: Hybrid Office Finder - Browser-based map visualization*
*Researched: 2026-02-06*
