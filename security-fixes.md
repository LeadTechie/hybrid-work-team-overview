# Security Fixes Proposal

This document outlines proposed fixes for the security issues identified in `security-review.md`.

---

## 1. Local Distance Calculation (No External API)

### Current State
- Distances are already calculated locally using Haversine formula in `src/utils/distance.ts`
- The external API (Geoapify) is used for **geocoding** (converting addresses to lat/lon coordinates), not distance calculation

### Proposal: Postcode-Based Local Geocoding

**All calculations done locally. No external data requests by default.**

Use bundled German postcode centroid data from [OpenPLZ API](https://www.openplzapi.org/de/) to convert postcodes to approximate coordinates entirely client-side.

**How it works:**
1. Bundle a static JSON file with German postcode centroids (downloaded once from OpenPLZ API during build)
2. CSV import requires `postcode` as a separate column
3. Look up postcode → centroid coordinates locally
4. Calculate distances using existing Haversine implementation
5. No network requests for geocoding

**Data source:**
- OpenPLZ API: https://www.openplzapi.org/de/
- License: Open Data (free for commercial use)
- Coverage: All ~8,000 German postcodes with centroid coordinates

**Implementation:**

```typescript
// src/data/germanPostcodes.ts
// Pre-downloaded from OpenPLZ API, bundled with app
export const GERMAN_POSTCODES: Record<string, { lat: number; lon: number; name: string }> = {
  "10115": { lat: 52.5323, lon: 13.3846, name: "Berlin" },
  "10117": { lat: 52.5167, lon: 13.3889, name: "Berlin" },
  "80331": { lat: 48.1372, lon: 11.5755, name: "München" },
  // ... ~8,000 entries (~300KB gzipped)
};
```

```typescript
// src/services/localGeocodingService.ts
import { GERMAN_POSTCODES } from '../data/germanPostcodes';

export interface LocalGeocodeResult {
  postcode: string;
  coords: { lat: number; lon: number } | null;
  city: string | null;
  accuracy: 'postcode-centroid';
}

/**
 * Geocode using bundled postcode data - NO external requests
 */
export function geocodeByPostcode(postcode: string): LocalGeocodeResult {
  const normalized = postcode.trim().replace(/\s/g, '');
  const data = GERMAN_POSTCODES[normalized];

  if (data) {
    return {
      postcode: normalized,
      coords: { lat: data.lat, lon: data.lon },
      city: data.name,
      accuracy: 'postcode-centroid',
    };
  }

  return {
    postcode: normalized,
    coords: null,
    city: null,
    accuracy: 'postcode-centroid',
  };
}
```

**CSV Import Schema - Postcode Required:**

```typescript
// src/services/validationService.ts
export const EmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  postcode: z.string().regex(/^\d{5}$/, 'German postcode must be 5 digits'),
  team: z.string().min(1, 'Team is required'),
  street: z.string().optional(),      // For display & accurate geocoding
  city: z.string().optional(),        // Auto-filled from postcode if missing
  department: z.string().optional(),
  role: z.string().optional(),
  assignedOffice: z.string().optional(),
});

export const OfficeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  postcode: z.string().regex(/^\d{5}$/, 'German postcode must be 5 digits'),
  street: z.string().optional(),
  city: z.string().optional(),
});
```

**Example CSV format:**

```csv
name,postcode,street,team,department
Max Mustermann,10115,Hauptstr. 1,Engineering,Product
Anna Schmidt,80331,Marienplatz 5,Frontend,Engineering
```

**Build script to download postcode data:**

```typescript
// scripts/download-postcodes.ts
// Run during build: downloads from OpenPLZ API and generates germanPostcodes.ts
async function downloadPostcodes() {
  const response = await fetch('https://openplzapi.org/de/Localities?page=1&pageSize=10000');
  const data = await response.json();
  // Transform and write to src/data/germanPostcodes.ts
}
```

**Files to modify:**
- `src/data/germanPostcodes.ts` - New: bundled postcode data
- `src/services/localGeocodingService.ts` - New: local lookup service
- `src/services/validationService.ts` - Update schemas for postcode column
- `src/services/csvService.ts` - Parse postcode, auto-fill city
- `src/components/import/ImportPanel.tsx` - Use local geocoding (no async needed)
- `src/services/geocodingService.ts` - Keep for optional accurate mode only
- `.env.example` - Delete `VITE_GEOAPIFY_KEY` line (no longer used)

---

## 2. Browser-Only Data Processing (No Server Communication)

### Current State
- Data is stored in localStorage (browser-only) ✓
- Geocoding sends addresses to external API ✗

### Proposal: Enforce Client-Only Architecture

**All data processing done locally. No external data requests by default.**

**Implementation:**

1. **Use local postcode geocoding** (see fix #1) - no API calls

2. **Add Content Security Policy** to prevent accidental data leakage:

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://*.tile.openstreetmap.org data:;
  connect-src 'self';
">
```

Note: CSP `connect-src` must be updated to allow Geoapify if user enables accurate mode.

3. **Add visible privacy indicator** in UI:

```typescript
// src/components/PrivacyBadge.tsx
export function PrivacyBadge() {
  return (
    <div className="privacy-badge" title="All calculations performed locally in your browser">
      🔒 All data stays in your browser - no external requests
    </div>
  );
}
```

4. **Document the architecture** for users:
- Tooltip: "Distance calculations use postcode centroids. All processing happens in your browser. No data is sent to any server."

---

## 3. Optional Accurate Geocoding (User-Initiated)

### Proposal: Toolbar Button for External Geocoding

By default, distances are approximate (postcode centroid). Users can opt-in to accurate geocoding via a toolbar button that clearly warns about external data transfer.

### API Key Requirement

**CRITICAL: No API key in source code or JS bundle.**

| Requirement | Implementation |
|-------------|----------------|
| API key NEVER in source code | Remove `VITE_GEOAPIFY_KEY` from `.env` and codebase |
| API key NEVER in JS bundle | No build-time injection of secrets |
| User provides their own key | Runtime prompt before geocoding |
| Key stored in sessionStorage only | Cleared when browser tab closes |
| Key never sent to our servers | Client-side only, direct to Geoapify |

```typescript
// ❌ REMOVE - No API key in environment variables
// .env
// VITE_GEOAPIFY_KEY=xxx  <-- DELETE THIS

// ❌ REMOVE - No API key in source code
// geocodingService.ts
// const apiKey = import.meta.env.VITE_GEOAPIFY_KEY;  <-- DELETE THIS

// ✅ CORRECT - User enters key at runtime
// Key only exists in sessionStorage after user input
const apiKey = sessionStorage.getItem('geoapify_api_key');
if (!apiKey) {
  // Show modal prompting user to enter their key
  showApiKeyModal();
  return;
}
```

**User flow:**
1. User clicks "Get accurate distances with Geoapify"
2. Modal appears requesting API key
3. User enters their own Geoapify API key
4. Key stored in `sessionStorage` (cleared on tab close)
5. Geocoding proceeds with user's key
6. Key never touches our servers or source code

**Toolbar Button:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  📍 Get accurate distances with Geoapify                           │
│  ⚠️ Address data will be sent to Geoapify                          │
│  📄 Terms & Conditions                                              │
└─────────────────────────────────────────────────────────────────────┘
```

**Implementation:**

```typescript
// src/components/AccurateGeocodingButton.tsx
import { useState } from 'react';

interface Props {
  onConfirm: (apiKey: string) => void;
  pendingCount: number; // Number of items that would be geocoded
}

export function AccurateGeocodingButton({ onConfirm, pendingCount }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleConfirm = () => {
    if (apiKey && agreed) {
      sessionStorage.setItem('geoapify_api_key', apiKey);
      onConfirm(apiKey);
      setShowModal(false);
    }
  };

  return (
    <>
      <button
        className="accurate-geocoding-btn"
        onClick={() => setShowModal(true)}
        title="Recalculate distances using exact addresses"
      >
        📍 Get accurate distances with Geoapify
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Enable Accurate Geocoding</h3>

            <div className="warning-box">
              <p>⚠️ <strong>Privacy Notice</strong></p>
              <p>
                This will send {pendingCount} street addresses to Geoapify's
                geocoding service to get precise coordinates.
              </p>
              <p>
                Currently, distances are calculated using postcode centroids
                (approximate, ~5km accuracy). Accurate mode provides street-level
                precision.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="apiKey">Your Geoapify API Key:</label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key..."
              />
              <a
                href="https://www.geoapify.com/get-started-with-maps-api"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get a free API key (3,000 requests/day)
              </a>
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                I understand that address data will be sent to Geoapify and agree to their{' '}
                <a
                  href="https://www.geoapify.com/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="https://www.geoapify.com/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            <div className="button-group">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button
                onClick={handleConfirm}
                disabled={!apiKey || !agreed}
                className="primary"
              >
                Geocode {pendingCount} addresses
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

**Geocoding Service Updates:**

```typescript
// src/services/geocodingService.ts

// ❌ REMOVE this line - no more env variable
// const apiKey = import.meta.env.VITE_GEOAPIFY_KEY;

// ✅ API key only from sessionStorage (user-provided at runtime)
export function getApiKey(): string | null {
  return sessionStorage.getItem('geoapify_api_key');
}

export function setApiKey(key: string): void {
  sessionStorage.setItem('geoapify_api_key', key);
}

export function clearApiKey(): void {
  sessionStorage.removeItem('geoapify_api_key');
}

// Update batchGeocode to require explicit API key parameter
export async function batchGeocode(
  addresses: string[],
  apiKey: string,  // Now required parameter, not from env
  onProgress?: (progress: GeocodeProgress) => void
): Promise<GeocodeResult[]> {
  // ... existing implementation using passed apiKey
}
```

**Accuracy Indicator in UI:**

```typescript
// Show accuracy level per employee/office
<span className="accuracy-badge">
  {employee.geocodeAccuracy === 'address' ? '📍 Accurate' : '📮 Postcode'}
</span>
```

**Updated Types:**

```typescript
// src/types/employee.ts
export interface Employee {
  id: string;
  name: string;
  postcode: string;
  street?: string;
  city?: string;
  team: string;
  department?: string;
  role?: string;
  assignedOffice?: string;
  coords?: { lat: number; lon: number };
  geocodeAccuracy: 'postcode-centroid' | 'address';
}
```

---

## 4. (Reserved)

---

## 5. Data Limits: 1000 Employees, 20 Offices

### Proposal: Enforce Import Limits

**Implementation:**

```typescript
// src/services/validationService.ts

export const DATA_LIMITS = {
  MAX_EMPLOYEES: 1000,
  MAX_OFFICES: 20,
} as const;
```

```typescript
// src/components/import/ImportPanel.tsx

import { DATA_LIMITS } from '../../services/validationService';

const handleImport = async () => {
  if (!parseResult || parseResult.valid.length === 0) return;

  const currentCount = importType === 'offices'
    ? offices.length
    : employees.length;

  const limit = importType === 'offices'
    ? DATA_LIMITS.MAX_OFFICES
    : DATA_LIMITS.MAX_EMPLOYEES;

  const newTotal = currentCount + parseResult.valid.length;

  if (newTotal > limit) {
    setError(`Cannot import: would exceed ${limit} ${importType} limit. ` +
      `Current: ${currentCount}, Importing: ${parseResult.valid.length}`);
    return;
  }

  // ... proceed with import
};
```

**Also add file size limit in CsvUploader:**

```typescript
// src/components/import/CsvUploader.tsx

const MAX_FILE_SIZE_MB = 5;

const onDrop = useCallback((acceptedFiles: File[]) => {
  if (acceptedFiles.length > 0) {
    const file = acceptedFiles[0];

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    handleFileRead(file);
  }
}, [handleFileRead]);
```

**Display limits in UI:**

```typescript
// src/components/DataSummary.tsx - add limit indicators

<p>
  Employees: {employees.length} / {DATA_LIMITS.MAX_EMPLOYEES}
</p>
<p>
  Offices: {offices.length} / {DATA_LIMITS.MAX_OFFICES}
</p>
```

---

## Summary of Changes

| Fix | Description | Files to Modify | Effort |
|-----|-------------|-----------------|--------|
| 1. Local postcode geocoding | Bundle OpenPLZ data, require postcode column | New `germanPostcodes.ts`, `localGeocodingService.ts`, update schemas | Medium |
| 2. Browser-only enforcement | CSP headers, privacy badge, no default API calls | `index.html`, new `PrivacyBadge.tsx` | Low |
| 3. Optional accurate geocoding | Toolbar button with consent modal, T&C links, user-provided API key (never in bundle) | New `AccurateGeocodingButton.tsx`, update `geocodingService.ts`, delete `.env` key | Medium |
| 5. Data limits | 1000 employees, 20 offices, 5MB file limit | `validationService.ts`, `ImportPanel.tsx`, `CsvUploader.tsx` | Low |

---

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DEFAULT MODE                                 │
│                    (No external requests)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   CSV Import          Local Lookup           Distance Calc          │
│   ┌─────────┐        ┌───────────┐          ┌──────────────┐        │
│   │postcode │───────▶│ Bundled   │─────────▶│ Haversine    │        │
│   │ "10115" │        │ PLZ Data  │ coords   │ (local)      │        │
│   └─────────┘        └───────────┘          └──────────────┘        │
│                                                                      │
│   Accuracy: ~5km (postcode centroid)                                │
│   Privacy:  ✅ All data stays in browser                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       ACCURATE MODE                                  │
│              (User-initiated, requires consent)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   User clicks         Consent Modal         External API            │
│   ┌─────────┐        ┌───────────┐         ┌──────────────┐         │
│   │Toolbar  │───────▶│ T&C agree │────────▶│ Geoapify     │         │
│   │ Button  │        │ API key   │ address │ Geocoding    │         │
│   └─────────┘        └───────────┘         └──────────────┘         │
│                                                                      │
│   Accuracy: Street-level                                            │
│   Privacy:  ⚠️ Addresses sent to Geoapify (user consented)          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Post-Fix Security Rating

After implementing these fixes:

| Category | Before | After | Notes |
|----------|--------|-------|-------|
| **Security** | 3/10 | 8/10 | Suitable for production use with real employee data |

**Why 8/10 and not higher:**
- localStorage still unencrypted (acceptable for this use case)
- No "Clear All Data" button for shared computers
- Consider adding data export with formula injection protection

**Key improvements:**
- ✅ No external API calls by default
- ✅ All distance calculations performed locally
- ✅ User must explicitly consent before any data leaves browser
- ✅ API key never in source code or JS bundle - user provides at runtime
- ✅ API key stored in sessionStorage only (cleared on tab close)
- ✅ Clear privacy indicators in UI
- ✅ Data limits prevent abuse
