import { v4 as uuidv4 } from 'uuid';
import { fakerDE as faker } from '@faker-js/faker';
import type { Employee } from '../types/employee';

// Office coordinates for clustering employees nearby
const OFFICE_COORDS = [
  { lat: 50.1109, lon: 8.6821 },   // Frankfurt
  { lat: 52.52, lon: 13.405 },     // Berlin
  { lat: 48.1351, lon: 11.582 },   // Munich
  { lat: 53.5511, lon: 9.9937 },   // Hamburg
  { lat: 51.2277, lon: 6.7735 },   // Düsseldorf
];

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

/**
 * Generate a random offset within ~50km of a point.
 * Approximately 0.5 degrees latitude/longitude = 50km
 */
function randomOffset(): number {
  return (faker.number.float({ min: -0.5, max: 0.5 }));
}

/**
 * Generate 45 German employees with realistic data.
 * Uses fakerDE for German names and addresses.
 * Employees are clustered near the 5 office locations.
 */
export function generateSeedEmployees(): Employee[] {
  // Set seed for reproducible data
  faker.seed(12345);

  const employees: Employee[] = [];

  for (let i = 0; i < 45; i++) {
    // Pick a random office to cluster near
    const officeCoords = faker.helpers.arrayElement(OFFICE_COORDS);

    // Generate coords near the selected office
    const coords = {
      lat: officeCoords.lat + randomOffset(),
      lon: officeCoords.lon + randomOffset(),
    };

    // Generate realistic German address
    const streetAddress = faker.location.streetAddress();
    const zipCode = faker.location.zipCode();
    const city = faker.location.city();
    const address = `${streetAddress}, ${zipCode} ${city}`;

    const employee: Employee = {
      id: uuidv4(),
      name: faker.person.fullName(),
      address,
      team: faker.helpers.arrayElement(TEAMS),
      department: faker.helpers.arrayElement(DEPARTMENTS),
      role: faker.helpers.arrayElement(ROLES),
      coords,
      geocodeStatus: 'success',
    };

    employees.push(employee);
  }

  return employees;
}
