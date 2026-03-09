# Phase 6: Cleanup - sample data files, distance filter slider, dynamic team legend - Research

**Researched:** 2026-03-09
**Domain:** React UI components, dynamic color assignment, localStorage persistence
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Distance filter slider:** Dropdown to select reference: "Nearest office" (default) or a specific office name. Range slider with two handles (min and max distance). Auto-detect slider range from data (max = furthest employee from reference). Filter shows employees BETWEEN min and max distance. Placement: inside FilterPanel (left sidebar) below existing dropdowns.

- **Dynamic team legend:** Generate colors from an accessible palette (not hash-based). Persist color assignments to localStorage across sessions. When palette exhausted (many teams), generate shades of existing colors. Legend shows ALL teams/departments, not just those currently visible on map. Colors derive from actual employee data, not hardcoded `TEAM_COLORS`/`DEPARTMENT_COLORS`/`OFFICE_COLORS` maps.

- **Sample data files:** Keep current behavior (auto-load 100 employees on first visit). No changes to seed data content -- the fix is making legend dynamic.

### Claude's Discretion
- Exact slider component choice (native range input, library, or custom)
- Palette selection for accessible distinct colors
- Implementation of shade generation algorithm
- Whether to migrate existing hardcoded color assignments

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Summary

This phase addresses two distinct features that clean up the application: (1) a distance filter slider that allows users to filter employees by distance from a reference point (nearest office or specific office), and (2) dynamic color assignment for the team/department legend that derives colors from actual employee data rather than hardcoded maps.

The distance filter requires a dual-handle range slider. Native HTML5 range inputs do not support two handles, so implementation requires either a library component or a custom solution using two overlapping range inputs with CSS styling. Given the project's minimal dependency philosophy (no Material UI, no heavy UI framework), a lightweight custom approach using two native range inputs is recommended.

Dynamic color assignment requires an accessible color palette service that: (1) assigns distinct, colorblind-friendly colors to categories, (2) persists assignments to localStorage so colors remain stable across sessions, and (3) generates shades when the base palette is exhausted. The existing hardcoded maps should be replaced with a dynamic service while maintaining visual consistency for known categories.

**Primary recommendation:** Build a custom dual-range slider from two native inputs (no new dependencies), and create a ColorService class that manages dynamic palette assignment with localStorage persistence.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.0 | Already in use | Project foundation |
| Zustand | 5.0.11 | State management | Already used for filter/employee/office stores |
| localStorage | Native API | Color persistence | No dependency needed, direct browser API |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| CSS custom properties | Native | Slider styling | Cross-browser range input customization |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native dual inputs | multi-range-slider-react | Adds ~15KB dependency for simple use case |
| Native dual inputs | @radix-ui/react-slider | Heavier dependency, adds accessibility built-in |
| Custom palette | chroma.js | Adds ~30KB for palette generation; overkill for 10-20 categories |
| Custom palette | d3-scale-chromatic | Adds ~60KB; ColorBrewer palettes are good but dependency is large |

**Installation:**
No new packages required. All features can be implemented with existing stack.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── services/
│   └── colorService.ts       # Dynamic color assignment with persistence
├── components/
│   └── filters/
│       ├── FilterPanel.tsx   # Existing - add DistanceSlider
│       └── DistanceSlider.tsx # New - dual-handle range component
├── stores/
│   └── filterStore.ts        # Add distance filter state
└── utils/
    └── markerColors.ts       # Refactor to use colorService
```

### Pattern 1: Dynamic Color Service with Persistence
**What:** A service that assigns colors to categories dynamically, persists assignments to localStorage, and generates shades when palette is exhausted.
**When to use:** When color assignments must be stable across sessions but derived from data.
**Example:**
```typescript
// src/services/colorService.ts
type ColorCategory = 'team' | 'department' | 'assignedOffice';

interface ColorAssignments {
  [category: string]: {
    [value: string]: string;
  };
}

// Accessible 12-color palette (WCAG AA compliant, colorblind-friendly)
// Based on IBM Design Language / ColorBrewer categorical
const BASE_PALETTE = [
  '#2563EB', // blue-600
  '#DC2626', // red-600
  '#16A34A', // green-600
  '#F59E0B', // amber-500
  '#9333EA', // purple-600
  '#0891B2', // cyan-600
  '#EA580C', // orange-600
  '#EC4899', // pink-500
  '#65A30D', // lime-600
  '#475569', // slate-600
  '#7C3AED', // violet-600
  '#059669', // emerald-600
];

const STORAGE_KEY = 'hwto-color-assignments';

class ColorService {
  private assignments: ColorAssignments;

  constructor() {
    this.assignments = this.loadFromStorage();
  }

  getColor(category: ColorCategory, value: string): string {
    if (!this.assignments[category]) {
      this.assignments[category] = {};
    }

    if (!this.assignments[category][value]) {
      this.assignments[category][value] = this.assignNextColor(category);
      this.saveToStorage();
    }

    return this.assignments[category][value];
  }

  private assignNextColor(category: ColorCategory): string {
    const usedColors = Object.values(this.assignments[category] || {});
    const unusedColors = BASE_PALETTE.filter(c => !usedColors.includes(c));

    if (unusedColors.length > 0) {
      return unusedColors[0];
    }

    // Generate shade of existing color
    return this.generateShade(usedColors[usedColors.length % usedColors.length]);
  }

  private generateShade(baseColor: string): string {
    // Lighten or darken by 15%
    // Implementation: parse hex, adjust HSL lightness
  }

  private loadFromStorage(): ColorAssignments {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.assignments));
  }
}

export const colorService = new ColorService();
```

### Pattern 2: Dual-Handle Range Slider with Two Inputs
**What:** Two overlapping native range inputs styled to appear as a single dual-handle slider.
**When to use:** When you need min/max range selection without adding dependencies.
**Example:**
```typescript
// src/components/filters/DistanceSlider.tsx
interface DistanceSliderProps {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}

export function DistanceSlider({
  min, max, minValue, maxValue, onMinChange, onMaxChange
}: DistanceSliderProps) {
  // Prevent handles from crossing
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxValue - 1);
    onMinChange(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minValue + 1);
    onMaxChange(value);
  };

  return (
    <div className="distance-slider">
      <div className="slider-track">
        <input
          type="range"
          min={min}
          max={max}
          value={minValue}
          onChange={handleMinChange}
          className="slider-min"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxValue}
          onChange={handleMaxChange}
          className="slider-max"
        />
      </div>
      <div className="slider-values">
        <span>{minValue} km</span>
        <span>{maxValue} km</span>
      </div>
    </div>
  );
}
```

### Pattern 3: Reference-Based Distance Filtering
**What:** Calculate distance to a reference point (nearest office or specific office) for each employee.
**When to use:** For the distance filter where "nearest office" means distance to whichever office is closest to that employee.
**Example:**
```typescript
// In useFilteredEmployees hook or a dedicated hook
function getDistanceToReference(
  employee: Employee,
  offices: Office[],
  referenceOffice: string | 'nearest'
): number | null {
  if (!employee.coords || offices.length === 0) return null;

  const geocodedOffices = offices.filter(o => o.coords);

  if (referenceOffice === 'nearest') {
    // Find minimum distance to any office
    const distances = geocodedOffices.map(o =>
      calculateDistance(
        employee.coords!.lat, employee.coords!.lon,
        o.coords!.lat, o.coords!.lon
      )
    );
    return Math.min(...distances);
  }

  // Distance to specific office
  const office = geocodedOffices.find(o => o.name === referenceOffice);
  if (!office?.coords) return null;

  return calculateDistance(
    employee.coords.lat, employee.coords.lon,
    office.coords.lat, office.coords.lon
  );
}
```

### Anti-Patterns to Avoid
- **Hash-based color generation:** Produces inconsistent, often ugly colors. Use a curated palette instead.
- **Recalculating max distance on every render:** Memoize the max distance calculation.
- **Coupling slider state to URL:** Filter state is session-specific, localStorage is overkill.
- **Z-index conflicts:** Dual-range sliders need careful z-index handling to ensure both thumbs are grabbable.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color contrast checking | Manual luminance math | Use a pre-vetted accessible palette | Edge cases with colorblindness types |
| Hex color manipulation | Manual string parsing | Simple HSL conversion functions | Hex math is error-prone |

**Key insight:** For a 12-color palette, pre-selecting accessible colors is simpler and more reliable than runtime contrast checking. The shade generation for overflow is the only place where color math is needed.

## Common Pitfalls

### Pitfall 1: Range Handles Crossing
**What goes wrong:** User drags min handle past max handle, creating invalid state (min > max).
**Why it happens:** Native range inputs don't know about each other.
**How to avoid:** Clamp values in change handlers. Ensure minValue <= maxValue - 1.
**Warning signs:** Console errors when filtering with crossed values.

### Pitfall 2: Stale Color Assignments After Data Change
**What goes wrong:** User imports new data with new team names, but old color assignments persist.
**Why it happens:** localStorage assignments include old team names that no longer exist.
**How to avoid:** Color service should only return colors for values that currently exist in data. Old assignments can remain in storage (harmless) but won't affect current display.
**Warning signs:** Gray markers for teams that should have colors.

### Pitfall 3: Z-Index on Overlapping Range Inputs
**What goes wrong:** Only one thumb is clickable, the other is underneath and unresponsive.
**Why it happens:** Second input overlays first input including its thumb.
**How to avoid:** Use `pointer-events: none` on the input track, `pointer-events: auto` on `::-webkit-slider-thumb`. Bring active thumb to front with z-index.
**Warning signs:** Clicking thumb does nothing, or only one thumb works.

### Pitfall 4: Empty Distance Filter on First Load
**What goes wrong:** Slider shows 0-0 or NaN on first render before employees load.
**Why it happens:** Max distance calculated before employee data is available.
**How to avoid:** Default to disabled state or full range when no employees. Show "Loading..." or hide slider until data exists.
**Warning signs:** Slider thumbs at 0, or slider displays "NaN km".

### Pitfall 5: Legend Shows Only Visible Teams
**What goes wrong:** After filtering by team, legend only shows the filtered team's color.
**Why it happens:** Legend reads from filtered employees instead of all employees.
**How to avoid:** Legend must derive from ALL employees in store, not filtered employees.
**Warning signs:** Legend shrinks when filters are applied.

## Code Examples

Verified patterns from official sources and project conventions:

### Dual Range Slider CSS
```css
/* Source: Project convention + W3C range input styling */
.distance-slider {
  margin-top: 8px;
}

.slider-track {
  position: relative;
  height: 24px;
}

.slider-track input[type="range"] {
  position: absolute;
  width: 100%;
  height: 24px;
  -webkit-appearance: none;
  background: transparent;
  pointer-events: none; /* Prevent track clicks */
}

.slider-track input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  pointer-events: auto; /* Enable thumb interaction */
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.slider-track input[type="range"]::-webkit-slider-runnable-track {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
}

/* Firefox */
.slider-track input[type="range"]::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #fff;
}

.slider-values {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}
```

### HSL-Based Shade Generation
```typescript
// Source: Standard color manipulation pattern
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generateShade(baseColor: string, shadeIndex: number): string {
  const [h, s, l] = hexToHsl(baseColor);
  // Alternate between lighter (+15%) and darker (-15%) shades
  const adjustment = shadeIndex % 2 === 0 ? 15 : -15;
  const multiplier = Math.floor(shadeIndex / 2) + 1;
  const newL = Math.max(20, Math.min(80, l + adjustment * multiplier));
  return hslToHex(h, s, newL);
}
```

### Filter Store Extension
```typescript
// Source: Project pattern from filterStore.ts
// Add to FilterState interface:
interface FilterState {
  // ... existing fields
  distanceMin: number;
  distanceMax: number;
  distanceReference: string | 'nearest';

  setDistanceMin: (value: number) => void;
  setDistanceMax: (value: number) => void;
  setDistanceReference: (ref: string | 'nearest') => void;
}

// Add to store implementation:
{
  distanceMin: 0,
  distanceMax: Infinity, // No upper bound by default
  distanceReference: 'nearest',

  setDistanceMin: (value) => set({ distanceMin: value }),
  setDistanceMax: (value) => set({ distanceMax: value }),
  setDistanceReference: (ref) => set({ distanceReference: ref }),
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS-only dual range | JS + CSS hybrid | 2023+ | Native CSS dual-range is still not standardized |
| Hash-based colors | Curated accessible palettes | 2020+ | WCAG compliance, colorblind support |
| Hardcoded color maps | Dynamic assignment services | Common pattern | Data-driven applications |

**Deprecated/outdated:**
- `-webkit-gradient()`: Use standard `linear-gradient()` for track fill visualization
- Inline thumb styling: Use CSS custom properties for cross-browser thumb styling

## Open Questions

1. **Shade generation algorithm choice**
   - What we know: Need to generate distinguishable shades when palette exhausts
   - What's unclear: Whether alternating lighter/darker is sufficient, or if saturation adjustment is also needed
   - Recommendation: Start with lightness-only adjustment, add saturation if visual distinction is poor

2. **Migration of existing hardcoded colors**
   - What we know: Current TEAM_COLORS etc. define specific colors for known teams
   - What's unclear: Should these be preserved as "seed" assignments in the dynamic service?
   - Recommendation: Pre-populate colorService storage with existing mappings for continuity; new teams get next available color

## Sources

### Primary (HIGH confidence)
- Project codebase analysis: markerColors.ts, filterStore.ts, FilterPanel.tsx, MapLegend.tsx
- Project patterns: Zustand stores, CSS conventions in App.css
- MDN Web Docs: localStorage API, range input element

### Secondary (MEDIUM confidence)
- [Native dual range slider patterns](https://medium.com/@predragdavidovic10/native-dual-range-slider-html-css-javascript-91e778134816) - CSS/JS technique for overlapping inputs
- [D3 categorical color schemes](https://d3js.org/d3-scale-chromatic/categorical) - ColorBrewer-based accessible palettes (used as reference for palette selection)
- [IBM Design Language colors](https://medium.com/carbondesign/color-palettes-and-accessibility-features-for-data-visualization-7869f4874fca) - Accessibility-first palette design

### Tertiary (LOW confidence)
- General web search results on dual-range sliders and accessible palettes (cross-verified with primary sources)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, uses existing patterns
- Architecture: HIGH - clear patterns from codebase analysis
- Pitfalls: HIGH - well-documented issues with dual-range and color assignment

**Research date:** 2026-03-09
**Valid until:** 2026-04-08 (30 days - stable domain, no rapidly changing APIs)
