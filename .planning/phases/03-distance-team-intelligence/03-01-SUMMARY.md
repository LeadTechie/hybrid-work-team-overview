# Plan 03-01 Summary: Circuity Functions, Store Toggle, Info Modal

## What was built
- **distance.ts**: Added `getCircuityFactor()`, `estimateRoadDistance()` exports and updated `formatDistance()` with optional `useRoadEstimate` parameter for road-estimate formatting (~prefix, appropriate rounding)
- **filterStore.ts**: Added `useRoadDistance` boolean toggle (default false) with setter, intentionally excluded from `clearFilters` reset
- **CircuityInfoModal.tsx**: Accessible info modal explaining circuity factor methodology, accuracy, and example calculations

## Key decisions
- Circuity factors: 1.4 (short <20km), 1.35 (medium 20-100km), 1.25 (long >100km) — based on European research
- Road-estimate rounding: nearest integer (<10km), nearest 5 (10-100km), nearest 10 (>100km)
- `useRoadDistance` is a visual preference, not a filter — persists across clearFilters

## Commits
- `81aac50` feat(03-01): add circuity factor functions and road-estimate formatting to distance.ts
- `2209981` feat(03-01): add useRoadDistance toggle and CircuityInfoModal component
