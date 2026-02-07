import { useMemo } from 'react';
import { useFilteredEmployees } from '../../hooks/useFilteredEmployees';
import { useEmployeeStore } from '../../stores/employeeStore';
import { useOfficeStore } from '../../stores/officeStore';
import { useFilterStore } from '../../stores/filterStore';
import { SortableTable, type Column } from './SortableTable';
import { calculateDistance, formatDistance } from '../../utils/distance';
import type { Employee } from '../../types/employee';

interface EmployeeWithDistances extends Employee {
  [key: `distance_${string}`]: number | null;
}

export function EmployeesTable() {
  const allEmployees = useEmployeeStore((s) => s.employees);
  const filteredEmployees = useFilteredEmployees();
  const { offices } = useOfficeStore();
  const { teamFilter, departmentFilter, officeFilter, searchQuery } = useFilterStore();

  const hasFilters = teamFilter || departmentFilter || officeFilter || searchQuery;
  const baseEmployees = hasFilters ? filteredEmployees : allEmployees;

  // Build columns dynamically based on offices
  const columns = useMemo((): Column<EmployeeWithDistances>[] => {
    const baseColumns: Column<EmployeeWithDistances>[] = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'postcode', label: 'Postcode', sortable: true },
      {
        key: 'street',
        label: 'Street',
        sortable: true,
        render: (emp) => emp.street || '—',
      },
      {
        key: 'city',
        label: 'City',
        sortable: true,
        render: (emp) => emp.city || '—',
      },
      { key: 'team', label: 'Team', sortable: true },
      { key: 'department', label: 'Department', sortable: true },
      { key: 'role', label: 'Role', sortable: true },
      {
        key: 'assignedOffice',
        label: 'Assigned Office',
        sortable: true,
        render: (emp) => emp.assignedOffice || '—',
      },
      {
        key: 'geocodeStatus',
        label: 'Status',
        sortable: true,
        render: (emp) => (
          <span className={`status-badge status-${emp.geocodeStatus}`}>
            {emp.geocodeStatus}
          </span>
        ),
      },
    ];

    // Add a column for each office showing distance
    const officeColumns: Column<EmployeeWithDistances>[] = offices.map((office) => ({
      key: `distance_${office.id}`,
      label: `→ ${office.name}`,
      sortable: true,
      render: (emp) => {
        const distanceKey = `distance_${office.id}` as const;
        const distance = emp[distanceKey];
        return formatDistance(distance);
      },
    }));

    return [...baseColumns, ...officeColumns];
  }, [offices]);

  // Enrich employees with distance calculations
  const displayEmployees = useMemo((): EmployeeWithDistances[] => {
    return baseEmployees.map((emp) => {
      const enriched: EmployeeWithDistances = { ...emp };

      offices.forEach((office) => {
        const distanceKey = `distance_${office.id}` as const;
        if (emp.coords && office.coords) {
          enriched[distanceKey] = calculateDistance(
            emp.coords.lat,
            emp.coords.lon,
            office.coords.lat,
            office.coords.lon
          );
        } else {
          enriched[distanceKey] = null;
        }
      });

      return enriched;
    });
  }, [baseEmployees, offices]);

  return (
    <div className="data-table-view">
      <div className="table-header">
        <h2>Employees</h2>
        <span className="table-count">
          {hasFilters
            ? `${filteredEmployees.length} of ${allEmployees.length} (filtered)`
            : `${allEmployees.length} total`}
        </span>
      </div>
      <SortableTable
        data={displayEmployees}
        columns={columns}
        keyExtractor={(emp) => emp.id}
      />
    </div>
  );
}
