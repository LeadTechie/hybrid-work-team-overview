import { useMemo } from 'react';
import { useEmployeeStore } from '../stores/employeeStore';
import { useFilterStore } from '../stores/filterStore';
import type { Employee } from '../types/employee';

/**
 * Returns a memoized list of employees filtered by current filter state.
 * Only includes employees with successful geocoding.
 */
export function useFilteredEmployees(): Employee[] {
  const employees = useEmployeeStore((s) => s.employees);
  const teamFilter = useFilterStore((s) => s.teamFilter);
  const departmentFilter = useFilterStore((s) => s.departmentFilter);
  const officeFilter = useFilterStore((s) => s.officeFilter);
  const searchQuery = useFilterStore((s) => s.searchQuery);

  return useMemo(() => {
    return employees.filter((emp) => {
      // Filter out employees without successful geocoding
      if (emp.geocodeStatus !== 'success') {
        return false;
      }

      // Apply team filter
      if (teamFilter && emp.team !== teamFilter) {
        return false;
      }

      // Apply department filter
      if (departmentFilter && emp.department !== departmentFilter) {
        return false;
      }

      // Apply office filter
      if (officeFilter && emp.assignedOffice !== officeFilter) {
        return false;
      }

      // Apply search query filter (case-insensitive)
      if (searchQuery.length > 0) {
        const query = searchQuery.toLowerCase();
        if (!emp.name.toLowerCase().includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [employees, teamFilter, departmentFilter, officeFilter, searchQuery]);
}
