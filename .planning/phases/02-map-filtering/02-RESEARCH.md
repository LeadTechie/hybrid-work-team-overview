# Phase 2: Map & Filtering - Research

**Researched:** 2026-02-06
**Domain:** Interactive mapping with React Leaflet, marker visualization, filtering UI
**Confidence:** HIGH

## Summary

This phase focuses on displaying an interactive Germany map with office and employee markers, implementing color-coding by attribute (team/department/office), and providing filtering and search capabilities. The research confirms react-leaflet v5 with Leaflet 1.9.x as the standard stack for React mapping. For tile sources, OpenStreetMap raster tiles are the simplest solution, though OpenFreeMap with MapLibre is available for vector tiles if needed later.

Key technical decisions: Use Leaflet's built-in `L.divIcon` with inline SVG for dynamic marker colors (more flexible than image-based markers), implement react-leaflet-cluster for handling 45+ employee markers without performance issues, and use Zustand derived selectors for efficient filtering. The `useMap()` hook provides programmatic control for flyTo animations when highlighting searched employees.

The existing Phase 1 implementation provides Employee and Office types with coordinates, making this phase purely about visualization and interaction. No additional data transformation is needed.

**Primary recommendation:** Use react-leaflet v5 with OpenStreetMap tiles, L.divIcon with inline SVG for colored markers, react-leaflet-cluster for marker grouping, and Zustand selectors for performant filtering.

## Standard Stack

The established libraries/tools for this phase:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-leaflet | ^5.0 | React wrapper for Leaflet | Official React bindings, supports React 19, TypeScript native |
| leaflet | ^1.9.4 | Core mapping library | Industry standard, extensive plugin ecosystem |
| react-leaflet-cluster | ^2.1 | Marker clustering | React 19 compatible, wraps Leaflet.markercluster, performance optimized |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/leaflet | ^1.9 | TypeScript types | Required for TypeScript support |
| use-debounce | ^10.x | Debounced search input | Search input optimization (optional, can use custom hook) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| OpenStreetMap tiles | OpenFreeMap + MapLibre | OSM is simpler setup; OpenFreeMap needs MapLibre GL binding |
| L.divIcon (SVG) | leaflet-color-markers | divIcon is more flexible for dynamic colors; color-markers is image-based |
| react-leaflet-cluster | useSupercluster | cluster is more mature; supercluster offers more customization |
| Native select elements | react-select | Native is simpler; react-select has better UX for many options |

**Installation:**

```bash
# Core mapping
npm install react-leaflet leaflet

# Marker clustering
npm install react-leaflet-cluster

# TypeScript support
npm install -D @types/leaflet

# Optional: Debouncing for search
npm install use-debounce
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── map/
│   │   ├── MapView.tsx           # Main map container with controls
│   │   ├── OfficeMarker.tsx      # Office location marker (distinct icon)
│   │   ├── EmployeeMarker.tsx    # Employee marker with color-coding
│   │   ├── MarkerCluster.tsx     # Clustered employee markers
│   │   └── MapLegend.tsx         # Color legend for current view mode
│   └── filters/
│       ├── FilterPanel.tsx       # Container for all filter controls
│       ├── TeamFilter.tsx        # Team dropdown/multi-select
│       ├── DepartmentFilter.tsx  # Department dropdown
│       ├── OfficeFilter.tsx      # Office dropdown
│       └── EmployeeSearch.tsx    # Name search with debounce
├── hooks/
│   ├── useFilteredEmployees.ts   # Derived state selector
│   └── useMapControls.ts         # Map flyTo, fitBounds helpers
├── stores/
│   ├── filterStore.ts            # Filter state (team, dept, office, search)
│   └── (existing) employeeStore.ts
│   └── (existing) officeStore.ts
└── utils/
    └── markerColors.ts           # Color palette for team/dept/office coding
```

### Pattern 1: Color-Coded SVG Markers with L.divIcon

**What:** Use inline SVG with dynamic fill colors instead of image-based markers
**When to use:** Need to dynamically change marker colors based on attributes
**Example:**

```typescript
// Source: Leaflet divIcon docs + community patterns
import L from 'leaflet';

const TEAM_COLORS: Record<string, string> = {
  'Platform': '#2A81CB',
  'Frontend': '#FFD326',
  'Backend': '#CB2B3E',
  'Mobile': '#2AAD27',
  'DevOps': '#CB8427',
  'QA': '#CAC428',
  'Data': '#9C2BCB',
  'Security': '#7B7B7B',
};

function createColoredMarkerIcon(color: string, isHighlighted = false): L.DivIcon {
  const size = isHighlighted ? 35 : 25;
  const strokeWidth = isHighlighted ? 3 : 2;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          fill="${color}"
          stroke="#fff"
          stroke-width="${strokeWidth}"
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
        />
      </svg>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

// Usage in component
function EmployeeMarker({ employee, colorBy }: Props) {
  const color = getColorForEmployee(employee, colorBy);
  const icon = useMemo(() => createColoredMarkerIcon(color), [color]);

  return (
    <Marker position={[employee.coords.lat, employee.coords.lon]} icon={icon}>
      <Popup>{employee.name}</Popup>
    </Marker>
  );
}
```

### Pattern 2: Office Markers with Distinct Icon

**What:** Use a different icon style for offices vs employees
**When to use:** Offices need to stand out from employee markers
**Example:**

```typescript
// Source: Leaflet custom icons tutorial
const officeIcon = L.divIcon({
  className: 'office-marker',
  html: `
    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="15" fill="#1a365d" stroke="#fff" stroke-width="2" rx="2"/>
      <rect x="7" y="10" width="3" height="3" fill="#fff"/>
      <rect x="14" y="10" width="3" height="3" fill="#fff"/>
      <rect x="7" y="15" width="3" height="3" fill="#fff"/>
      <rect x="14" y="15" width="3" height="3" fill="#fff"/>
      <rect x="10" y="3" width="4" height="3" fill="#1a365d" stroke="#fff" stroke-width="1"/>
    </svg>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});
```

### Pattern 3: Zustand Filter Store with Derived Selectors

**What:** Separate filter state from data, use selectors for filtered results
**When to use:** Multiple filter criteria affecting the same data set
**Example:**

```typescript
// Source: Zustand docs + best practices
// stores/filterStore.ts
import { create } from 'zustand';

interface FilterState {
  teamFilter: string | null;
  departmentFilter: string | null;
  officeFilter: string | null;
  searchQuery: string;
  colorBy: 'team' | 'department' | 'assignedOffice';

  setTeamFilter: (team: string | null) => void;
  setDepartmentFilter: (dept: string | null) => void;
  setOfficeFilter: (office: string | null) => void;
  setSearchQuery: (query: string) => void;
  setColorBy: (colorBy: FilterState['colorBy']) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  teamFilter: null,
  departmentFilter: null,
  officeFilter: null,
  searchQuery: '',
  colorBy: 'team',

  setTeamFilter: (team) => set({ teamFilter: team }),
  setDepartmentFilter: (dept) => set({ departmentFilter: dept }),
  setOfficeFilter: (office) => set({ officeFilter: office }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setColorBy: (colorBy) => set({ colorBy }),
  clearFilters: () => set({
    teamFilter: null,
    departmentFilter: null,
    officeFilter: null,
    searchQuery: '',
  }),
}));

// hooks/useFilteredEmployees.ts
import { useMemo } from 'react';
import { useEmployeeStore } from '../stores/employeeStore';
import { useFilterStore } from '../stores/filterStore';

export function useFilteredEmployees() {
  const employees = useEmployeeStore((s) => s.employees);
  const { teamFilter, departmentFilter, officeFilter, searchQuery } = useFilterStore();

  return useMemo(() => {
    return employees.filter((emp) => {
      // Only include employees with valid coordinates
      if (!emp.coords) return false;

      if (teamFilter && emp.team !== teamFilter) return false;
      if (departmentFilter && emp.department !== departmentFilter) return false;
      if (officeFilter && emp.assignedOffice !== officeFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!emp.name.toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [employees, teamFilter, departmentFilter, officeFilter, searchQuery]);
}
```

### Pattern 4: FlyTo for Employee Search Highlight

**What:** Animate map to searched/selected employee and highlight their marker
**When to use:** User searches for employee by name, selects from results
**Example:**

```typescript
// Source: React Leaflet docs - View bounds example
import { useMap } from 'react-leaflet';

interface MapControllerProps {
  selectedEmployee: Employee | null;
}

function MapController({ selectedEmployee }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedEmployee?.coords) {
      map.flyTo(
        [selectedEmployee.coords.lat, selectedEmployee.coords.lon],
        14, // zoom level
        { duration: 1.5 } // animation duration in seconds
      );
    }
  }, [selectedEmployee, map]);

  return null;
}

// Usage in MapView
<MapContainer>
  <MapController selectedEmployee={selectedEmployee} />
  {/* other layers */}
</MapContainer>
```

### Pattern 5: Germany-Centered Map with Bounds

**What:** Initialize map centered on Germany with appropriate zoom
**When to use:** Initial map setup, reset view
**Example:**

```typescript
// Source: Leaflet docs + German coordinate data
const GERMANY_CENTER: [number, number] = [51.1657, 10.4515];
const GERMANY_BOUNDS: [[number, number], [number, number]] = [
  [47.27, 5.87],  // Southwest corner
  [55.05, 15.04], // Northeast corner
];
const INITIAL_ZOOM = 6;

function MapView() {
  return (
    <MapContainer
      center={GERMANY_CENTER}
      zoom={INITIAL_ZOOM}
      minZoom={5}
      maxZoom={18}
      bounds={GERMANY_BOUNDS}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* markers */}
    </MapContainer>
  );
}
```

### Anti-Patterns to Avoid

- **Creating new icon instances on every render:** Memoize icons with `useMemo` or create them outside components
- **Filtering inside render:** Use memoized selectors, not inline `.filter()` in JSX
- **Mounting many individual Marker components:** Use MarkerClusterGroup for 20+ markers
- **Inline SVG without viewBox:** Always include viewBox for proper scaling
- **Setting map bounds imperatively on mount:** Use MapContainer's `bounds` prop instead

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Marker clustering | Manual grouping logic | react-leaflet-cluster | Handles zoom levels, animation, performance |
| Colored markers | Multiple icon images | L.divIcon with SVG | Single component, any color, no image loading |
| Search debouncing | setTimeout in handler | use-debounce or custom hook | Proper cleanup, TypeScript types |
| Map state sync | Manual coordinate tracking | useMap() hook | React integration, proper lifecycle |
| Fit to all markers | Manual bounds calculation | L.latLngBounds + fitBounds | Handles edge cases, padding |

**Key insight:** Leaflet has 10+ years of edge case handling. The react-leaflet hooks (`useMap`, `useMapEvents`) provide the bridge to this functionality without reimplementing it.

## Common Pitfalls

### Pitfall 1: Missing Leaflet CSS

**What goes wrong:** Map tiles load but markers don't show, or map is misaligned
**Why it happens:** Leaflet requires its CSS for proper rendering; react-leaflet doesn't auto-import it
**How to avoid:** Import Leaflet CSS in your main entry point or component:

```typescript
// In main.tsx or App.tsx
import 'leaflet/dist/leaflet.css';

// For clustering, also import:
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
```

**Warning signs:** Markers appear as broken images, tiles offset from expected position

### Pitfall 2: Map Container Height Not Set

**What goes wrong:** Map doesn't render, shows as collapsed element
**Why it happens:** Leaflet requires explicit height on container; CSS `height: 100%` chains must be complete
**How to avoid:**

```css
/* Ensure parent chain has height */
html, body, #root { height: 100%; margin: 0; }

/* Or use explicit height */
.map-container { height: 600px; }
/* Or use viewport units */
.map-container { height: calc(100vh - 80px); }
```

**Warning signs:** Empty space where map should be, no console errors

### Pitfall 3: Icon Images Not Loading (Webpack/Vite Issue)

**What goes wrong:** Default Leaflet marker icons show as broken images
**Why it happens:** Webpack/Vite doesn't handle Leaflet's icon URL resolution correctly
**How to avoid:** Use L.divIcon with inline SVG (recommended) or manually configure icon paths:

```typescript
// The divIcon approach avoids this entirely
// If using default icons, configure manually:
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
```

**Warning signs:** Markers render but icon is broken image placeholder

### Pitfall 4: Too Many Re-renders on Filter Change

**What goes wrong:** Map becomes sluggish when filter dropdowns change
**Why it happens:** Entire marker set re-renders on each filter state change
**How to avoid:**
1. Use memoized selectors for filtered data
2. Memoize marker components with `React.memo`
3. Use MarkerClusterGroup to reduce DOM elements

```typescript
// Memoize the filtered list computation
const filteredEmployees = useMemo(() => {
  return employees.filter(/* criteria */);
}, [employees, filterCriteria]);

// Memoize marker components
const EmployeeMarker = React.memo(({ employee, colorBy }: Props) => {
  // ...
});
```

**Warning signs:** Lag when changing filters, visible marker flicker

### Pitfall 5: Cluster Icon Styles Not Loading

**What goes wrong:** Clusters show as squares without numbers/styling
**Why it happens:** react-leaflet-cluster CSS not imported
**How to avoid:**

```typescript
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
```

**Warning signs:** Clusters appear but look unstyled, no count visible

## Code Examples

### Complete Map Component with Filtering

```typescript
// Source: react-leaflet docs + patterns
// components/map/MapView.tsx

import { MapContainer, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

import { useOfficeStore } from '../../stores/officeStore';
import { useFilteredEmployees } from '../../hooks/useFilteredEmployees';
import { useFilterStore } from '../../stores/filterStore';
import { OfficeMarker } from './OfficeMarker';
import { EmployeeMarker } from './EmployeeMarker';
import { MapController } from './MapController';

const GERMANY_CENTER: [number, number] = [51.1657, 10.4515];

export function MapView() {
  const offices = useOfficeStore((s) => s.offices);
  const filteredEmployees = useFilteredEmployees();
  const colorBy = useFilterStore((s) => s.colorBy);
  const selectedEmployeeId = useFilterStore((s) => s.selectedEmployeeId);

  const selectedEmployee = filteredEmployees.find(
    (e) => e.id === selectedEmployeeId
  );

  return (
    <MapContainer
      center={GERMANY_CENTER}
      zoom={6}
      minZoom={5}
      maxZoom={18}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController selectedEmployee={selectedEmployee} />

      {/* Office markers - always visible, not clustered */}
      {offices.map((office) => (
        <OfficeMarker key={office.id} office={office} />
      ))}

      {/* Employee markers - clustered */}
      <MarkerClusterGroup chunkedLoading>
        {filteredEmployees.map((employee) => (
          <EmployeeMarker
            key={employee.id}
            employee={employee}
            colorBy={colorBy}
            isHighlighted={employee.id === selectedEmployeeId}
          />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
```

### Filter Panel with Dropdowns

```typescript
// Source: React patterns + Zustand
// components/filters/FilterPanel.tsx

import { useEmployeeStore } from '../../stores/employeeStore';
import { useOfficeStore } from '../../stores/officeStore';
import { useFilterStore } from '../../stores/filterStore';

export function FilterPanel() {
  const employees = useEmployeeStore((s) => s.employees);
  const offices = useOfficeStore((s) => s.offices);
  const {
    teamFilter, departmentFilter, officeFilter, colorBy,
    setTeamFilter, setDepartmentFilter, setOfficeFilter, setColorBy,
    clearFilters,
  } = useFilterStore();

  // Derive unique values from data
  const teams = [...new Set(employees.map((e) => e.team))].sort();
  const departments = [...new Set(
    employees.map((e) => e.department).filter(Boolean)
  )].sort();

  return (
    <div className="filter-panel">
      <div className="filter-group">
        <label htmlFor="color-by">Color by:</label>
        <select
          id="color-by"
          value={colorBy}
          onChange={(e) => setColorBy(e.target.value as typeof colorBy)}
        >
          <option value="team">Team</option>
          <option value="department">Department</option>
          <option value="assignedOffice">Assigned Office</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="team-filter">Team:</label>
        <select
          id="team-filter"
          value={teamFilter ?? ''}
          onChange={(e) => setTeamFilter(e.target.value || null)}
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="dept-filter">Department:</label>
        <select
          id="dept-filter"
          value={departmentFilter ?? ''}
          onChange={(e) => setDepartmentFilter(e.target.value || null)}
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="office-filter">Office:</label>
        <select
          id="office-filter"
          value={officeFilter ?? ''}
          onChange={(e) => setOfficeFilter(e.target.value || null)}
        >
          <option value="">All Offices</option>
          {offices.map((office) => (
            <option key={office.id} value={office.name}>{office.name}</option>
          ))}
        </select>
      </div>

      <button onClick={clearFilters}>Clear Filters</button>
    </div>
  );
}
```

### Employee Search with Debounce

```typescript
// Source: use-debounce docs + React patterns
// components/filters/EmployeeSearch.tsx

import { useState, useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useEmployeeStore } from '../../stores/employeeStore';
import { useFilterStore } from '../../stores/filterStore';

export function EmployeeSearch() {
  const [inputValue, setInputValue] = useState('');
  const employees = useEmployeeStore((s) => s.employees);
  const { setSearchQuery, setSelectedEmployeeId } = useFilterStore();

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value);
  }, 250);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  // Show suggestions as user types
  const suggestions = useMemo(() => {
    if (inputValue.length < 2) return [];
    const query = inputValue.toLowerCase();
    return employees
      .filter((e) => e.name.toLowerCase().includes(query))
      .slice(0, 5);
  }, [inputValue, employees]);

  const handleSelect = (employee: Employee) => {
    setInputValue(employee.name);
    setSearchQuery(employee.name);
    setSelectedEmployeeId(employee.id);
  };

  return (
    <div className="employee-search">
      <input
        type="text"
        placeholder="Search employee by name..."
        value={inputValue}
        onChange={handleInputChange}
        aria-label="Search employees"
      />
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((emp) => (
            <li key={emp.id}>
              <button onClick={() => handleSelect(emp)}>
                {emp.name} - {emp.team}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Image-based marker icons | L.divIcon with inline SVG | 2020+ | Dynamic colors, no image loading |
| google-map-react | react-leaflet | OSM-based, free | No API key needed, GDPR compliant |
| Manual marker grouping | MarkerClusterGroup | Leaflet.markercluster maturity | Handles 10k+ markers efficiently |
| Prop drilling for map state | useMap() hook | react-leaflet v3+ | Clean imperative map access |
| CSS-in-JS for markers | Inline SVG in divIcon | Performance | Fewer style recalculations |

**Deprecated/outdated:**
- **react-leaflet v3/v4 patterns:** v5 uses different hook patterns; check docs for migration
- **Separate MapLibre setup for vector tiles:** Can use OpenStreetMap raster tiles for simplicity

## Open Questions

1. **Cluster color aggregation**
   - What we know: Clusters show count, can be styled
   - What's unclear: How to show dominant team color in cluster?
   - Recommendation: Start with default cluster styling; add color aggregation as enhancement

2. **Mobile touch interactions**
   - What we know: Leaflet supports touch events
   - What's unclear: Filter panel UX on mobile
   - Recommendation: Implement collapsible filter panel, test on mobile

3. **Marker popup vs. sidebar detail**
   - What we know: Popups work well for small amounts of info
   - What's unclear: How much employee detail to show on click?
   - Recommendation: Use popup for name/team, consider sidebar for full profile later

## Sources

### Primary (HIGH confidence)

- [React Leaflet Documentation](https://react-leaflet.js.org/) - Setup, components, hooks, examples
- [Leaflet Documentation](https://leafletjs.com/reference.html) - Core map API, icons, events
- [react-leaflet-cluster GitHub](https://github.com/akursat/react-leaflet-cluster) - Clustering API and compatibility
- [Zustand Documentation](https://zustand.docs.pmnd.rs/) - Selectors, derived state patterns

### Secondary (MEDIUM confidence)

- [leaflet-color-markers GitHub](https://github.com/pointhi/leaflet-color-markers) - Color palette reference
- [OpenFreeMap Quick Start](https://openfreemap.org/quick_start/) - Alternative tile source
- [use-debounce npm](https://www.npmjs.com/package/use-debounce) - Debounce hook API

### Tertiary (LOW confidence)

- WebSearch results on marker animation patterns - community techniques
- Medium articles on React Leaflet patterns - validated against official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official docs verified, version compatibility confirmed
- Architecture patterns: HIGH - Based on react-leaflet examples and Zustand best practices
- Pitfalls: HIGH - Multiple sources confirm CSS/height issues as common problems
- Color-coding approach: MEDIUM - divIcon pattern verified, but custom SVG is implementation-specific

**Research date:** 2026-02-06
**Valid until:** 2026-03-06 (30 days - stable libraries)
