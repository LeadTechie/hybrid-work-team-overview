import { v4 as uuidv4 } from 'uuid';
import { fakerDE as faker } from '@faker-js/faker';
import type { Employee } from '../types/employee';
import { geocodeByPostcode } from '../services/localGeocodingService';
import { GERMAN_POSTCODES } from './germanPostcodes';

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

const DEPARTMENTS = ['Engineering', 'Product'];

const ROLES = [
  'Developer',
  'Senior Developer',
  'Tech Lead',
  'Product Manager',
  'Designer',
];

// Get array of valid German postcodes for random selection
const VALID_POSTCODES = Object.keys(GERMAN_POSTCODES);

/**
 * Generate 100 German employees with realistic data.
 * Uses fakerDE for German names and addresses.
 * Uses valid postcodes from bundled database to ensure geocoding always succeeds.
 */
export function generateSeedEmployees(): Employee[] {
  // Set seed for reproducible data
  faker.seed(12345);

  const employees: Employee[] = [];

  for (let i = 0; i < 100; i++) {
    // Generate realistic German address components
    const streetAddress = faker.location.streetAddress();
    // Pick from valid postcodes to ensure geocoding always works
    const postcode = faker.helpers.arrayElement(VALID_POSTCODES);

    // Use local geocoding for coordinates (will always succeed with valid postcodes)
    const geocodeResult = geocodeByPostcode(postcode);

    const employee: Employee = {
      id: uuidv4(),
      name: faker.person.fullName(),
      postcode: postcode,
      street: streetAddress,
      city: geocodeResult.city || faker.location.city(),
      team: faker.helpers.arrayElement(TEAMS),
      department: faker.helpers.arrayElement(DEPARTMENTS),
      role: faker.helpers.arrayElement(ROLES),
      coords: geocodeResult.coords || undefined,
      geocodeAccuracy: 'postcode-centroid',
      geocodeStatus: geocodeResult.coords ? 'success' : 'failed',
    };

    employees.push(employee);
  }

  return employees;
}
