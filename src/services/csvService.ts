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

// Build address from row data - handles single 'address' or split columns
function buildAddress(row: Record<string, string>): string | null {
  // First check for single address column
  if (row.address && row.address.trim()) {
    return row.address.trim();
  }

  // Try to combine street + postcode + city
  const street = row.street?.trim();
  const postcode = row.postcode?.trim();
  const city = row.city?.trim();

  if (street && postcode && city) {
    return `${street}, ${postcode} ${city}`;
  }

  // Partial data - try what we have
  if (street || city) {
    const parts = [street, postcode, city].filter(Boolean);
    if (parts.length >= 2) {
      return parts.join(', ');
    }
  }

  return null;
}

// Extract city from address or dedicated column
function extractCity(row: Record<string, string>, address: string): string {
  // If we have a dedicated city column, use it
  if (row.city?.trim()) {
    return row.city.trim();
  }

  // Try to extract from address (assume format: "Street, Postcode City" or "Street, City")
  const parts = address.split(',').map((p) => p.trim());
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1];
    // Remove postcode if present (German postcodes are 5 digits)
    const cityMatch = lastPart.replace(/^\d{5}\s*/, '').trim();
    if (cityMatch) {
      return cityMatch;
    }
  }

  return 'Unknown';
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
 * Handles: comma/semicolon delimiters, single or split address columns, German headers
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

    // Build address from row
    const address = buildAddress(row);

    // Prepare data for validation
    const officeData = {
      name: row.name?.trim() || '',
      address: address || '',
    };

    // Validate with Zod
    const result = OfficeSchema.safeParse(officeData);

    if (result.success) {
      const city = extractCity(row, address!);
      valid.push({
        id: uuidv4(),
        name: result.data.name,
        address: result.data.address,
        city,
        geocodeStatus: 'pending',
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
 * Handles: comma/semicolon delimiters, single or split address columns, German headers
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

    // Build address from row
    const address = buildAddress(row);

    // Prepare data for validation
    const employeeData = {
      name: row.name?.trim() || '',
      address: address || '',
      team: row.team?.trim() || '',
      department: row.department?.trim() || undefined,
      role: row.role?.trim() || undefined,
      assignedOffice: row.assignedoffice?.trim() || undefined,
    };

    // Clean up undefined values
    if (!employeeData.department) delete employeeData.department;
    if (!employeeData.role) delete employeeData.role;
    if (!employeeData.assignedOffice) delete employeeData.assignedOffice;

    // Validate with Zod
    const result = EmployeeSchema.safeParse(employeeData);

    if (result.success) {
      valid.push({
        id: uuidv4(),
        name: result.data.name,
        address: result.data.address,
        team: result.data.team,
        department: result.data.department,
        role: result.data.role,
        assignedOffice: result.data.assignedOffice,
        geocodeStatus: 'pending',
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
