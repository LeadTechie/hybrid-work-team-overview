# Architecture Research

**Domain:** Browser-based map visualization (employee location mapping)
**Researched:** 2026-02-06
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
+-----------------------------------------------------------------------+
|                         PRESENTATION LAYER                             |
+-----------------------------------------------------------------------+
|  +---------------+  +---------------+  +---------------+              |
|  | Map Container |  | Filter Panel  |  | Data Table    |              |
|  | (React-Leaflet|  | (Controls)    |  | (Employee List|              |
|  +-------+-------+  +-------+-------+  +-------+-------+              |
|          |                  |                  |                       |
+----------+------------------+------------------+-----------------------+
|                         STATE MANAGEMENT                               |
+-----------------------------------------------------------------------+
|  +---------------+  +---------------+  +---------------+              |
|  | Employee Store|  | Filter Store  |  | Map View Store|              |
|  | (locations,   |  | (active       |  | (center, zoom,|              |
|  |  attributes)  |  |  filters)     |  |  bounds)      |              |
|  +-------+-------+  +-------+-------+  +-------+-------+              |
|          |                  |                  |                       |
+----------+------------------+------------------+-----------------------+
|                         SERVICE LAYER                                  |
+-----------------------------------------------------------------------+
|  +---------------+  +---------------+  +---------------+              |
|  | CSV Parser    |  | Geocoding     |  | Distance      |              |
|  | (PapaParse)   |  | Service       |  | Calculator    |              |
|  +---------------+  +---------------+  +---------------+              |
|                                                                        |
|  +---------------+  +---------------+                                  |
|  | Data Validator|  | Export Service|                                  |
|  +---------------+  +---------------+                                  |
+-----------------------------------------------------------------------+
|                         DATA LAYER                                     |
+-----------------------------------------------------------------------+
|  +---------------------------+  +---------------------------+         |
|  | In-Memory Store           |  | Browser Storage           |         |
|  | (working dataset)         |  | (localStorage/IndexedDB)  |         |
|  +---------------------------+  +---------------------------+         |
+-----------------------------------------------------------------------+
|                         EXTERNAL SERVICES                              |
+-----------------------------------------------------------------------+
|  +---------------+  +---------------+                                  |
|  | Tile Provider |  | Geocoding API |                                  |
|  | (OSM/MapTiler)|  | (Nominatim)   |                                  |
|  +---------------+  +---------------+                                  |
+-----------------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Map Container | Renders interactive map, markers, overlays | React-Leaflet MapContainer + TileLayer |
| Filter Panel | UI controls for filtering employees | React components with form inputs |
| Data Table | Tabular view of employee data | React table component (TanStack Table) |
| Employee Store | Single source of truth for employee data | React Context or Zustand store |
| Filter Store | Active filter state and filter logic | React Context or Zustand store |
| Map View Store | Map camera state (center, zoom, bounds) | React state lifted to parent |
| CSV Parser | Import/export CSV files | PapaParse library |
| Geocoding Service | Convert addresses to coordinates | Nominatim API wrapper |
| Distance Calculator | Haversine formula calculations | Pure function / utility module |
| Data Validator | Validate imported data structure | Schema validation (Zod) |

## Recommended Project Structure

```
src/
+-- components/           # React UI components
|   +-- map/              # Map-related components
|   |   +-- MapContainer.tsx
|   |   +-- EmployeeMarker.tsx
|   |   +-- OfficeMarker.tsx
|   |   +-- MarkerCluster.tsx
|   |   +-- DistanceCircle.tsx
|   +-- filters/          # Filter controls
|   |   +-- FilterPanel.tsx
|   |   +-- DepartmentFilter.tsx
|   |   +-- DistanceFilter.tsx
|   +-- data/             # Data display components
|   |   +-- EmployeeTable.tsx
|   |   +-- ImportExport.tsx
|   |   +-- DataSummary.tsx
|   +-- layout/           # Layout components
|       +-- AppLayout.tsx
|       +-- Sidebar.tsx
+-- stores/               # State management
|   +-- employeeStore.ts
|   +-- filterStore.ts
|   +-- officeStore.ts
+-- services/             # Business logic
|   +-- csvService.ts     # CSV import/export
|   +-- geocodingService.ts
|   +-- distanceService.ts
|   +-- validationService.ts
+-- types/                # TypeScript definitions
|   +-- employee.ts
|   +-- office.ts
|   +-- filters.ts
+-- utils/                # Pure utility functions
|   +-- haversine.ts
|   +-- formatters.ts
+-- hooks/                # Custom React hooks
|   +-- useFilteredEmployees.ts
|   +-- useDistanceCalculation.ts
+-- constants/            # App constants
    +-- offices.ts        # Office locations in Germany
    +-- mapConfig.ts      # Default map settings
```

### Structure Rationale

- **components/map/:** Isolates Leaflet-specific code; these components use React-Leaflet and must handle Leaflet's imperative nature
- **components/filters/:** Separates filter UI from filter logic; filters are pure React components
- **stores/:** Centralized state makes data flow predictable; separated by domain for clarity
- **services/:** Business logic decoupled from UI; services are testable without rendering components
- **types/:** Explicit TypeScript types prevent runtime errors and document data shapes
- **utils/:** Pure functions (like Haversine) have no dependencies and are highly testable

## Architectural Patterns

### Pattern 1: Unidirectional Data Flow

**What:** All data changes flow through stores; components subscribe to stores and dispatch actions
**When to use:** Always - this is fundamental to predictable state management
**Trade-offs:** More boilerplate than direct mutation, but prevents debugging nightmares

**Example:**
```typescript
// stores/employeeStore.ts
import { create } from 'zustand';
import { Employee } from '../types/employee';

interface EmployeeState {
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employees: [],
  setEmployees: (employees) => set({ employees }),
  addEmployee: (employee) => set((state) => ({
    employees: [...state.employees, employee]
  })),
  updateEmployee: (id, updates) => set((state) => ({
    employees: state.employees.map(e =>
      e.id === id ? { ...e, ...updates } : e
    )
  })),
}));
```

### Pattern 2: Derived State via Selectors

**What:** Filter results computed from base data + filter state, not stored separately
**When to use:** When displaying filtered/transformed views of data
**Trade-offs:** Recomputes on every render (use useMemo for expensive computations)

**Example:**
```typescript
// hooks/useFilteredEmployees.ts
import { useMemo } from 'react';
import { useEmployeeStore } from '../stores/employeeStore';
import { useFilterStore } from '../stores/filterStore';

export function useFilteredEmployees() {
  const employees = useEmployeeStore(state => state.employees);
  const filters = useFilterStore(state => state.filters);

  return useMemo(() => {
    return employees.filter(employee => {
      if (filters.department && employee.department !== filters.department) {
        return false;
      }
      if (filters.maxDistance && employee.distanceToOffice > filters.maxDistance) {
        return false;
      }
      return true;
    });
  }, [employees, filters]);
}
```

### Pattern 3: Service Layer Abstraction

**What:** External APIs and complex logic wrapped in service modules
**When to use:** For geocoding, CSV parsing, and any external dependencies
**Trade-offs:** Extra layer of indirection, but enables testing and future API changes

**Example:**
```typescript
// services/geocodingService.ts
import { GeocodingResult } from '../types/geocoding';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export async function geocodeAddress(
  address: string,
  options = { countryCode: 'de' }
): Promise<GeocodingResult | null> {
  const params = new URLSearchParams({
    q: address,
    format: 'json',
    countrycodes: options.countryCode,
    limit: '1',
  });

  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: {
      'User-Agent': 'HybridOfficeFinder/1.0',
    },
  });

  if (!response.ok) return null;

  const results = await response.json();
  if (results.length === 0) return null;

  return {
    lat: parseFloat(results[0].lat),
    lon: parseFloat(results[0].lon),
    displayName: results[0].display_name,
  };
}
```

### Pattern 4: Component Composition for Maps

**What:** Map features as composable child components within MapContainer
**When to use:** React-Leaflet pattern - required for proper lifecycle management
**Trade-offs:** Must understand React-Leaflet's context-based architecture

**Example:**
```typescript
// components/map/MapWithEmployees.tsx
import { MapContainer, TileLayer } from 'react-leaflet';
import { EmployeeMarkers } from './EmployeeMarkers';
import { OfficeMarkers } from './OfficeMarkers';
import { DistanceCircles } from './DistanceCircles';

export function MapWithEmployees() {
  return (
    <MapContainer
      center={[51.1657, 10.4515]} // Germany center
      zoom={6}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <OfficeMarkers />
      <EmployeeMarkers />
      <DistanceCircles />
    </MapContainer>
  );
}
```

## Data Flow

### Import Flow

```
[User selects CSV file]
       |
       v
[FileReader API] --> [Raw text]
       |
       v
[PapaParse] --> [Parsed rows array]
       |
       v
[Validation Service] --> [Validated Employee objects]
       |                         |
       |                   [Validation errors]
       v                         |
[Geocoding Service]              v
(if addresses need geocoding) [Error display to user]
       |
       v
[Employee Store] --> [UI updates automatically]
```

### Filter Flow

```
[User changes filter]
       |
       v
[Filter Store updated]
       |
       v
[useFilteredEmployees hook recomputes]
       |
       v
[Map re-renders with filtered markers]
[Table re-renders with filtered rows]
[Summary stats recalculate]
```

### Distance Calculation Flow

```
[Office selected] + [Employee locations loaded]
                |
                v
        [Distance Service]
        (Haversine calculation)
                |
                v
[Distances added to employee objects in store]
                |
                v
[Distance filter can now operate]
[Distance column available in table]
[Distance circles can render on map]
```

### Key Data Flows

1. **CSV Import:** File -> Parse -> Validate -> Geocode (if needed) -> Store -> UI
2. **Filtering:** Filter change -> Store update -> Derived state recalculation -> UI update
3. **Distance:** Office + Employee coords -> Haversine -> Stored distance -> Available for filtering/display

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-500 employees | Simple in-memory state, no clustering needed, direct markers |
| 500-5,000 employees | Add marker clustering (Leaflet.markercluster), consider chunked loading |
| 5,000-50,000 employees | Use Supercluster for better performance, virtual scrolling in tables |
| 50,000+ employees | Consider server-side clustering, pagination for tables, background processing |

### Scaling Priorities

1. **First bottleneck (markers):** At ~1,000 markers, rendering slows. Solution: Implement Leaflet.markercluster with `chunkedLoading: true`
2. **Second bottleneck (table rendering):** At ~5,000 rows, table becomes sluggish. Solution: Virtual scrolling with TanStack Virtual
3. **Third bottleneck (initial load):** Large CSVs slow parse time. Solution: PapaParse with `worker: true` for background parsing

## Anti-Patterns

### Anti-Pattern 1: Direct DOM Manipulation in React

**What people do:** Use `document.getElementById()` or direct Leaflet API calls bypassing React
**Why it's wrong:** Creates state inconsistencies; React doesn't know about changes, leading to stale UI
**Do this instead:** Use React-Leaflet components and refs; let React manage the DOM

### Anti-Pattern 2: Storing Derived State

**What people do:** Store both `employees` and `filteredEmployees` in state
**Why it's wrong:** State can become inconsistent (filtered list doesn't match filters applied to employees)
**Do this instead:** Compute filtered list on render using `useMemo`; single source of truth

### Anti-Pattern 3: Geocoding on Every Render

**What people do:** Call geocoding API inside render function or useEffect without dependencies
**Why it's wrong:** Rate limits exceeded, performance destroyed, unnecessary API calls
**Do this instead:** Geocode once on import, cache results in employee data, persist coordinates

### Anti-Pattern 4: Blocking Main Thread with Large Datasets

**What people do:** Parse large CSV synchronously, add thousands of markers without chunking
**Why it's wrong:** Browser freezes, user thinks app crashed
**Do this instead:** Use Web Workers (PapaParse `worker: true`), chunked marker loading, progress indicators

### Anti-Pattern 5: Tight Coupling to Specific Tile Provider

**What people do:** Hardcode tile URLs throughout application
**Why it's wrong:** If provider changes terms or goes down, multiple files need updating
**Do this instead:** Abstract tile configuration into a single config file; allow runtime switching

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| OpenStreetMap Tiles | URL template in TileLayer | Free, no API key, respect usage policy |
| Nominatim Geocoding | REST API with rate limiting | Max 1 req/sec, cache results, use countrycodes=de |
| Alternative tile providers | MapTiler, Mapbox, etc. | May require API key, better performance/styles |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Map <-> Stores | React Context / Zustand subscription | Map subscribes to employee/filter stores |
| Services <-> Stores | Async functions, store actions | Services return data, stores update state |
| Components <-> Services | Direct import, async calls | Components call services for operations |
| CSV <-> Validation | Function composition | Parse result piped through validation |

## Build Order Implications

Based on component dependencies, the recommended build order is:

1. **Phase 1: Core Data Structure**
   - Types (Employee, Office, Filter)
   - Utility functions (Haversine distance)
   - Basic store structure (empty but typed)

2. **Phase 2: Data Layer**
   - CSV parsing service
   - Validation service
   - Employee store with CRUD operations

3. **Phase 3: Map Foundation**
   - Basic MapContainer with Germany-centered view
   - Office markers (static, known locations)
   - Employee markers (basic, no clustering)

4. **Phase 4: Filtering System**
   - Filter store
   - Filter UI components
   - useFilteredEmployees hook
   - Connect filters to map display

5. **Phase 5: Distance Features**
   - Distance calculation service
   - Distance filter integration
   - Distance visualization (circles, labels)

6. **Phase 6: Polish & Performance**
   - Marker clustering
   - Data table with virtual scrolling
   - Export functionality
   - Error handling and edge cases

**Rationale:** Each phase builds on the previous. You cannot filter employees without employees loaded. You cannot calculate distances without coordinates. Clustering is optimization, not core functionality.

## Sources

- [React Leaflet Core Architecture](https://react-leaflet.js.org/docs/core-architecture/) - Component structure and data flow patterns (HIGH confidence)
- [Geoapify Map Libraries Comparison](https://www.geoapify.com/map-libraries-comparison-leaflet-vs-maplibre-gl-vs-openlayers-trends-and-statistics/) - Library comparison and performance data (MEDIUM confidence)
- [PapaParse Documentation](https://www.papaparse.com/) - CSV parsing patterns (HIGH confidence)
- [Leaflet MarkerCluster GitHub](https://github.com/Leaflet/Leaflet.markercluster) - Clustering implementation (HIGH confidence)
- [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/) - Geocoding rate limits (HIGH confidence)
- [MDN IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) - Browser storage patterns (HIGH confidence)
- [Movable Type Haversine Scripts](https://www.movable-type.co.uk/scripts/latlong.html) - Distance calculation reference (HIGH confidence)
- [vis.gl State Management](https://visgl.github.io/react-map-gl/docs/get-started/state-management) - Map state patterns (MEDIUM confidence)

---
*Architecture research for: Browser-based map visualization (Hybrid Office Finder)*
*Researched: 2026-02-06*
