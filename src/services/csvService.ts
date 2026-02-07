import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import type { Office } from '../types/office';
import type { Employee } from '../types/employee';
import {
  OfficeSchema,
  EmployeeSchema,
  type CsvParseResult,
  type ValidationError,
} from './validationService';
import { geocodeByPostcode } from './localGeocodingService';

// Header normalization - removes BOM, trims, lowercases
function normalizeHeader(header: string): string {
  return header.replace(/^\uFEFF/, '').trim().toLowerCase();
}

// German header variants mapping
const HEADER_ALIASES: Record<string, string> = {
  strasse: 'street',
  straße: 'street',
  plz: 'postcode',
  postleitzahl: 'postcode',
  stadt: 'city',
  ort: 'city',
  name: 'name',
  adresse: 'address',
  team: 'team',
  abteilung: 'department',
  rolle: 'role',
  buero: 'assignedoffice',
  büro: 'assignedoffice',
  assignedoffice: 'assignedoffice',
};

// Normalize a header to its canonical form
function canonicalizeHeader(header: string): string {
  const normalized = normalizeHeader(header);
  return HEADER_ALIASES[normalized] || normalized;
}

// Extract postcode from row data - supports postcode column or extraction from address
function extractPostcode(row: Record<string, string>): string | null {
  // Check dedicated postcode/plz column first
  if (row.postcode?.trim()) {
    return row.postcode.trim();
  }

  // Try to extract from address column (German postcodes are 5 digits)
  if (row.address?.trim()) {
    const match = row.address.match(/\b(\d{5})\b/);
    if (match) {
      return match[1];
    }
  }

  return null;
}

// Extract street from row data
function extractStreet(row: Record<string, string>): string | undefined {
  if (row.street?.trim()) {
    return row.street.trim();
  }

  // Try to extract from address (everything before postcode)
  if (row.address?.trim()) {
    const match = row.address.match(/^(.+?),?\s*\d{5}/);
    if (match) {
      return match[1].replace(/,\s*$/, '').trim();
    }
  }

  return undefined;
}

// Parse CSV and normalize headers
function parseWithPapa(csvText: string): {
  data: Record<string, string>[];
  errors: Papa.ParseError[];
} {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    delimitersToGuess: [',', ';', '\t'],
    transformHeader: (header) => canonicalizeHeader(header),
  });

  return {
    data: result.data,
    errors: result.errors,
  };
}

/**
 * Parse office CSV data
 * Handles: comma/semicolon delimiters, postcode column or address extraction, German headers
 */
export function parseOfficeCsv(csvText: string): CsvParseResult<Office> {
  const valid: Office[] = [];
  const invalid: ValidationError[] = [];
  const warnings: string[] = [];

  const { data, errors } = parseWithPapa(csvText);

  // Add Papa parse errors as warnings
  for (const error of errors) {
    warnings.push(`Row ${error.row}: ${error.message}`);
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 2; // +2 because row 1 is header, and we're 0-indexed

    // Extract postcode and street from row
    const postcode = extractPostcode(row);
    const street = extractStreet(row);

    // Prepare data for validation
    const officeData = {
      name: row.name?.trim() || '',
      postcode: postcode || '',
      street: street,
      city: row.city?.trim() || undefined,
    };

    // Validate with Zod
    const result = OfficeSchema.safeParse(officeData);

    if (result.success) {
      // Use local geocoding for coordinates
      const geocodeResult = geocodeByPostcode(result.data.postcode);

      valid.push({
        id: uuidv4(),
        name: result.data.name,
        postcode: result.data.postcode,
        street: result.data.street,
        city: result.data.city || geocodeResult.city || undefined,
        coords: geocodeResult.coords || undefined,
        geocodeStatus: geocodeResult.coords ? 'success' : 'failed',
      });
    } else {
      invalid.push({
        row: rowNumber,
        errors: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
        data: row,
      });
    }
  }

  return { valid, invalid, warnings };
}

/**
 * Parse employee CSV data
 * Handles: comma/semicolon delimiters, postcode column or address extraction, German headers
 */
export function parseEmployeeCsv(csvText: string): CsvParseResult<Employee> {
  const valid: Employee[] = [];
  const invalid: ValidationError[] = [];
  const warnings: string[] = [];

  const { data, errors } = parseWithPapa(csvText);

  // Add Papa parse errors as warnings
  for (const error of errors) {
    warnings.push(`Row ${error.row}: ${error.message}`);
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 2; // +2 because row 1 is header, and we're 0-indexed

    // Extract postcode and street from row
    const postcode = extractPostcode(row);
    const street = extractStreet(row);

    // Prepare data for validation
    const employeeData = {
      name: row.name?.trim() || '',
      postcode: postcode || '',
      team: row.team?.trim() || '',
      street: street,
      city: row.city?.trim() || undefined,
      department: row.department?.trim() || undefined,
      role: row.role?.trim() || undefined,
      assignedOffice: row.assignedoffice?.trim() || undefined,
    };

    // Clean up undefined values
    if (!employeeData.street) delete employeeData.street;
    if (!employeeData.city) delete employeeData.city;
    if (!employeeData.department) delete employeeData.department;
    if (!employeeData.role) delete employeeData.role;
    if (!employeeData.assignedOffice) delete employeeData.assignedOffice;

    // Validate with Zod
    const result = EmployeeSchema.safeParse(employeeData);

    if (result.success) {
      // Use local geocoding for coordinates
      const geocodeResult = geocodeByPostcode(result.data.postcode);

      valid.push({
        id: uuidv4(),
        name: result.data.name,
        postcode: result.data.postcode,
        street: result.data.street,
        city: result.data.city || geocodeResult.city || undefined,
        team: result.data.team,
        department: result.data.department,
        role: result.data.role,
        assignedOffice: result.data.assignedOffice,
        coords: geocodeResult.coords || undefined,
        geocodeAccuracy: 'postcode-centroid',
        geocodeStatus: geocodeResult.coords ? 'success' : 'failed',
      });
    } else {
      invalid.push({
        row: rowNumber,
        errors: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
        data: row,
      });
    }
  }

  return { valid, invalid, warnings };
}
