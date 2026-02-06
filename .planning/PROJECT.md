# Hybrid Office Finder

## What This Is

A browser-based visualization tool that maps employee home locations against office locations in Germany, helping HR and team leads make informed decisions about office assignments and team composition. Employees and offices are imported via CSV, distances are calculated, and the data can be exported to preserve state without server-side storage.

## Core Value

Employees can see which office is closest to them, and leadership can identify team composition changes that would reduce overall commute burden.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Import offices via CSV (name, city, street, postcode)
- [ ] Import employees via CSV (name, department, team, role, address, assigned office)
- [ ] Display Germany map with offices as distinct markers
- [ ] Display employees as markers on map
- [ ] Color/filter employees by department, team, role, or assigned office
- [ ] Calculate as-crow-flies distance from employee to each office
- [ ] Identify nearest office for each employee
- [ ] Export current data state (including calculated distances)
- [ ] Import previously exported data to restore state
- [ ] Generate seed data: 5 offices (Frankfurt, Berlin, Munich, Hamburg, Düsseldorf) + 30-50 employees

### Out of Scope

- [ ] Backend/database storage — data protection, browser-only for now
- [ ] Real-time travel APIs in v1 — focus on crow-flies first
- [ ] Countries beyond Germany — Germany-only for foreseeable future
- [ ] Mobile app — web browser is sufficient
- [ ] User authentication — no users, just data visualization

## Context

**Use case priority:**
1. Employee assignment — help employees find their best office match
2. Team co-location — suggest team transfers so developers are closer to colleagues
3. Office planning — inform decisions about where to open/close offices

**Target users:**
- ~60 developers + engineering managers
- HR/People team for office planning
- Team leads for understanding team distribution

**Team swap optimization (future):**
The tool should eventually suggest: "Developer A (Team 1, lives near Berlin) and Developer B (Team 2, lives near Munich) could swap teams to reduce total travel." This is post-v1.

**Privacy approach:**
- All processing in browser, no data persistence
- When travel APIs are added later, use postcode-level queries only (no street numbers)
- Export/import allows users to preserve state locally

## Constraints

- **No backend**: All logic runs in browser, no server-side storage
- **Germany focus**: No need to architect for multi-country
- **Privacy**: Employee addresses must not leave the browser (except later postcode-level API calls)
- **Map style**: Clean, minimal aesthetic — focus on the data, not terrain

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Browser-only, no backend | Data protection requirements | — Pending |
| Germany-only scope | Simpler implementation, known use case | — Pending |
| As-crow-flies first | Fast local calculation, APIs can come later | — Pending |
| Postcode-level for future APIs | Balance accuracy (~few km) with privacy | — Pending |

---
*Last updated: 2026-02-06 after initialization*
