# Phase 6: Cleanup — sample data files, distance filter slider, dynamic team legend - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Add distance-based filtering with a slider control and make the team/department legend derive colors dynamically from actual data rather than hardcoded lists. This addresses the issue where imported data with different team names showed gray (default) colors.

</domain>

<decisions>
## Implementation Decisions

### Distance filter slider
- Dropdown to select reference: "Nearest office" (default) or a specific office name
- Range slider with two handles (min and max distance)
- Auto-detect slider range from data (max = furthest employee from reference)
- Filter shows employees BETWEEN min and max distance
- Placement: inside FilterPanel (left sidebar) below existing dropdowns

### Dynamic team legend
- Generate colors from an accessible palette (not hash-based)
- Persist color assignments to localStorage across sessions
- When palette exhausted (many teams), generate shades of existing colors
- Legend shows ALL teams/departments, not just those currently visible on map
- Colors derive from actual employee data, not hardcoded `TEAM_COLORS`/`DEPARTMENT_COLORS`/`OFFICE_COLORS` maps

### Sample data files
- Keep current behavior (auto-load 100 employees on first visit)
- No changes to seed data content — the fix is making legend dynamic

### Claude's Discretion
- Exact slider component choice (native range input, library, or custom)
- Palette selection for accessible distinct colors
- Implementation of shade generation algorithm
- Whether to migrate existing hardcoded color assignments

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `FilterPanel.tsx`: Add distance slider here alongside existing dropdowns
- `filterStore.ts`: Add distance filter state (minDistance, maxDistance, referenceOffice)
- `markerColors.ts`: Replace hardcoded maps with dynamic color assignment

### Established Patterns
- Zustand stores for filter state (filterStore pattern)
- Filter dropdowns derive options from employee/office data (teams, departments)
- Legend reads from colorBy mode and maps to hardcoded colors

### Integration Points
- `MapLegend.tsx`: Switch from hardcoded color maps to dynamic color service
- `getColorForEmployee()`: Needs to use dynamic color lookup
- EmployeeMarker, DistanceLines: Consume colors from same source

</code_context>

<specifics>
## Specific Ideas

- "Main issue was that team/department name appeared hardcoded based on test data. After reloading new data the team legend should show unique list based on data"
- Range slider allows filtering employees between X and Y km (e.g., show only 20-50km commuters)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-cleanup-sample-data-files-distance-filter-slider-dynamic-team-legend*
*Context gathered: 2026-03-09*
