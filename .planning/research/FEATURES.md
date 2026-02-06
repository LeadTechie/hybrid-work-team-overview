# Feature Research: Hybrid Office Finder

**Domain:** Workforce Location Visualization / Office Planning Tool
**Researched:** 2026-02-06
**Confidence:** MEDIUM (based on WebSearch ecosystem survey; no single authoritative source for this niche)

## Executive Summary

For an internal tool serving ~60 developers + managers + HR team, the feature set should prioritize clarity and actionable insights over enterprise bells and whistles. The market is dominated by two extremes: (1) enterprise office management platforms (OfficeSpace, Robin, YAROOMS) focused on desk booking and real-time occupancy, and (2) geospatial analysis tools (Maptive, eSpatial, TravelTime) focused on location intelligence for site selection.

**Your use case sits in between** - you need geospatial visualization (employee home locations vs offices) combined with assignment/optimization insights (which office is best for each employee, which teams should co-locate). Most enterprise tools assume employees already have an office; most geospatial tools assume you're doing one-time site selection, not ongoing assignment optimization.

This means the core differentiator opportunity is **team co-location intelligence** - showing not just "employee X is closest to office Y" but "if team A all moved to office Z, their average commute would be X minutes."

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or unusable.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Map visualization** | Core purpose - must see employees on a map | MEDIUM | Use Leaflet/MapLibre (open source) or Google Maps. Must show employee home locations as markers. |
| **Office markers** | Users need to see office locations relative to employees | LOW | Simple pins with office names, addresses |
| **Employee-office distance display** | Primary use case is "which office is closest?" | LOW | Calculate straight-line or driving distance. Straight-line is MVP, driving distance is better. |
| **Filter by team/department** | 60+ people is too many to view at once | LOW | Basic dropdown or multi-select filter |
| **Search/find employee** | Quick lookup needed | LOW | Simple text search on name |
| **Data import capability** | Won't manually enter 60+ employees | MEDIUM | CSV/Excel import with address geocoding |
| **Basic privacy controls** | GDPR/BDSG compliance for employee addresses | MEDIUM | Germany requires explicit consent for location data. Must have access controls. |
| **Responsive web UI** | Browser-based tool as specified | MEDIUM | Works on desktop; mobile-friendly is nice-to-have |

### Differentiators (Competitive Advantage)

Features that set the product apart. These address the specific use cases (assignment, co-location, planning) that generic tools don't solve well.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Team co-location analysis** | "If team X all went to office Y, what's the total commute impact?" | MEDIUM | Unique value - no off-the-shelf tool does this well. Calculate aggregate team metrics. |
| **Office recommendation engine** | "Suggest the best office for each employee based on commute" | LOW-MEDIUM | Simple: nearest office. Better: weighted by team location, office capacity. |
| **Team transfer suggestions** | "Which employees could transfer to be closer to their team?" | MEDIUM-HIGH | Core differentiator. Identify employees whose team is mostly in a different office than their closest one. |
| **Commute time visualization** | Drive/transit time isochrones from each office | HIGH | TravelTime API or similar. Shows "30-min commute zone" on map. Premium feature. |
| **Office coverage analysis** | "What % of employees are within X km of each office?" | LOW | Useful for office planning decisions (open/close). Simple aggregation. |
| **Heatmap of employee density** | Visual clusters showing where employees live | MEDIUM | Helps identify where a new office might make sense. Cluster visualization. |
| **Scenario modeling** | "What if we closed office X? How would assignments change?" | MEDIUM-HIGH | Valuable for office planning. Remove office, recalculate optimal assignments. |
| **Export/reporting** | PDF/Excel reports for leadership presentations | LOW-MEDIUM | HR/leadership need to share findings outside the tool |

### Anti-Features (Deliberately NOT Building)

Features that seem appealing but create problems for this use case.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| **Real-time desk booking** | Enterprise tools have it | Overkill for 60 people; separate problem domain; maintenance burden | Link to existing booking system if one exists; keep this tool focused on visualization/planning |
| **Live location tracking** | "Know where employees are now" | GDPR nightmare; invasive; not the use case | Use home address for planning; office attendance is separate concern |
| **Calendar integration** | "See when employees are in office" | Scope creep; calendar systems vary; adds complexity | Keep tool focused on home-to-office geography, not scheduling |
| **Full HR system features** | "Store all employee data here" | Already have HR systems; data duplication; maintenance | Import only what's needed (name, team, address); link to HR system |
| **Complex access control matrix** | "Different permissions for HR vs managers vs..." | 60 people total; KISS principle | Two roles max: admin (full access) and viewer (read-only, possibly with address anonymization) |
| **AI-powered recommendations** | "Use AI to optimize everything" | Complexity without clear value; simple heuristics work fine for 60 people | Rule-based recommendations (nearest office, team majority location) are explainable and sufficient |
| **Mobile native apps** | "Need iOS and Android apps" | Web works on mobile; small user base doesn't justify native development | Responsive web design; PWA if needed later |
| **Multi-country support** | "We might expand" | YAGNI - Germany-focused initially | Design data model to not preclude it, but don't build for it now |

---

## Feature Dependencies

```
[Data Import]
    |
    v
[Geocoding Employee Addresses] -----> [Map Visualization]
    |                                       |
    v                                       v
[Distance Calculations]              [Filter by Team]
    |                                       |
    |-----> [Office Recommendation Engine]  |
    |                |                      |
    |                v                      |
    +-----> [Team Co-location Analysis] <---+
                     |
                     v
            [Team Transfer Suggestions]
                     |
                     v
            [Scenario Modeling] -----> [Export/Reporting]

[Heatmap] -----> [Office Coverage Analysis] -----> [Scenario Modeling]
```

### Dependency Notes

- **Geocoding requires Data Import:** Can't visualize locations without converting addresses to coordinates
- **Distance Calculations enable everything:** Core primitive for recommendations, co-location, scenarios
- **Team data required for co-location:** Filter by team and team analysis both need team assignment data
- **Recommendations before Suggestions:** Must know "best office for X" before suggesting "X could transfer"
- **Scenario Modeling is capstone:** Depends on all analytical features being in place

---

## MVP Definition

### Launch With (v1)

Minimum viable product - what's needed to answer "which office should I go to?" and "where does my team work?"

- [x] **Map with employee home locations and office markers** - core visualization
- [x] **Employee-office distance display** - straight-line distance is acceptable for MVP
- [x] **Filter by team** - essential for "where is my team?"
- [x] **Search employee** - quick lookup
- [x] **CSV import with geocoding** - data entry method
- [x] **Office recommendation (nearest)** - simple "your closest office is X"
- [x] **Basic access control** - admin + viewer roles minimum for GDPR

### Add After Validation (v1.x)

Features to add once core is working and users confirm value.

- [ ] **Team co-location analysis** - trigger: users ask "what if my whole team went to office X?"
- [ ] **Office coverage metrics** - trigger: HR asks "how many employees are near each office?"
- [ ] **Heatmap visualization** - trigger: planning discussions about new office locations
- [ ] **Driving/transit time** - trigger: straight-line distances prove insufficient for decisions
- [ ] **Export to PDF/Excel** - trigger: leadership requests reports for presentations

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Team transfer suggestions** - complex algorithm; needs user trust first
- [ ] **Scenario modeling (office closure)** - big decisions need validated tool
- [ ] **Commute isochrones** - API costs; nice visualization but not essential
- [ ] **Integration with HR system** - sync instead of import; adds maintenance

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Map visualization | HIGH | MEDIUM | P1 |
| Office markers | HIGH | LOW | P1 |
| Employee-office distance | HIGH | LOW | P1 |
| Filter by team | HIGH | LOW | P1 |
| Search employee | MEDIUM | LOW | P1 |
| Data import (CSV) | HIGH | MEDIUM | P1 |
| Basic access control | HIGH (compliance) | MEDIUM | P1 |
| Office recommendation (nearest) | HIGH | LOW | P1 |
| Team co-location analysis | HIGH | MEDIUM | P2 |
| Office coverage metrics | MEDIUM | LOW | P2 |
| Export/reporting | MEDIUM | LOW-MEDIUM | P2 |
| Heatmap | MEDIUM | MEDIUM | P2 |
| Driving/transit time | MEDIUM | HIGH (API costs) | P3 |
| Team transfer suggestions | HIGH | HIGH | P3 |
| Scenario modeling | MEDIUM | MEDIUM-HIGH | P3 |
| Commute isochrones | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch (MVP)
- P2: Should have, add when possible (post-validation)
- P3: Nice to have, future consideration (v2+)

---

## Competitor Feature Analysis

| Feature | Maptive/eSpatial (GIS Tools) | OfficeSpace/Robin (Office Mgmt) | Our Approach |
|---------|------------------------------|----------------------------------|--------------|
| Employee home location mapping | Yes (core feature) | Limited/None | Core feature |
| Office location visualization | Yes | Yes | Core feature |
| Desk booking | No | Yes (core feature) | Out of scope |
| Commute time analysis | Yes (advanced) | No | Future (P3) |
| Team filtering | Limited | Yes | Core feature |
| Office recommendation | Limited (manual) | No | Core feature (automated) |
| Team co-location analysis | No | No | **Differentiator** |
| Transfer suggestions | No | No | **Differentiator** |
| Scenario modeling | Partial (manual) | Partial (for space planning) | Future (P3) |
| Real-time occupancy | No | Yes | Out of scope |
| GDPR compliance | Varies | Usually yes | Required |
| Price | $$$-$$$$ | $$$$+ | Low (internal tool) |

**Our differentiation:** We sit in the gap between GIS tools (powerful but generic) and office management tools (focused on booking, not geographic analysis). Team co-location and transfer suggestions are unique value that neither category provides.

---

## Germany-Specific Considerations

Due to German data protection requirements (GDPR + BDSG), several features have compliance implications:

| Consideration | Requirement | Impact on Features |
|--------------|-------------|-------------------|
| **Employee consent** | Explicit consent required for location data processing | Consent flow needed before using employee addresses |
| **Data minimization** | Only collect what's necessary | Don't store more than name, team, work address |
| **Access restriction** | Only those with legitimate need should access | Role-based access control required |
| **Right to deletion** | Employees can request data removal | Delete functionality required |
| **Works council** | May need to consult Betriebsrat | Organizational, not technical, but consider transparency features |
| **No intra-group exemption** | Can't freely share between group companies | Keep data within authorized team; document data flows |

**Recommendation:** Implement "anonymized view" option where viewers see aggregated data (team clusters, office zones) without individual employee addresses. Only admins see specific locations.

---

## Sources

### Workforce Planning & Office Management
- [People Managing People - Office Space Management Software](https://peoplemanagingpeople.com/tools/best-office-space-management-software/)
- [YAROOMS - Hybrid Workplace Software](https://www.yarooms.com/reports/best-hybrid-workplace-software)
- [Maptician - Office Space Planning](https://www.maptician.com/office-space-planning-software/)
- [OfficeSpace - Hybrid Work Solutions](https://www.officespacesoftware.com/solutions/hybrid-work/)

### Employee Location Mapping
- [Maptive - Map Employee Locations](https://www.maptive.com/map-employee-locations/)
- [eSpatial - How to Map Employee Locations](https://www.espatial.com/blog/how-to-map-employee-locations)
- [TravelTime - Commute Analysis Tutorial](https://traveltime.com/blog/commute-time-analysis-tutorial)

### GDPR Compliance
- [WINHELLER - Employee Data Protection in Germany](https://www.winheller.com/en/business-law/labor-employment-law/employee-data-protection.html)
- [RemoFirst - Germany Employee Privacy GDPR BDSG](https://www.remofirst.com/post/germany-employee-privacy)
- [heydata - GDPR Compliance in HR Technology](https://heydata.eu/en/magazine/10-steps-for-gdpr-compliance-in-hr-technology/)

### Optimization Algorithms
- [GitHub - Office Workspace Optimization](https://github.com/bryce-bowles/office-workspace-optimization)
- [Solver - Office Assignment](https://www.solver.com/office-assignment)

### Geospatial Visualization
- [Kepler.gl - WebGL Geospatial Visualization](https://kepler.gl/)
- [Maply - Geographic Heat Maps](https://maply.com/geographic-heat-map)

---
*Feature research for: Hybrid Office Finder - Workforce Location Visualization*
*Researched: 2026-02-06*
