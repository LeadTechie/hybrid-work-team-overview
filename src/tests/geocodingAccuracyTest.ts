/**
 * Geocoding Accuracy Test
 *
 * Compares postcode-centroid distances vs API-geocoded (street-level) distances
 * to validate that postcode-based calculations are reasonably accurate.
 *
 * Run with: npx tsx src/tests/geocodingAccuracyTest.ts
 */

import { generateSeedEmployees } from '../data/seedEmployees';
import { generateSeedOffices } from '../data/seedOffices';
import { calculateDistance } from '../utils/distance';

const API_KEY = process.env.VITE_GEOAPIFY_KEY || 'd131b18fa22f41d0a75b60515f615758';
const GEOAPIFY_ENDPOINT = 'https://api.geoapify.com/v1/geocode/search';

interface GeocodingResult {
  employeeName: string;
  postcode: string;
  street: string | undefined;
  city: string | undefined;
  postcodeCoords: { lat: number; lon: number } | undefined;
  apiCoords: { lat: number; lon: number } | null;
  apiError?: string;
}

interface DistanceComparison {
  employeeName: string;
  officeName: string;
  postcodeDistance: number | null;
  apiDistance: number | null;
  difference: number | null;
  percentDiff: number | null;
}

async function geocodeWithApi(address: string): Promise<{ lat: number; lon: number } | null> {
  const url = new URL(GEOAPIFY_ENDPOINT);
  url.searchParams.set('text', address);
  url.searchParams.set('filter', 'countrycode:de');
  url.searchParams.set('limit', '1');
  url.searchParams.set('apiKey', API_KEY);

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lon, lat] = data.features[0].geometry.coordinates;
      return { lat, lon };
    }
    return null;
  } catch (error) {
    console.error('API error:', error);
    return null;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  console.log('='.repeat(70));
  console.log(' GEOCODING ACCURACY TEST');
  console.log(' Comparing postcode-centroid vs API (street-level) distances');
  console.log('='.repeat(70));
  console.log();

  // Generate test data
  const employees = generateSeedEmployees();
  const offices = generateSeedOffices();

  // Pick 20 employees with street addresses
  const testEmployees = employees
    .filter(emp => emp.street && emp.postcode && emp.coords)
    .slice(0, 20);

  console.log(`Testing ${testEmployees.length} employees against ${offices.length} offices`);
  console.log();

  // Geocode each employee with API
  const geocodingResults: GeocodingResult[] = [];

  console.log('Step 1: Geocoding employees with API...');
  console.log('-'.repeat(70));

  for (const emp of testEmployees) {
    const address = `${emp.street}, ${emp.postcode} ${emp.city || ''}, Germany`;
    console.log(`  Geocoding: ${emp.name} (${emp.postcode})`);

    const apiCoords = await geocodeWithApi(address);

    geocodingResults.push({
      employeeName: emp.name,
      postcode: emp.postcode,
      street: emp.street,
      city: emp.city,
      postcodeCoords: emp.coords,
      apiCoords,
      apiError: apiCoords ? undefined : 'Failed to geocode',
    });

    // Rate limit: 5 req/sec
    await delay(220);
  }

  console.log();
  console.log(`Geocoded: ${geocodingResults.filter(r => r.apiCoords).length}/${geocodingResults.length} successful`);
  console.log();

  // Calculate distances and compare
  console.log('Step 2: Comparing distances...');
  console.log('-'.repeat(70));

  const comparisons: DistanceComparison[] = [];

  for (const result of geocodingResults) {
    if (!result.postcodeCoords) continue;

    for (const office of offices) {
      if (!office.coords) continue;

      const postcodeDistance = calculateDistance(
        result.postcodeCoords.lat,
        result.postcodeCoords.lon,
        office.coords.lat,
        office.coords.lon
      );

      let apiDistance: number | null = null;
      if (result.apiCoords) {
        apiDistance = calculateDistance(
          result.apiCoords.lat,
          result.apiCoords.lon,
          office.coords.lat,
          office.coords.lon
        );
      }

      const difference = apiDistance !== null ? Math.abs(postcodeDistance - apiDistance) : null;
      const percentDiff = apiDistance !== null && apiDistance > 0
        ? (difference! / apiDistance) * 100
        : null;

      comparisons.push({
        employeeName: result.employeeName,
        officeName: office.name,
        postcodeDistance,
        apiDistance,
        difference,
        percentDiff,
      });
    }
  }

  // Print results
  console.log();
  console.log('Step 3: Results Summary');
  console.log('='.repeat(70));

  // Group by employee for readability
  const employeeGroups = new Map<string, DistanceComparison[]>();
  for (const comp of comparisons) {
    if (!employeeGroups.has(comp.employeeName)) {
      employeeGroups.set(comp.employeeName, []);
    }
    employeeGroups.get(comp.employeeName)!.push(comp);
  }

  let totalComparisons = 0;
  let totalDifference = 0;
  let maxDifference = 0;
  let maxDiffEmployee = '';
  let maxDiffOffice = '';

  for (const [empName, comps] of employeeGroups) {
    console.log();
    console.log(`${empName}:`);

    for (const comp of comps) {
      if (comp.apiDistance === null) {
        console.log(`  → ${comp.officeName}: ${comp.postcodeDistance?.toFixed(1)} km (postcode only, API failed)`);
      } else {
        const diffStr = comp.difference! < 1
          ? `${(comp.difference! * 1000).toFixed(0)}m`
          : `${comp.difference!.toFixed(1)}km`;

        console.log(`  → ${comp.officeName}: Postcode=${comp.postcodeDistance?.toFixed(1)}km, API=${comp.apiDistance.toFixed(1)}km, Diff=${diffStr} (${comp.percentDiff?.toFixed(1)}%)`);

        totalComparisons++;
        totalDifference += comp.difference!;

        if (comp.difference! > maxDifference) {
          maxDifference = comp.difference!;
          maxDiffEmployee = empName;
          maxDiffOffice = comp.officeName;
        }
      }
    }
  }

  // Overall statistics
  console.log();
  console.log('='.repeat(70));
  console.log(' STATISTICS');
  console.log('='.repeat(70));

  const avgDifference = totalComparisons > 0 ? totalDifference / totalComparisons : 0;

  console.log(`Total comparisons:     ${totalComparisons}`);
  console.log(`Average difference:    ${avgDifference.toFixed(2)} km`);
  console.log(`Maximum difference:    ${maxDifference.toFixed(2)} km`);
  console.log(`  (${maxDiffEmployee} → ${maxDiffOffice})`);

  // Calculate stats excluding outliers (>10km difference = likely fake address mismatch)
  const validComparisons = comparisons.filter(c => c.difference !== null && c.difference < 10);
  const validTotal = validComparisons.reduce((sum, c) => sum + c.difference!, 0);
  const validAvg = validComparisons.length > 0 ? validTotal / validComparisons.length : 0;
  const outlierCount = comparisons.filter(c => c.difference !== null && c.difference >= 10).length;

  console.log();
  console.log('Excluding outliers (>10km, likely fake address mismatches):');
  console.log(`  Valid comparisons:   ${validComparisons.length}`);
  console.log(`  Outliers excluded:   ${outlierCount}`);
  console.log(`  Average difference:  ${validAvg.toFixed(2)} km`);
  console.log();

  // Assessment based on valid comparisons
  console.log('ASSESSMENT:');
  if (validAvg < 3) {
    console.log('✓ PASS: Average difference < 3km - postcode geocoding is sufficiently accurate');
  } else if (validAvg < 5) {
    console.log('⚠ MARGINAL: Average difference 3-5km - postcode geocoding is acceptable');
  } else {
    console.log('✗ FAIL: Average difference > 5km - postcode geocoding may be too inaccurate');
  }

  console.log();
  console.log('Note: German postcodes cover ~2-10km areas, so differences up to 5km are expected.');
  console.log('Outliers occur when faker generates fake street addresses that the API');
  console.log('geocodes to a different location than the postcode centroid.');
  console.log('For real addresses, accuracy would be even better.');
}

// Run the test
runTest().catch(console.error);
