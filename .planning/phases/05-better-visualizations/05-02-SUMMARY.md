---
phase: 05-better-visualizations
plan: 02
subsystem: ui
tags: [leaflet, react-leaflet, distance, google-maps, markers, haversine]

# Dependency graph
requires:
  - phase: 05-01
    provides: "filterStore mapMode state, markerIcons utility, googleMapsUrl utility, distance utility, CSS animations"
  - phase: 02-02
    provides: "MapView with clustering, EmployeeMarker with memo, OfficeMarker, MapController"
provides:
  - "DistanceLines component rendering polylines from selected employee to all offices"
  - "Grayscale map toggle wired to sidebar checkbox"
  - "Google Maps navigation links in employee popups (closest office)"
  - "Click-to-select employee with zoom-to-fit all offices"
  - "Closest office calculation shown in employee popup"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Closest office calculation using haversine distance in popup"
    - "fitBounds for zoom-to-fit employee and all offices"
    - "Conditional rendering of DistanceLines overlay outside cluster group"

key-files:
  created:
    - "src/components/map/DistanceLines.tsx"
  modified:
    - "src/components/map/EmployeeMarker.tsx"
    - "src/components/map/MapView.tsx"
    - "src/components/map/MapController.tsx"
    - "src/components/filters/FilterPanel.tsx"
    - "src/utils/markerIcons.ts"

key-decisions:
  - "Closest office replaces assigned office for Google Maps navigation link"
  - "Assigned office shown as secondary label only when different from closest"
  - "Employee marker size increased to 32px default / 42px highlighted for visibility"
  - "fitBounds with maxZoom:10 and padding:[50,50] for zoom-to-fit on employee select"
  - "MapController receives offices prop to compute bounds across all office locations"

patterns-established:
  - "Closest office pattern: filter geocoded offices, compute haversine distances, pick minimum"
  - "fitBounds pattern: collect all relevant LatLng points into bounds, fly to bounds with padding"

# Metrics
duration: 5min
completed: 2026-02-07
---

# Phase 5 Plan 2: Visualization Feature Wiring Summary

**Distance lines, grayscale toggle, closest-office popups with Google Maps links, and zoom-to-fit on employee selection**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-07T14:22:46Z
- **Completed:** 2026-02-07T14:27:00Z
- **Tasks:** 3 (2 auto + 1 checkpoint with feedback iteration)
- **Files modified:** 6

## Accomplishments
- DistanceLines component draws dashed polylines from selected employee to all offices with permanent distance labels
- B&W/grayscale map toggle in sidebar filter panel, applies CSS filter to tile layer
- Click-to-select employees with visual pulse animation and distance line overlay
- Closest office calculation in employee popup replaces assigned office for navigation
- Google Maps directions link navigates to nearest office (haversine distance)
- Larger employee markers (32px default, 42px highlighted) for better visibility
- Zoom-to-fit using fitBounds shows employee and all offices when selected

## Task Commits

Each task was committed atomically:

1. **Task 1: Create DistanceLines component and wire MapView with grayscale toggle** - `b5b9ba4` (feat)
2. **Task 2: Add click-to-select and Google Maps links to EmployeeMarker, B&W toggle to FilterPanel** - `d3c02ae` (feat)
3. **Task 3: Checkpoint feedback - closest office, larger markers, zoom-to-fit** - `a5347c1` (fix)

## Files Created/Modified
- `src/components/map/DistanceLines.tsx` - Polyline overlay from selected employee to all offices with distance tooltips
- `src/components/map/EmployeeMarker.tsx` - Click-to-select, closest office calculation, Google Maps link to nearest office
- `src/components/map/MapView.tsx` - Grayscale tile toggle, DistanceLines integration, passes offices to MapController
- `src/components/map/MapController.tsx` - fitBounds to zoom out and show employee + all offices
- `src/components/filters/FilterPanel.tsx` - B&W map mode checkbox toggle
- `src/utils/markerIcons.ts` - Larger employee marker sizes (32px/42px)

## Decisions Made
- [05-02]: Closest office replaces assigned office as primary in popup and navigation link
- [05-02]: Assigned office shown as secondary label only when different from closest office
- [05-02]: Employee marker base size 32px (was 25px), highlighted 42px (was 35px)
- [05-02]: fitBounds with maxZoom:10 prevents over-zooming when offices are nearby
- [05-02]: MapController receives offices prop rather than reading from store (explicit data flow)

## Deviations from Plan

### Checkpoint Feedback Changes

The following changes were requested during human-verify checkpoint review and implemented as Task 3:

**1. Closest office calculation in popup**
- Replaced assigned office with closest office (haversine distance) in employee popup
- Shows "Closest office: Name (X.X km)" instead of "Office: Name"

**2. Google Maps link uses closest office**
- Navigation link now directs to nearest office by distance, not the assigned office

**3. Larger employee markers**
- Default size increased from 25px to 32px, highlighted from 35px to 42px

**4. Zoom-to-fit on employee selection**
- MapController changed from flyTo(zoom:14) to fitBounds covering employee + all offices
- Uses padding:[50,50] and maxZoom:10 for comfortable viewing

**5. Assigned office shown conditionally**
- Assigned office label only appears when it differs from the closest office, reducing clutter

---

**Total deviations:** 5 checkpoint feedback items (all user-requested improvements)
**Impact on plan:** All changes improve UX based on visual review. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All Phase 5 visualization features complete
- Phase 02-04 (distance table/intelligence) remains unexecuted if planned
- Application feature-complete for current roadmap

## Self-Check: PASSED

---
*Phase: 05-better-visualizations*
*Completed: 2026-02-07*
