---
phase: 02-map-filtering
plan: 01
subsystem: map-utilities
tags: [react-leaflet, zustand, leaflet, filtering, markers]

dependency-graph:
  requires: [01-foundation]
  provides: [filter-store, marker-utilities]
  affects: [02-02, 02-03, 02-04]

tech-stack:
  added:
    - react-leaflet@5.0.0
    - leaflet@1.9.4
    - react-leaflet-cluster@4.0.0
    - use-debounce@10.1.0
    - "@types/leaflet@1.9.21"
  patterns:
    - zustand-session-store
    - leaflet-divicon-svg

key-files:
  created:
    - src/stores/filterStore.ts
    - src/utils/markerColors.ts
    - src/utils/markerIcons.ts
  modified:
    - package.json
    - package-lock.json

decisions:
  - id: filter-session-only
    choice: "No persist middleware for filterStore"
    rationale: "Filter state is session-specific; users expect fresh filters on page reload"

metrics:
  duration: 2m 23s
  completed: 2026-02-06
---

# Phase 2 Plan 1: Map Utilities & Filter Store Foundation Summary

**One-liner:** React Leaflet dependencies with Zustand filter store and SVG marker icon factories for team/department/office color-coding.

## What Was Built

### 1. React Leaflet Dependencies

Installed complete mapping stack:
- `react-leaflet@5.0.0` - React wrapper for Leaflet
- `leaflet@1.9.4` - Core mapping library
- `react-leaflet-cluster@4.0.0` - Marker clustering for performance
- `use-debounce@10.1.0` - Search input optimization
- `@types/leaflet@1.9.21` - TypeScript support

### 2. Filter Store (src/stores/filterStore.ts)

Zustand store for filter state management:

```typescript
interface FilterState {
  teamFilter: string | null;
  departmentFilter: string | null;
  officeFilter: string | null;
  searchQuery: string;
  colorBy: 'team' | 'department' | 'assignedOffice';
  selectedEmployeeId: string | null;
}
```

Key behaviors:
- `setTeamFilter()`, `setDepartmentFilter()`, `setOfficeFilter()` - filter setters
- `setColorBy()` - controls marker color grouping
- `setSelectedEmployeeId()` - for flyTo highlight feature
- `clearFilters()` - resets all filters except colorBy (intentional UX)

No persist middleware - filter state is session-only (users expect fresh state on reload).

### 3. Marker Colors (src/utils/markerColors.ts)

Color palettes for all grouping options:

| Palette | Values | Colors |
|---------|--------|--------|
| TEAM_COLORS | 8 teams + default | Blue, amber, red, green, orange, yellow, purple, slate |
| DEPARTMENT_COLORS | 7 departments + default | Blue, violet, pink, cyan, lime, emerald, rose |
| OFFICE_COLORS | 5 German offices + default | Blue (Berlin), green (Munich), red (Hamburg), amber (Frankfurt), purple (Cologne) |

`getColorForEmployee(employee, colorBy)` provides unified lookup with fallback to DEFAULT_COLOR.

### 4. Marker Icons (src/utils/markerIcons.ts)

Leaflet DivIcon factories with inline SVG:

**createEmployeeIcon(color, isHighlighted?)**
- Pin shape with dynamic fill color
- Normal: 25px, Highlighted: 35px
- White stroke for visibility
- iconAnchor at bottom center, popupAnchor above

**createOfficeIcon()**
- Building shape with windows
- Fixed 32px size, dark blue (#1a365d) fill
- Distinct visual style from employee markers

## Task Commits

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Install react-leaflet dependencies | 4a7d398 | package.json, package-lock.json |
| 2 | Create filter store with Zustand | 4e53009 | src/stores/filterStore.ts |
| 3 | Create marker color and icon utilities | e395914 | src/utils/markerColors.ts, src/utils/markerIcons.ts |

## Decisions Made

### 1. Filter state is session-only (no persist)

**Context:** Could use Zustand persist middleware like employeeStore.
**Decision:** No persistence for filterStore.
**Rationale:** Filter state is contextual to a session. Users expect fresh filters on page reload. Persisting would create confusing UX where old filter state reappears.

### 2. Namespace import for Leaflet

**Context:** `import L from 'leaflet'` caused TS1192 error (no default export).
**Decision:** Use `import * as L from 'leaflet'` namespace import.
**Rationale:** TypeScript strict mode requires proper module handling. Namespace import is correct pattern for Leaflet's type definitions.

### 3. Accessible color palette

**Context:** Need distinct colors for 8 teams, 7 departments, 5 offices.
**Decision:** Use Tailwind color palette (blue-600, amber-500, etc.) as reference.
**Rationale:** Well-tested for accessibility, sufficient contrast, familiar to users.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed Leaflet import syntax**

- **Found during:** Task 3
- **Issue:** TypeScript error TS1192 - Leaflet types don't export default
- **Fix:** Changed `import L from 'leaflet'` to `import * as L from 'leaflet'`
- **Files modified:** src/utils/markerIcons.ts
- **Commit:** e395914

## Verification Results

- [x] `npm ls react-leaflet leaflet` - packages installed
- [x] `npx tsc --noEmit` - no TypeScript errors
- [x] filterStore.ts exports useFilterStore
- [x] markerColors.ts exports TEAM_COLORS, getColorForEmployee
- [x] markerIcons.ts exports createEmployeeIcon, createOfficeIcon

## Next Phase Readiness

**Provides for 02-02:**
- Filter store ready for FilterPanel component integration
- Marker icons ready for EmployeeMarker and OfficeMarker components

**Provides for 02-03:**
- Color utilities ready for map legend component
- colorBy state ready for dynamic recoloring

**No blockers identified.**

## Self-Check: PASSED
