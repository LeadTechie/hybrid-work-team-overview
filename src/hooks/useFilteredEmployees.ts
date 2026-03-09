import { useMemo } from 'react';
import { useEmployeeStore } from '../stores/employeeStore';
import { useOfficeStore } from '../stores/officeStore';
import { useFilterStore } from '../stores/filterStore';
import { calculateDistance } from '../utils/distance';
import type { Employee } from '../types/employee';

/**
 * Returns a memoized list of employees filtered by current filter state.
 * Only includes employees with successful geocoding.
 */
export function useFilteredEmployees(): Employee[] {
  const employees = useEmployeeStore((s) => s.employees);
  const offices = useOfficeStore((s) => s.offices);
  const teamFilters = useFilterStore((s) => s.teamFilters);
  const departmentFilters = useFilterStore((s) => s.departmentFilters);
  const officeFilters = useFilterStore((s) => s.officeFilters);
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const distanceMin = useFilterStore((s) => s.distanceMin);
  const distanceMax = useFilterStore((s) => s.distanceMax);
  const distanceReference = useFilterStore((s) => s.distanceReference);

  // Helper to calculate distance to reference point
  const getDistanceToReference = (emp: Employee): number | null => {
    if (!emp.coords) return null;
    const geocodedOffices = offices.filter((o) => o.coords);
    if (geocodedOffices.length === 0) return null;

    if (distanceReference === 'nearest') {
      return Math.min(
        ...geocodedOffices.map((o) =>
          calculateDistance(
            emp.coords!.lat,
            emp.coords!.lon,
            o.coords!.lat,
            o.coords!.lon
          )
        )
      );
    }

    const refOffice = geocodedOffices.find((o) => o.name === distanceReference);
    if (!refOffice?.coords) return null;
    return calculateDistance(
      emp.coords.lat,
      emp.coords.lon,
      refOffice.coords.lat,
      refOffice.coords.lon
    );
  };

  return useMemo(() => {
    return employees.filter((emp) => {
      // Filter out employees without successful geocoding
      if (emp.geocodeStatus !== 'success') {
        return false;
      }

      // Apply team filter (empty set = show all)
      if (teamFilters.size > 0 && emp.team && !teamFilters.has(emp.team)) {
        return false;
      }

      // Apply department filter (empty set = show all)
      if (departmentFilters.size > 0 && emp.department && !departmentFilters.has(emp.department)) {
        return false;
      }

      // Apply office filter (empty set = show all)
      if (officeFilters.size > 0 && emp.assignedOffice && !officeFilters.has(emp.assignedOffice)) {
        return false;
      }

      // Apply search query filter (case-insensitive)
      if (searchQuery.length > 0) {
        const query = searchQuery.toLowerCase();
        if (!emp.name.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Apply distance filter
      if (distanceMin > 0 || distanceMax !== Infinity) {
        const distance = getDistanceToReference(emp);
        if (distance === null) return false;
        if (distance < distanceMin || distance > distanceMax) return false;
      }

      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    employees,
    teamFilters,
    departmentFilters,
    officeFilters,
    searchQuery,
    distanceMin,
    distanceMax,
    distanceReference,
    offices,
  ]);
}
