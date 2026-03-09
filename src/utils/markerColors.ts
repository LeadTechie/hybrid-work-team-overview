import type { Employee } from '../types/employee';
import type { ColorByOption } from '../stores/filterStore';
import { colorService } from '../services/colorService';

// Fallback color for missing/empty values
export const DEFAULT_COLOR = '#6B7280'; // gray-500

/**
 * Get the appropriate color for an employee based on the colorBy attribute.
 * Uses colorService for dynamic color assignment with localStorage persistence.
 * Falls back to DEFAULT_COLOR if the attribute value is empty.
 */
export function getColorForEmployee(
  employee: Employee,
  colorBy: ColorByOption
): string {
  switch (colorBy) {
    case 'team':
      return colorService.getColor('team', employee.team);

    case 'department':
      if (!employee.department) return DEFAULT_COLOR;
      return colorService.getColor('department', employee.department);

    case 'assignedOffice':
      if (!employee.assignedOffice) return DEFAULT_COLOR;
      return colorService.getColor('assignedOffice', employee.assignedOffice);

    default:
      return DEFAULT_COLOR;
  }
}
