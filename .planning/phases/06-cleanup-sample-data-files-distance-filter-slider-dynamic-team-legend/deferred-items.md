# Deferred Items - Phase 06

## Pre-existing Uncommitted Changes

The following files had uncommitted changes before 06-01 plan execution. They contain TypeScript errors unrelated to the dynamic legend work:

### `src/hooks/useFilteredEmployees.ts`
- Unused imports: `useOfficeStore`, `calculateDistance`
- Error: TS6133 - declared but value never read

### `src/components/filters/FilterPanel.tsx`
- References `DistanceSlider` component (likely part of distance slider feature)
- Component may not exist yet

## Recommendation

These appear to be work-in-progress for the "distance filter slider" feature mentioned in Phase 06 scope. They should be addressed in the distance slider plan (likely 06-02 or 06-03).

---
*Logged during 06-01-PLAN.md execution*
# Deferred Items - Phase 06

## Pre-existing Lint Errors (Out of Scope)

Discovered during 06-02-PLAN.md execution:

- `src/components/map/EmployeeMarker.tsx`: React Hook conditionally called errors (lines 27, 28, 33, 39)
- `src/components/map/OfficeMarker.tsx`: React Hook conditionally called error (line 17)

These are pre-existing issues from commits before this plan and are not caused by the current changes.
