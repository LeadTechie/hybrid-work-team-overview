# Security & Architecture Review

**Reviewed:** 2026-02-07
**Reviewer:** Staff Engineer / Security Expert

---

## Architecture Rating: 7/10

### Strengths

- Clean separation: stores, services, components, types, hooks
- TypeScript throughout with proper typing
- Zustand for state management - simple and effective choice
- Zod validation for CSV input data
- Good use of React patterns (memoization in `useFilteredEmployees.ts`)
- CSV parsing handles German headers and multiple delimiters gracefully
- Leaflet map with clustering for performance

### Weaknesses

- `ImportPanel.tsx` is monolithic at 359 lines - should be decomposed
- No error boundaries for React error handling
- Filter store not persisted (lost on refresh unlike employee/office stores)
- No routing - simple tabs work now but limits scalability
- No testing infrastructure
- `index.html` still says "temp-vite-app"

---

## Security Rating: 3/10

### Critical Issues

#### 1. PII in localStorage - Unencrypted (CRITICAL)

**Location:** `src/stores/employeeStore.ts:48-50`

Employee home addresses, names, and coordinates are stored as plaintext in `localStorage`. This is highly sensitive PII:

- Any JavaScript on the same origin can access it
- Browser extensions can read it
- Shared/public computers expose all data
- No encryption whatsoever

**Recommendation:** Move to server-side storage with proper access control and encryption at rest. If client-side storage is required, use encrypted storage solutions.

#### 2. Address Data Sent to Third-Party API (HIGH)

**Location:** `src/services/geocodingService.ts:40`

Employee home addresses are transmitted to Geoapify without:

- Data Processing Agreement documentation
- GDPR compliance consideration
- User consent mechanism
- Any mention of privacy policy

**Recommendation:**
- Implement user consent before geocoding
- Document DPA with Geoapify
- Consider server-side geocoding to avoid exposing addresses to client
- Store only office proximity/distance rather than exact home coordinates

#### 3. No Authentication/Authorization (HIGH for production)

- Zero access control - anyone with the URL sees all employee addresses
- No audit trail of who viewed what
- No role-based access (HR vs. manager vs. employee)

**Recommendation:** Implement authentication (OAuth/SSO) and role-based access control before any production use.

#### 4. API Key in Client Bundle (MEDIUM)

**Location:** `src/services/geocodingService.ts:94-96`

The `VITE_GEOAPIFY_KEY` is baked into the client-side JavaScript. Anyone can extract it from browser DevTools.

**Recommendation:** Proxy geocoding requests through a backend service to keep the API key server-side.

#### 5. CSV Import Attack Surface (MEDIUM)

**Location:** `src/components/import/CsvUploader.tsx`

- No file size limits - large files could DoS the browser
- If data is ever exported to Excel, formula injection risk exists (no sanitization for `=`, `+`, `-`, `@` prefixes)

**Recommendation:**
- Add file size validation (e.g., max 5MB)
- Sanitize cell values that start with formula characters on export

### What's Done Right

- `.env` files properly gitignored
- Input validation with Zod prevents malformed data
- No backend SQL = no SQL injection risk
- OpenStreetMap tiles (no additional key exposure)

---

## Summary

| Category | Score | Notes |
|----------|-------|-------|
| **Architecture** | 7/10 | Solid React patterns, good structure, needs polish |
| **Security** | 3/10 | **Not production-ready with real employee data** |

---

## Conclusion

This is a well-structured prototype, but storing employee home addresses in localStorage and sending them to third-party APIs without consent/encryption makes this unsuitable for real employee data.

**For demo/fake data:** Acceptable as-is.

**For production with real employee data:** Requires:
1. Server-side storage with proper access control
2. Encryption at rest for PII
3. Authentication and authorization
4. Privacy-compliant geocoding strategy
5. User consent mechanisms
6. Audit logging
