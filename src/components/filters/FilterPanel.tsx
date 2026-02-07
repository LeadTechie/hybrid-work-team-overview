import { useMemo } from 'react';
import { useEmployeeStore } from '../../stores/employeeStore';
import { useOfficeStore } from '../../stores/officeStore';
import { useFilterStore, type ColorByOption } from '../../stores/filterStore';

/**
 * Filter panel with dropdowns for team, department, office filtering
 * and color-by selection.
 */
export function FilterPanel() {
  const employees = useEmployeeStore((s) => s.employees);
  const offices = useOfficeStore((s) => s.offices);

  const teamFilter = useFilterStore((s) => s.teamFilter);
  const departmentFilter = useFilterStore((s) => s.departmentFilter);
  const officeFilter = useFilterStore((s) => s.officeFilter);
  const colorBy = useFilterStore((s) => s.colorBy);

  const setTeamFilter = useFilterStore((s) => s.setTeamFilter);
  const setDepartmentFilter = useFilterStore((s) => s.setDepartmentFilter);
  const setOfficeFilter = useFilterStore((s) => s.setOfficeFilter);
  const mapMode = useFilterStore((s) => s.mapMode);
  const setColorBy = useFilterStore((s) => s.setColorBy);
  const setMapMode = useFilterStore((s) => s.setMapMode);
  const clearFilters = useFilterStore((s) => s.clearFilters);

  // Derive unique teams from employees
  const teams = useMemo(() => {
    return [...new Set(employees.map((e) => e.team))]
      .filter(Boolean)
      .sort() as string[];
  }, [employees]);

  // Derive unique departments from employees
  const departments = useMemo(() => {
    return [...new Set(employees.map((e) => e.department))]
      .filter(Boolean)
      .sort() as string[];
  }, [employees]);

  return (
    <div className="filter-panel">
      {/* Color-by selector */}
      <div className="filter-group">
        <label htmlFor="color-by">Color by:</label>
        <select
          id="color-by"
          value={colorBy}
          onChange={(e) => setColorBy(e.target.value as ColorByOption)}
        >
          <option value="team">Team</option>
          <option value="department">Department</option>
          <option value="assignedOffice">Assigned Office</option>
        </select>
      </div>

      {/* Team filter */}
      <div className="filter-group">
        <label htmlFor="team-filter">Team:</label>
        <select
          id="team-filter"
          value={teamFilter ?? ''}
          onChange={(e) => setTeamFilter(e.target.value || null)}
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      {/* Department filter */}
      <div className="filter-group">
        <label htmlFor="dept-filter">Department:</label>
        <select
          id="dept-filter"
          value={departmentFilter ?? ''}
          onChange={(e) => setDepartmentFilter(e.target.value || null)}
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Office filter */}
      <div className="filter-group">
        <label htmlFor="office-filter">Office:</label>
        <select
          id="office-filter"
          value={officeFilter ?? ''}
          onChange={(e) => setOfficeFilter(e.target.value || null)}
        >
          <option value="">All Offices</option>
          {offices.map((office) => (
            <option key={office.id} value={office.name}>
              {office.name}
            </option>
          ))}
        </select>
      </div>

      {/* Clear button */}
      <button type="button" className="clear-filters-btn" onClick={clearFilters}>
        Clear Filters
      </button>

      {/* Map Settings */}
      <div className="map-mode-toggle">
        <label>
          <input
            type="checkbox"
            checked={mapMode === 'grayscale'}
            onChange={(e) =>
              setMapMode(e.target.checked ? 'grayscale' : 'normal')
            }
          />
          B&W map mode
        </label>
      </div>
    </div>
  );
}
