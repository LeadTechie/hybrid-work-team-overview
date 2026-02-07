# Phase 5: Better Visualizations - Research

**Researched:** 2026-02-07
**Domain:** Leaflet/react-leaflet map interactions, CSS filters, Polyline overlays, Google Maps URLs
**Confidence:** HIGH

## Summary

This phase adds four visualization enhancements to the existing Leaflet map: (1) a B&W/faded map toggle for better marker contrast, (2) distance lines from a clicked employee to all offices, (3) Google Maps navigation links in employee popups, and (4) visually distinct selected employee markers. All four features build on the existing react-leaflet 5.0 + Leaflet 1.9.4 stack with no new library dependencies required.

The key technical findings are that grayscale tile toggling is best achieved via CSS `filter: grayscale(100%)` on the TileLayer's container element (using the `className` prop with a React `key` to force re-mount on change), Polyline + Tooltip components from react-leaflet handle distance lines with labels natively, and Google Maps directions URLs follow a simple documented format (`https://www.google.com/maps/dir/?api=1&origin=lat,lng&destination=lat,lng`). The selected marker distinction already exists in the codebase (size 35 vs 25, strokeWidth 3 vs 2) but can be enhanced with a pulsing CSS animation and different color treatment.

**Primary recommendation:** Use only built-in react-leaflet components (Polyline, Tooltip, Marker, TileLayer) and CSS to implement all four features. No new npm dependencies needed.

## Standard Stack

### Core (already installed -- no changes)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-leaflet | 5.0.0 | React bindings for Leaflet | Already in use, provides Polyline, Tooltip, TileLayer components |
| leaflet | 1.9.4 | Map rendering engine | Already in use, TileLayer supports className option |
| zustand | 5.0.11 | State management | Already in use for filterStore (selectedEmployeeId, new mapMode state) |

### Supporting (no new packages)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Built-in CSS filters | N/A | Grayscale/desaturate tile layers | Toggle map mode via className + CSS |
| L.divIcon | 1.9.4 (bundled) | Distance label markers at polyline midpoints | Show "42.3 km" labels on distance lines |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS className grayscale | leaflet.tilelayer.colorfilter npm plugin | Plugin offers more filter options but adds dependency for a single CSS rule |
| Polyline + Tooltip (react-leaflet) | Leaflet.PolylineMeasure plugin | Plugin is for interactive measurement, not programmatic display |
| Marker with DivIcon for labels | Polyline permanent Tooltip | Tooltip positioning on polylines has known bugs (Leaflet #5758); DivIcon at calculated midpoint is more reliable |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    map/
      MapView.tsx              # Modified: add grayscale toggle, distance lines
      EmployeeMarker.tsx       # Modified: click handler to select, enhanced popup
      DistanceLines.tsx        # NEW: renders Polylines + labels for selected employee
      MapController.tsx        # Existing: already handles flyTo on selection
      MapLegend.tsx            # Existing: no changes
      OfficeMarker.tsx         # Existing: no changes
  stores/
    filterStore.ts             # Modified: add mapMode state ('normal' | 'grayscale')
  utils/
    distance.ts                # Existing: already has calculateDistance + formatDistance
    googleMapsUrl.ts           # NEW: build Google Maps directions URL
    markerIcons.ts             # Modified: enhanced selected marker icon
```

### Pattern 1: CSS Grayscale Toggle via TileLayer className + key
**What:** Apply CSS `filter: grayscale(100%)` to tile layer via className. Use React `key` prop to force TileLayer re-mount when class changes (react-leaflet does not re-render TileLayer on className change -- confirmed in react-leaflet issue #498).
**When to use:** Any time you need to toggle visual appearance of map tiles at runtime.
**Example:**
```typescript
// Source: Leaflet docs (className on GridLayer), react-leaflet issue #498
// In MapView.tsx:
const { mapMode } = useFilterStore();
const tileClassName = mapMode === 'grayscale' ? 'map-tiles-grayscale' : '';

<TileLayer
  key={tileClassName} // Forces re-mount when className changes
  className={tileClassName}
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
/>
```
```css
/* In App.css */
.map-tiles-grayscale {
  filter: grayscale(100%) brightness(105%);
}
```

### Pattern 2: Distance Lines as Separate Component
**What:** A `DistanceLines` component that reads selectedEmployeeId from the store, gets the employee coords, and renders Polylines to each office with distance labels at midpoints.
**When to use:** When a single employee is selected and distance visualization is needed.
**Example:**
```typescript
// Source: react-leaflet docs (Polyline, Tooltip components)
// DistanceLines.tsx
import { Polyline, Tooltip } from 'react-leaflet';
import { calculateDistance, formatDistance } from '../../utils/distance';

function DistanceLines({ employee, offices }) {
  return (
    <>
      {offices.map((office) => {
        if (!employee.coords || !office.coords) return null;
        const dist = calculateDistance(
          employee.coords.lat, employee.coords.lon,
          office.coords.lat, office.coords.lon
        );
        const positions: [number, number][] = [
          [employee.coords.lat, employee.coords.lon],
          [office.coords.lat, office.coords.lon],
        ];
        return (
          <Polyline
            key={office.id}
            positions={positions}
            pathOptions={{ color: '#3b82f6', weight: 2, dashArray: '8 4' }}
          >
            <Tooltip permanent direction="center" className="distance-tooltip">
              {formatDistance(dist)}
            </Tooltip>
          </Polyline>
        );
      })}
    </>
  );
}
```

### Pattern 3: Google Maps URL Builder
**What:** Pure function that constructs a Google Maps directions URL from employee coords to office coords.
**When to use:** In employee popup/tooltip to provide verification link.
**Example:**
```typescript
// Source: https://developers.google.com/maps/documentation/urls/get-started
// googleMapsUrl.ts
export function buildGoogleMapsDirectionsUrl(
  origin: { lat: number; lon: number },
  destination: { lat: number; lon: number },
  travelMode: 'driving' | 'transit' | 'walking' | 'bicycling' = 'driving'
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lon}&destination=${destination.lat},${destination.lon}&travelmode=${travelMode}`;
}
```

### Pattern 4: Click-to-Select Employee Marker
**What:** Use eventHandlers prop on Marker to set selectedEmployeeId in the filter store. The existing `isHighlighted` prop already changes icon size.
**When to use:** On every EmployeeMarker -- clicking selects/deselects.
**Example:**
```typescript
// Source: react-leaflet docs (Marker eventHandlers)
<Marker
  position={[employee.coords.lat, employee.coords.lon]}
  icon={icon}
  eventHandlers={{
    click: () => {
      const current = useFilterStore.getState().selectedEmployeeId;
      useFilterStore.getState().setSelectedEmployeeId(
        current === employee.id ? null : employee.id
      );
    },
  }}
>
```

### Anti-Patterns to Avoid
- **Swapping TileLayer URL for grayscale tiles:** Don't switch to a different tile server for grayscale. CSS filters work on any tile source and avoid cache invalidation and additional network requests.
- **Using leaflet-grayscale plugin:** It's a canvas-based approach that doesn't integrate well with react-leaflet's component model and adds an unnecessary dependency.
- **Placing distance labels as Markers instead of Polyline Tooltips first:** Try Polyline + permanent Tooltip first (simpler). Only fall back to DivIcon Markers at midpoints if Tooltip positioning is unreliable in practice.
- **Re-rendering all markers on selection change:** The existing React.memo on EmployeeMarker already prevents this. Only the selected and previously-selected markers re-render.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Grayscale map tiles | Custom canvas tile manipulation | CSS `filter: grayscale(100%)` on TileLayer className | GPU-accelerated, one line of CSS, no library needed |
| Distance calculation | Custom distance math | Existing `calculateDistance()` in `src/utils/distance.ts` | Haversine formula already implemented and tested |
| Distance formatting | Custom number formatting | Existing `formatDistance()` in `src/utils/distance.ts` | Already handles m vs km with proper rounding |
| Google Maps URL encoding | Manual URL string concatenation with encoding | Simple template literal (coords are numeric, no encoding needed) | Lat/lng are pure numbers, no special characters to encode |
| Polyline rendering | Direct L.polyline() Leaflet calls | react-leaflet `<Polyline>` component | Integrates with React lifecycle, auto-cleanup |

**Key insight:** This phase requires zero new npm dependencies. Every feature maps to existing react-leaflet components, CSS capabilities, or utility functions already in the codebase.

## Common Pitfalls

### Pitfall 1: TileLayer className Not Updating on Prop Change
**What goes wrong:** Changing the `className` prop on react-leaflet's `<TileLayer>` has no visual effect.
**Why it happens:** react-leaflet treats TileLayer className as an immutable/creation-time property. It is not listed as a dynamic/mutable prop in react-leaflet v5 docs.
**How to avoid:** Use the React `key` prop to force unmount/remount of TileLayer when className changes. Example: `key={mapMode}` or `key={tileClassName}`.
**Warning signs:** Toggle button appears to work (state changes) but map appearance doesn't change.

### Pitfall 2: Polyline Tooltip Positioning at Wrong Location
**What goes wrong:** Permanent tooltips on Polylines appear at the endpoint or corner instead of the midpoint.
**Why it happens:** Known Leaflet issue (#5758) -- tooltip positioning on polylines is inconsistent, especially for simple 2-point lines.
**How to avoid:** Use `direction: 'center'` on the Tooltip. For a 2-point polyline (straight line from employee to office), this should position at the visual center. If it doesn't, fall back to a separate Marker with DivIcon at the calculated midpoint coordinates.
**Warning signs:** Distance labels stack at one end of the line instead of appearing in the middle.

### Pitfall 3: Performance with Many Distance Lines
**What goes wrong:** Selecting an employee draws lines to all offices (5 offices = 5 polylines + 5 tooltips). This is fine. But if the app scales to 20+ offices, performance could degrade.
**Why it happens:** Each Polyline + Tooltip is a separate DOM element with event listeners.
**How to avoid:** With the current app (5 offices max, per DATA_LIMITS), this is not a concern. If scaling, limit to nearest N offices or use Canvas renderer.
**Warning signs:** Map becomes sluggish when selecting an employee.

### Pitfall 4: Google Maps Link Opens in Same Tab
**What goes wrong:** Clicking the Google Maps link navigates away from the application, losing state.
**Why it happens:** Default `<a>` tag behavior.
**How to avoid:** Always use `target="_blank"` and `rel="noopener noreferrer"` on Google Maps links.
**Warning signs:** User clicks link and application reloads.

### Pitfall 5: CSP Blocking Google Maps Navigation
**What goes wrong:** Links to Google Maps don't work.
**Why it happens:** Might incorrectly assume CSP `connect-src` applies.
**How to avoid:** CSP `connect-src` only applies to `fetch()`, `XMLHttpRequest`, WebSocket, etc. Regular `<a href>` navigation links are NOT blocked by `connect-src`. No CSP changes needed for outbound links.
**Warning signs:** N/A -- this is actually a non-issue, documented here to prevent unnecessary CSP modifications.

### Pitfall 6: Selected Marker Not Visually Distinct Enough
**What goes wrong:** Size increase alone (25px to 35px) is hard to notice among clustered markers.
**Why it happens:** The current highlight is subtle -- only a size and stroke width change.
**How to avoid:** Add a CSS pulsing animation, a different color/outline, or a glow effect to the selected marker. The `employee-marker` className on the DivIcon enables CSS targeting.
**Warning signs:** Users can't find the selected employee on the map.

## Code Examples

### Grayscale Toggle State in Zustand Store
```typescript
// In filterStore.ts - add mapMode
export type MapMode = 'normal' | 'grayscale';

interface FilterState {
  // ... existing fields ...
  mapMode: MapMode;
  setMapMode: (mode: MapMode) => void;
}

// In create():
mapMode: 'normal',
setMapMode: (mode) => set({ mapMode: mode }),
```

### Grayscale CSS
```css
/* In App.css */
.map-tiles-grayscale {
  filter: grayscale(100%) brightness(105%);
}
```

### Google Maps URL Utility
```typescript
// Source: https://developers.google.com/maps/documentation/urls/get-started
export function buildGoogleMapsDirectionsUrl(
  origin: { lat: number; lon: number },
  destination: { lat: number; lon: number },
  travelMode: 'driving' | 'transit' | 'walking' | 'bicycling' = 'driving'
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lon}&destination=${destination.lat},${destination.lon}&travelmode=${travelMode}`;
}
```

### Enhanced Employee Popup with Google Maps Links
```typescript
// In EmployeeMarker.tsx popup
<Popup>
  <div>
    <strong>{employee.name}</strong>
    <br />Team: {employee.team}
    {employee.department && <><br />Dept: {employee.department}</>}
    {employee.assignedOffice && (
      <>
        <br />Office: {employee.assignedOffice}
        <br />
        <a
          href={buildGoogleMapsDirectionsUrl(employee.coords, officeCoords)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Navigate to {employee.assignedOffice}
        </a>
      </>
    )}
  </div>
</Popup>
```

### Selected Marker Pulse Animation CSS
```css
/* Pulsing animation for selected employee marker */
.employee-marker-selected svg {
  filter: drop-shadow(0 0 6px rgba(59, 130, 246, 0.8));
  animation: marker-pulse 1.5s ease-in-out infinite;
}

@keyframes marker-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
```

### Midpoint Calculation for Distance Labels
```typescript
// Calculate midpoint between two coordinates for label placement
function getMidpoint(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
): [number, number] {
  return [(a.lat + b.lat) / 2, (a.lon + b.lon) / 2];
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Canvas-based tile grayscale (leaflet-grayscale) | CSS filter on TileLayer className | CSS filter support mature since ~2020 | No plugin dependency, GPU accelerated |
| Manual Leaflet polyline creation with L.polyline() | react-leaflet `<Polyline>` component | react-leaflet v3+ (2021) | Declarative React pattern, auto-cleanup |
| Google Maps URL `https://maps.google.com/?saddr=...&daddr=...` | `https://www.google.com/maps/dir/?api=1&origin=...&destination=...` | Google Maps URLs API (current standard) | Old format still works but new format is officially documented and supported |

**Deprecated/outdated:**
- `leaflet-grayscale` plugin: Unmaintained, canvas-based approach superseded by CSS filters
- Old Google Maps URL format (`saddr`/`daddr`): Still functional but `api=1` format is the official documented approach
- `leaflet.tilelayer.colorfilter` v1.x: Renamed methods in v2.0 (`updateFilter` -> `updateColorFilter`)

## Open Questions

1. **Polyline Tooltip positioning reliability on 2-point lines**
   - What we know: Leaflet has known issues with permanent tooltip positioning on polylines (issue #5758). `direction: 'center'` should work for simple 2-point lines.
   - What's unclear: Whether this works reliably in Leaflet 1.9.4 with react-leaflet 5.0 for all line orientations.
   - Recommendation: Implement with Polyline Tooltip first. If positioning is unreliable, fall back to Marker with DivIcon at calculated midpoint. Both approaches are straightforward.

2. **MarkerClusterGroup interaction with selected employee**
   - What we know: Employees are rendered inside `<MarkerClusterGroup chunkedLoading>`. When zoomed out, the selected employee may be clustered and not individually visible.
   - What's unclear: Whether clicking a cluster auto-zooms to reveal the selected marker, and whether distance lines should show when the marker is clustered.
   - Recommendation: When an employee is selected, use the existing MapController flyTo (zoom level 14) to zoom in enough to de-cluster. Distance lines should render regardless of cluster state (they connect to the employee's coords, not the cluster position). The existing MapController already handles this flyTo behavior.

3. **Toggle button placement for B&W mode**
   - What we know: The sidebar has filter controls, and the map has a legend overlay.
   - What's unclear: Where the B&W toggle button should go -- sidebar filter panel or as a map overlay control.
   - Recommendation: Add it to the sidebar filter panel as a toggle/checkbox, keeping all map controls in one place. Consistent with the existing colorBy dropdown being in the sidebar.

## Sources

### Primary (HIGH confidence)
- Leaflet 1.9.4 official docs (https://leafletjs.com/reference.html) - TileLayer className option, Polyline, Tooltip, DivIcon
- react-leaflet v5 docs (https://react-leaflet.js.org/docs/api-components/) - Polyline positions/pathOptions, Tooltip props, Marker eventHandlers
- Google Maps URLs API (https://developers.google.com/maps/documentation/urls/get-started) - Directions URL format with origin/destination/travelmode params

### Secondary (MEDIUM confidence)
- react-leaflet issue #498 (https://github.com/PaulLeCam/react-leaflet/issues/498) - Confirmed TileLayer className is not a dynamic prop, key-based re-mount is the documented workaround
- Leaflet issue #5758 (https://github.com/Leaflet/Leaflet/issues/5758) - Polyline tooltip positioning inconsistencies
- Leaflet.TileLayer.ColorFilter README (https://github.com/xtk93x/Leaflet.TileLayer.ColorFilter) - Alternative plugin approach (not recommended but evaluated)

### Tertiary (LOW confidence)
- Various blog posts on CSS filter approach for Leaflet tiles -- consistent with official Leaflet docs confirming className support

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All components already installed, no new deps needed. Verified against package.json and react-leaflet docs.
- Architecture: HIGH - Patterns use documented react-leaflet components (Polyline, Tooltip, Marker eventHandlers). CSS filter approach confirmed by Leaflet docs and community.
- Pitfalls: HIGH - TileLayer className issue confirmed by react-leaflet maintainer in issue #498. Google Maps URL format verified from official docs. Polyline tooltip issue documented in Leaflet issue tracker.
- Code examples: HIGH - Based on existing codebase patterns (createEmployeeIcon, calculateDistance, filterStore) and official react-leaflet/Google Maps documentation.

**Research date:** 2026-02-07
**Valid until:** 2026-03-07 (stable -- Leaflet 1.9.4 and react-leaflet 5.0 are mature releases)
