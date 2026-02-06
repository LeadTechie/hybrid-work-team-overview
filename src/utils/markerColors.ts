import type { Employee } from '../types/employee';
import type { ColorByOption } from '../stores/filterStore';

// Accessible, distinct colors for data visualization
export const DEFAULT_COLOR = '#6B7280'; // gray-500

export const TEAM_COLORS: Record<string, string> = {
  Platform: '#2563EB', // blue-600
  Frontend: '#F59E0B', // amber-500
  Backend: '#DC2626', // red-600
  Mobile: '#16A34A', // green-600
  DevOps: '#EA580C', // orange-600
  QA: '#CA8A04', // yellow-600
  Data: '#9333EA', // purple-600
  Security: '#475569', // slate-600
  default: DEFAULT_COLOR,
};

export const DEPARTMENT_COLORS: Record<string, string> = {
  Engineering: '#2563EB', // blue-600
  Product: '#7C3AED', // violet-600
  Design: '#EC4899', // pink-500
  Operations: '#0891B2', // cyan-600
  HR: '#65A30D', // lime-600
  Finance: '#059669', // emerald-600
  Marketing: '#E11D48', // rose-600
  default: DEFAULT_COLOR,
};

export const OFFICE_COLORS: Record<string, string> = {
  Berlin: '#2563EB', // blue-600
  Munich: '#16A34A', // green-600
  Hamburg: '#DC2626', // red-600
  Frankfurt: '#F59E0B', // amber-500
  Cologne: '#9333EA', // purple-600
  default: DEFAULT_COLOR,
};

/**
 * Get the appropriate color for an employee based on the colorBy attribute.
 * Falls back to DEFAULT_COLOR if the attribute value is not found in the palette.
 */
export function getColorForEmployee(
  employee: Employee,
  colorBy: ColorByOption
): string {
  switch (colorBy) {
    case 'team':
      return TEAM_COLORS[employee.team] ?? TEAM_COLORS.default;

    case 'department':
      if (!employee.department) return DEFAULT_COLOR;
      return DEPARTMENT_COLORS[employee.department] ?? DEPARTMENT_COLORS.default;

    case 'assignedOffice':
      if (!employee.assignedOffice) return DEFAULT_COLOR;
      return OFFICE_COLORS[employee.assignedOffice] ?? OFFICE_COLORS.default;

    default:
      return DEFAULT_COLOR;
  }
}
