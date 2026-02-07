import { z } from 'zod';

// Data limits for the application
export const DATA_LIMITS = {
  MAX_EMPLOYEES: 1000,
  MAX_OFFICES: 20,
  MAX_FILE_SIZE_MB: 5,
} as const;

// Zod schemas for validation
export const OfficeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  postcode: z.string().regex(/^\d{5}$/, 'German postcode must be 5 digits'),
  street: z.string().optional(),
  city: z.string().optional(),
});

export const EmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  postcode: z.string().regex(/^\d{5}$/, 'German postcode must be 5 digits'),
  team: z.string().min(1, 'Team is required'),
  street: z.string().optional(),
  city: z.string().optional(),
  department: z.string().optional(),
  role: z.string().optional(),
  assignedOffice: z.string().optional(),
});

// Types derived from schemas
export type ValidatedOffice = z.infer<typeof OfficeSchema>;
export type ValidatedEmployee = z.infer<typeof EmployeeSchema>;

// Validation error with row context
export interface ValidationError {
  row: number;
  errors: string[];
  data: Record<string, unknown>;
}

// Result type for CSV parsing
export interface CsvParseResult<T> {
  valid: T[];
  invalid: ValidationError[];
  warnings: string[];
}
