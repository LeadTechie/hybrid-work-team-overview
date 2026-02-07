# Phase 1: Foundation & Data Pipeline - Research

**Researched:** 2026-02-06
**Domain:** CSV import, geocoding, seed data generation for German employee/office data
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**CSV Format & Validation:**
- Lenient validation - Import valid rows, skip/flag invalid ones (don't reject entire import)
- Core required fields: name, address, team (must be present)
- Optional fields: department, role, assigned office
- Flexible address format - Accept single 'address' column OR split columns (street, postcode, city); auto-detect which format
- Auto-detect separator - Handle both comma and semicolon delimiters automatically

**Import UI Experience:**
- Both paste and file upload - User can paste CSV text OR upload .csv file
- Preview before import - Show parsed data in table, user confirms before finalizing
- Merge behavior - New imports add to existing data (don't replace unless explicitly cleared)

**Geocoding Behavior:**
- Automatic on import - Geocode all addresses immediately after CSV is parsed
- Progress bar - Visual progress showing X of Y addresses geocoded
- Flag and continue - If address can't be geocoded, mark record with warning, continue with others, show summary at end
- No manual coordinate entry in v1 - Failed geocodes simply won't appear on map; manual entry is future feature

**Seed Data Characteristics:**
- Clustered near offices - Most employees within reasonable commute of one of the 5 offices
- 6-10 teams - Realistic team count for ~50 employees
- Engineering + Product departments - Focus on devs plus product managers
- Realistic German names - Names like 'Anna Mueller', 'Thomas Schmidt' (not 'Test User 1')

**Specific Ideas:**
- Office addresses: Frankfurt, Berlin, Munich, Hamburg, Duesseldorf (major German cities with tech presence)
- Employee CSV should include columns for the team swap feature later - ensure role field exists even if optional

### Claude's Discretion

- Import area presentation (page vs panel vs modal)
- Exact progress bar styling
- How to handle encoding detection for German characters
- Team name generation for seed data

### Deferred Ideas (OUT OF SCOPE)

- Manual coordinate entry for failed geocodes - future feature
- Real-time geocoding API integration with rate limiting - research suggests caching geocoded results

</user_constraints>

## Summary

This phase focuses on CSV data import (offices and employees), geocoding addresses to coordinates, and generating realistic seed data for testing. The research confirms PapaParse as the standard CSV parser with excellent delimiter auto-detection and encoding handling. For GDPR-compliant geocoding, Geoapify emerges as the recommended choice for batch operations, with a German postcode dataset as a fallback/privacy-first option. Faker.js with German locale provides realistic seed data generation.

The primary technical challenges are: (1) handling German character encoding (umlauts) from Excel-exported CSVs, (2) rate-limiting geocoding requests to avoid API throttling, and (3) providing a smooth preview-before-import UX. All of these have well-established solutions in the recommended stack.

**Primary recommendation:** Use PapaParse for CSV parsing with explicit delimiter detection, Geoapify for batch geocoding with the `@geoapify/request-rate-limiter` for queue management, and Faker.js with `fakerDE` locale for seed data.

## Standard Stack

The established libraries/tools for this phase:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| PapaParse | ^5.5 | CSV parsing | Fastest browser CSV parser. Handles delimiter detection, streaming, encoding. 5.3M weekly npm downloads. |
| @faker-js/faker | ^9.x | Seed data generation | German locale (fakerDE) provides realistic names, addresses. Deterministic seeding for reproducible data. |
| Zod | ^3.24 | Schema validation | TypeScript-first validation. zod-csv wrapper available for CSV-specific validation. |
| Zustand | ^5.0 | State management | Lightweight, TypeScript-native. persist middleware for localStorage. Used in project stack research. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @geoapify/request-rate-limiter | ^1.x | Geocoding queue management | Batch geocoding with progress callbacks, automatic rate limiting |
| react-dropzone | ^14.x | File upload UI | Drag-drop file upload, accessibility built-in |
| jschardet | ^3.x | Encoding detection | Detect Windows-1252 vs UTF-8 encoding for German CSVs |
| zod-csv | ^1.x | CSV-specific validation | Validate CSV rows against Zod schema, collect errors per row |

### Geocoding Options

| Provider | Cost | Rate Limit | GDPR | Recommendation |
|----------|------|------------|------|----------------|
| Geoapify | Free tier: 3000/day | 5 req/sec (free) | Yes (German company) | **PRIMARY** - Best batch API, rate-limiter library |
| OpenCage | Free tier: 2500/day | 1 req/sec (free) | Yes (German company) | ALTERNATIVE - `no_record=1` parameter for zero logging |
| Nominatim (public) | Free | 1 req/sec | Yes (no tracking) | FALLBACK - Strict rate limits, no batch API |
| German PLZ dataset | One-time download | N/A | N/A | OFFLINE - Postcode-to-coordinate mapping, ~8000 entries |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| PapaParse | d3-dsv | d3-dsv is smaller but PapaParse has better encoding/worker support |
| Geoapify | OpenCage | OpenCage has stricter rate limits but explicit no-logging option |
| Zustand persist | localStorage directly | Zustand provides better DX with automatic serialization |
| react-dropzone | Native HTML5 drag-drop | react-dropzone has better accessibility and edge case handling |

**Installation:**

```bash
# Core parsing and validation
npm install papaparse zod

# Seed data
npm install @faker-js/faker

# Geocoding (if using API)
npm install @geoapify/request-rate-limiter

# File upload UI
npm install react-dropzone

# Encoding detection (optional)
npm install jschardet

# Types (dev)
npm install -D @types/papaparse
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   └── import/
│       ├── ImportPanel.tsx       # Main import UI container
│       ├── CsvUploader.tsx       # File upload + paste area
│       ├── PreviewTable.tsx      # Data preview before confirm
│       └── ImportProgress.tsx    # Geocoding progress bar
├── services/
│   ├── csvService.ts             # PapaParse wrapper with validation
│   ├── geocodingService.ts       # Geoapify/fallback geocoding
│   └── validationService.ts      # Zod schemas for office/employee
├── stores/
│   ├── officeStore.ts            # Office data with persist
│   └── employeeStore.ts          # Employee data with persist
├── types/
│   ├── office.ts                 # Office type definition
│   └── employee.ts               # Employee type definition
├── data/
│   ├── seedOffices.ts            # 5 German office locations
│   ├── seedEmployees.ts          # Generated employee data
│   └── germanPostcodes.json      # PLZ-to-coordinate mapping (optional)
└── utils/
    └── encodingDetection.ts      # German character encoding helper
```

### Pattern 1: Lenient CSV Validation with Error Collection

**What:** Parse all rows, validate each independently, collect errors without stopping
**When to use:** User decision - lenient validation that imports valid rows and flags invalid ones
**Example:**

```typescript
// Source: PapaParse docs + zod-csv pattern
import Papa from 'papaparse';
import { z } from 'zod';

const EmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  team: z.string().min(1, 'Team is required'),
  department: z.string().optional(),
  role: z.string().optional(),
  assignedOffice: z.string().optional(),
});

interface ParseResult {
  valid: Employee[];
  invalid: { row: number; data: unknown; errors: string[] }[];
}

function parseEmployeeCsv(csvText: string): ParseResult {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    // Auto-detect delimiter (comma or semicolon)
    delimiter: '',
    delimitersToGuess: [',', ';', '\t'],
  });

  const valid: Employee[] = [];
  const invalid: ParseResult['invalid'] = [];

  parsed.data.forEach((row, index) => {
    const result = EmployeeSchema.safeParse(row);
    if (result.success) {
      valid.push(result.data);
    } else {
      invalid.push({
        row: index + 2, // +2 for 1-indexed + header row
        data: row,
        errors: result.error.errors.map(e => e.message),
      });
    }
  });

  return { valid, invalid };
}
```

### Pattern 2: Batch Geocoding with Progress

**What:** Queue geocoding requests with rate limiting and progress callbacks
**When to use:** After CSV parsing, before data is stored
**Example:**

```typescript
// Source: Geoapify rate-limiter tutorial
import { RequestRateLimiter } from '@geoapify/request-rate-limiter';

interface GeocodingProgress {
  completed: number;
  total: number;
  current: string; // Current address being processed
}

async function batchGeocode(
  addresses: string[],
  onProgress: (progress: GeocodingProgress) => void
): Promise<Map<string, { lat: number; lon: number } | null>> {
  const results = new Map();
  const API_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

  const requests = addresses.map((address, index) => async () => {
    const encoded = encodeURIComponent(address);
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encoded}&filter=countrycode:de&apiKey=${API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) return { address, coords: null };

    const data = await response.json();
    const coords = data.features?.[0]?.geometry?.coordinates;

    return {
      address,
      coords: coords ? { lat: coords[1], lon: coords[0] } : null,
    };
  });

  // 5 requests/sec for free tier
  await RequestRateLimiter.rateLimitedRequests(requests, 5, 1000, {
    onProgress: (progress) => {
      onProgress({
        completed: progress.completedRequests,
        total: progress.totalRequests,
        current: addresses[progress.completedRequests] || '',
      });
    },
  });

  return results;
}
```

### Pattern 3: Flexible Address Column Detection

**What:** Auto-detect whether CSV has single 'address' column or split columns
**When to use:** During CSV parsing, before validation
**Example:**

```typescript
// Source: User decision - accept both formats
function normalizeAddressColumns(
  row: Record<string, string>
): { address: string } {
  // Check for single address column
  if (row.address) {
    return { address: row.address };
  }

  // Check for split columns (German format)
  const street = row.street || row.strasse || row.str;
  const postcode = row.postcode || row.plz || row.zip;
  const city = row.city || row.stadt || row.ort;

  if (street && postcode && city) {
    return { address: `${street}, ${postcode} ${city}` };
  }

  // Fallback - try to find any address-like field
  const addressFields = ['adresse', 'anschrift', 'location'];
  for (const field of addressFields) {
    if (row[field.toLowerCase()]) {
      return { address: row[field.toLowerCase()] };
    }
  }

  return { address: '' }; // Will fail validation
}
```

### Pattern 4: Zustand Store with Persist and Merge

**What:** Store employee/office data with localStorage persistence, merge on import
**When to use:** Managing imported data that should survive page reloads
**Example:**

```typescript
// Source: Zustand persist middleware docs
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Employee {
  id: string;
  name: string;
  address: string;
  team: string;
  department?: string;
  role?: string;
  assignedOffice?: string;
  coords?: { lat: number; lon: number };
  geocodeStatus: 'pending' | 'success' | 'failed';
}

interface EmployeeStore {
  employees: Employee[];
  addEmployees: (newEmployees: Employee[]) => void;  // Merge behavior
  clearEmployees: () => void;
  updateGeocode: (id: string, coords: { lat: number; lon: number } | null) => void;
}

export const useEmployeeStore = create<EmployeeStore>()(
  persist(
    (set) => ({
      employees: [],

      // Merge: add new employees to existing (user decision)
      addEmployees: (newEmployees) => set((state) => ({
        employees: [...state.employees, ...newEmployees],
      })),

      clearEmployees: () => set({ employees: [] }),

      updateGeocode: (id, coords) => set((state) => ({
        employees: state.employees.map((e) =>
          e.id === id
            ? {
                ...e,
                coords,
                geocodeStatus: coords ? 'success' : 'failed',
              }
            : e
        ),
      })),
    }),
    {
      name: 'employee-storage',
    }
  )
);
```

### Anti-Patterns to Avoid

- **Geocoding in render loop:** Never call geocoding API inside useEffect without proper dependencies. Geocode once on import, store results.
- **Storing both raw and validated data:** Store only validated data. Derive any views from the single source.
- **Blocking main thread with large CSVs:** Use PapaParse with `worker: true` for files > 1MB.
- **Hardcoding geocoding API key:** Use environment variables (`VITE_GEOAPIFY_KEY`).

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSV delimiter detection | Regex-based guessing | PapaParse `delimitersToGuess` | Edge cases with quoted fields containing delimiters |
| Encoding detection | Byte inspection | jschardet library | Windows-1252 vs UTF-8 requires statistical analysis |
| Rate limiting | setTimeout chains | @geoapify/request-rate-limiter | Proper queue management, retry logic, progress callbacks |
| German name generation | Array of hardcoded names | @faker-js/faker with fakerDE | Realistic name combinations, 1000s of variations |
| File drag-drop | Native HTML5 events | react-dropzone | Accessibility, edge cases, type validation |

**Key insight:** CSV parsing and geocoding have many edge cases (encoding, rate limits, malformed data) that take weeks to handle properly. Libraries solve these in hours.

## Common Pitfalls

### Pitfall 1: German Character Encoding Corruption

**What goes wrong:** Umlauts (ae, oe, ue, ss) display as `???` or garbled characters after CSV import
**Why it happens:** Excel exports CSV in Windows-1252 or ISO-8859-1, not UTF-8. PapaParse defaults to browser encoding.
**How to avoid:**
1. Attempt parse as UTF-8 first (most common for modern files)
2. If German characters are corrupted, try Windows-1252 encoding
3. Show preview to user so they can spot encoding issues before confirming

```typescript
// Detection approach
import jschardet from 'jschardet';

function detectEncoding(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const result = jschardet.detect(Buffer.from(bytes));
  return result.encoding || 'UTF-8';
}
```

**Warning signs:** City names like "Munchen" display as "M??nchen" or "Mxnchen"

### Pitfall 2: Geocoding API Rate Limit Exceeded

**What goes wrong:** Importing 50+ addresses causes most to fail with 429 errors
**Why it happens:** Free geocoding tiers allow 1-5 requests/second. Parallel fetch() exceeds this instantly.
**How to avoid:**
1. Use @geoapify/request-rate-limiter with correct rate setting
2. Show progress bar so users know geocoding is working
3. Implement retry with exponential backoff for 429s
4. Cache results - same address should not be re-geocoded

**Warning signs:** Some addresses have coordinates, others don't; console shows 429 errors

### Pitfall 3: Semicolon Delimiter Misdetection

**What goes wrong:** German Excel uses semicolon as delimiter (comma is decimal separator). PapaParse may guess wrong.
**Why it happens:** PapaParse delimiter detection can be confused by numeric fields with commas (1.234,56 format)
**How to avoid:**
1. Explicitly include semicolon in `delimitersToGuess: [',', ';', '\t']`
2. Show preview table before import so user can verify columns parsed correctly
3. Allow manual delimiter override in UI if auto-detection fails

**Warning signs:** Single column instead of multiple; values contain semicolons

### Pitfall 4: BOM (Byte Order Mark) Corrupting First Header

**What goes wrong:** First column header has invisible character, becomes `"name"` instead of `name`
**Why it happens:** UTF-8-BOM files start with bytes EF BB BF which become invisible character in header
**How to avoid:**
1. PapaParse handles this automatically in recent versions
2. Trim header names in `transformHeader` callback
3. Test with files saved from Excel specifically

```typescript
Papa.parse(csv, {
  transformHeader: (header) => header.trim().replace(/^\uFEFF/, ''),
});
```

### Pitfall 5: Preview/Confirm Race Condition

**What goes wrong:** User clicks confirm while geocoding is still running from preview
**Why it happens:** Geocoding preview starts automatically, user doesn't wait for completion
**How to avoid:**
1. Don't auto-geocode in preview - only show parsed data
2. Geocode only after user clicks "Import" confirmation
3. Disable confirm button during geocoding, show progress

## Code Examples

### Complete CSV Import Service

```typescript
// Source: PapaParse docs + project patterns
// services/csvService.ts

import Papa from 'papaparse';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Schemas
export const OfficeSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
});

export const EmployeeSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  team: z.string().min(1),
  department: z.string().optional().default(''),
  role: z.string().optional().default(''),
  assignedOffice: z.string().optional().default(''),
});

export type Office = z.infer<typeof OfficeSchema> & { id: string };
export type Employee = z.infer<typeof EmployeeSchema> & {
  id: string;
  coords?: { lat: number; lon: number };
  geocodeStatus: 'pending' | 'success' | 'failed';
};

export interface CsvParseResult<T> {
  valid: T[];
  invalid: Array<{
    row: number;
    data: Record<string, unknown>;
    errors: string[];
  }>;
  warnings: string[];
}

export function parseEmployeeCsv(csvText: string): CsvParseResult<Employee> {
  const warnings: string[] = [];

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    delimiter: '',
    delimitersToGuess: [',', ';', '\t'],
    transformHeader: (h) => h.trim().toLowerCase().replace(/^\uFEFF/, ''),
  });

  if (parsed.errors.length > 0) {
    warnings.push(`CSV parse warnings: ${parsed.errors.map(e => e.message).join(', ')}`);
  }

  const valid: Employee[] = [];
  const invalid: CsvParseResult<Employee>['invalid'] = [];

  parsed.data.forEach((row, index) => {
    // Normalize address columns
    const normalized = {
      ...row,
      address: row.address ||
        [row.street || row.strasse, row.postcode || row.plz, row.city || row.stadt]
          .filter(Boolean)
          .join(', '),
    };

    const result = EmployeeSchema.safeParse(normalized);

    if (result.success) {
      valid.push({
        ...result.data,
        id: uuidv4(),
        geocodeStatus: 'pending',
      });
    } else {
      invalid.push({
        row: index + 2,
        data: row,
        errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      });
    }
  });

  return { valid, invalid, warnings };
}
```

### Seed Data Generator

```typescript
// Source: Faker.js German locale docs
// data/seedEmployees.ts

import { fakerDE } from '@faker-js/faker';

const TEAMS = [
  'Platform',
  'Frontend',
  'Backend',
  'Mobile',
  'DevOps',
  'QA',
  'Data',
  'Security',
];

const OFFICES = [
  { name: 'Frankfurt', city: 'Frankfurt am Main', address: 'Neue Mainzer Str. 52-58, 60311 Frankfurt am Main' },
  { name: 'Berlin Office', city: 'Berlin', address: 'Unter den Linden 21, 10117 Berlin' },
  { name: 'Munich Office', city: 'Munich', address: 'Maximilianstr. 35, 80539 Muenchen' },
  { name: 'Hamburg Office', city: 'Hamburg', address: 'Jungfernstieg 7, 20354 Hamburg' },
  { name: 'Duesseldorf Office', city: 'Duesseldorf', address: 'Koenigsallee 60, 40212 Duesseldorf' },
];

// Pre-geocoded office coordinates (from German PLZ dataset)
const OFFICE_COORDS = {
  'Frankfurt': { lat: 50.1109, lon: 8.6821 },
  'Berlin Office': { lat: 52.5200, lon: 13.4050 },
  'Munich Office': { lat: 48.1351, lon: 11.5820 },
  'Hamburg Office': { lat: 53.5511, lon: 9.9937 },
  'Duesseldorf Office': { lat: 51.2277, lon: 6.7735 },
};

export function generateSeedEmployees(count: number = 45): Employee[] {
  // Set seed for reproducibility
  fakerDE.seed(12345);

  const employees: Employee[] = [];

  for (let i = 0; i < count; i++) {
    // Assign to nearest office (clustered)
    const office = OFFICES[Math.floor(i / 9) % OFFICES.length];
    const officeCoords = OFFICE_COORDS[office.name as keyof typeof OFFICE_COORDS];

    // Generate address near office (within ~50km)
    const latOffset = (fakerDE.number.float({ min: -0.4, max: 0.4 }));
    const lonOffset = (fakerDE.number.float({ min: -0.5, max: 0.5 }));

    employees.push({
      id: fakerDE.string.uuid(),
      name: fakerDE.person.fullName(),
      address: `${fakerDE.location.streetAddress()}, ${fakerDE.location.zipCode()} ${fakerDE.location.city()}`,
      team: fakerDE.helpers.arrayElement(TEAMS),
      department: fakerDE.helpers.arrayElement(['Engineering', 'Product']),
      role: fakerDE.helpers.arrayElement(['Developer', 'Senior Developer', 'Tech Lead', 'Product Manager', 'Designer']),
      assignedOffice: office.name,
      coords: {
        lat: officeCoords.lat + latOffset,
        lon: officeCoords.lon + lonOffset,
      },
      geocodeStatus: 'success' as const,
    });
  }

  return employees;
}

export function generateSeedOffices(): Office[] {
  return OFFICES.map((office) => ({
    id: office.name.toLowerCase().replace(/\s+/g, '-'),
    name: office.name,
    address: office.address,
    coords: OFFICE_COORDS[office.name as keyof typeof OFFICE_COORDS],
    geocodeStatus: 'success' as const,
  }));
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| d3-dsv for CSV parsing | PapaParse with workers | 2023+ | Better encoding support, streaming for large files |
| Google Geocoding API | Geoapify/OpenCage (GDPR-compliant) | 2021+ (GDPR enforcement) | Required for EU employee data |
| Manual state persistence | Zustand persist middleware | 2024+ | Cleaner DX, automatic serialization |
| Native file input | react-dropzone | 2020+ | Better accessibility, drag-drop UX |

**Deprecated/outdated:**
- **faker.js (original):** Use @faker-js/faker - the original is unmaintained
- **Nominatim public API for batch:** Rate limits too strict (1/sec) for 50+ addresses

## Open Questions

1. **Geoapify API key distribution**
   - What we know: Need API key for geocoding, free tier is 3000/day
   - What's unclear: Should key be in env var or user-provided?
   - Recommendation: Use env var (`VITE_GEOAPIFY_KEY`) for simplicity in v1

2. **Offline geocoding fallback**
   - What we know: German PLZ dataset exists with ~8000 postcodes
   - What's unclear: Is postcode-level accuracy sufficient? (~few km)
   - Recommendation: Implement API geocoding first, consider PLZ fallback if API fails

3. **Large file handling threshold**
   - What we know: PapaParse can use Web Workers for large files
   - What's unclear: What file size triggers worker mode?
   - Recommendation: Enable `worker: true` for files > 500KB

## Sources

### Primary (HIGH confidence)

- [PapaParse Documentation](https://www.papaparse.com/docs) - CSV parsing configuration, delimiter detection, encoding
- [Geoapify Batch Geocoding Tutorial](https://www.geoapify.com/tutorial/batch-geocoding-js-and-rate-limits/) - Rate limiting, progress tracking
- [OpenCage GDPR Documentation](https://opencagedata.com/gdpr) - GDPR compliance, `no_record` parameter
- [Faker.js Localization Guide](https://fakerjs.dev/guide/localization) - German locale usage
- [Zustand Persist Middleware](https://zustand.docs.pmnd.rs/middlewares/persist) - localStorage persistence pattern
- [German PLZ Geocoord Dataset](https://github.com/WZBSocialScienceCenter/plz_geocoord) - Offline German postcode coordinates

### Secondary (MEDIUM confidence)

- [Geoapify Request Rate Limiter](https://github.com/geoapify/request-rate-limiter) - Batch geocoding library
- [jschardet GitHub](https://github.com/aadsm/jschardet) - Encoding detection for German characters
- [react-dropzone GitHub](https://github.com/react-dropzone/react-dropzone) - File upload component
- [zod-csv GitHub](https://github.com/bartoszgolebiowski/zod-csv) - CSV-specific Zod validation

### Tertiary (LOW confidence)

- WebSearch results on Excel CSV encoding behavior - community knowledge, validated by multiple sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official docs
- Architecture patterns: HIGH - Based on project research + official library patterns
- Pitfalls: HIGH - Multiple sources confirm encoding/rate-limit issues
- Geocoding options: MEDIUM - API pricing/limits may change

**Research date:** 2026-02-06
**Valid until:** 2026-03-06 (30 days - stable domain)
