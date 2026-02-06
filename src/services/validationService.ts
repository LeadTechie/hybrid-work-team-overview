import { z } from 'zod';

// Zod schemas for validation
export const OfficeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
});

export const EmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  team: z.string().min(1, 'Team is required'),
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
