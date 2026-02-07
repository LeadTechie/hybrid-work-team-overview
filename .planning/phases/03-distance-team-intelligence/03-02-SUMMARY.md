# Plan 03-02 Summary: FilterPanel Checkbox, Wire 3 Distance Consumers

## What was built
- **FilterPanel.tsx**: Added "Est. road distances" checkbox with circular ? info button that opens CircuityInfoModal
- **EmployeeMarker.tsx**: Popup distances conditionally formatted with road estimates; header changes to "Est. road distances:" when toggled
- **DistanceLines.tsx**: Tooltip distances conditionally formatted with road estimates
- **EmployeesTable.tsx**: Distance column labels change from `→` to `~>` when toggled; cell values show road estimates with ~ prefix

## Key decisions
- All 3 consumers read `useRoadDistance` from filterStore and pass it to `formatDistance(distance, useRoadDistance)`
- EmployeesTable `columns` useMemo depends on `[offices, useRoadDistance]` since labels change
- `displayEmployees` useMemo unchanged — raw haversine values stored, formatting happens at render time
