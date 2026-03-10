import { useMemo, useRef, useEffect, useState } from 'react';
import { useFilterStore } from '../../stores/filterStore';
import { useEmployeeStore } from '../../stores/employeeStore';
import { colorService } from '../../services/colorService';

/**
 * Legend component showing color meanings for the current colorBy mode.
 * Derives legend items dynamically from ALL employees (not filtered).
 * Uses checkboxes for multi-select filtering with tri-state header.
 * Positioned in the bottom-right corner of the map.
 */
export function MapLegend() {
  const [isMinimized, setIsMinimized] = useState(false);
  const colorBy = useFilterStore((s) => s.colorBy);
  const teamFilters = useFilterStore((s) => s.teamFilters);
  const departmentFilters = useFilterStore((s) => s.departmentFilters);
  const officeFilters = useFilterStore((s) => s.officeFilters);
  const toggleTeamFilter = useFilterStore((s) => s.toggleTeamFilter);
  const toggleDepartmentFilter = useFilterStore((s) => s.toggleDepartmentFilter);
  const toggleOfficeFilter = useFilterStore((s) => s.toggleOfficeFilter);
  const setTeamFilters = useFilterStore((s) => s.setTeamFilters);
  const setDepartmentFilters = useFilterStore((s) => s.setDepartmentFilters);
  const setOfficeFilters = useFilterStore((s) => s.setOfficeFilters);

  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  // Get ALL employees for deriving legend items (not filtered)
  const employees = useEmployeeStore((s) => s.employees);

  // Derive legend items from actual employee data
  const legendItems = useMemo(() => {
    let values: string[];
    switch (colorBy) {
      case 'team':
        values = [...new Set(employees.map((e) => e.team))].filter((v): v is string => Boolean(v)).sort();
        break;
      case 'department':
        values = [...new Set(employees.map((e) => e.department))].filter((v): v is string => Boolean(v)).sort();
        break;
      case 'assignedOffice':
        values = [...new Set(employees.map((e) => e.assignedOffice))].filter((v): v is string => Boolean(v)).sort();
        break;
      default:
        values = [];
    }
    return values.map((value) => ({
      label: value,
      color: colorService.getColor(colorBy, value),
    }));
  }, [employees, colorBy]);

  // Get current filter set and setters based on colorBy
  const { activeFilters, toggleFilter, setFilters, title } = useMemo(() => {
    switch (colorBy) {
      case 'team':
        return {
          activeFilters: teamFilters,
          toggleFilter: toggleTeamFilter,
          setFilters: setTeamFilters,
          title: 'Teams',
        };
      case 'department':
        return {
          activeFilters: departmentFilters,
          toggleFilter: toggleDepartmentFilter,
          setFilters: setDepartmentFilters,
          title: 'Departments',
        };
      case 'assignedOffice':
        return {
          activeFilters: officeFilters,
          toggleFilter: toggleOfficeFilter,
          setFilters: setOfficeFilters,
          title: 'Offices',
        };
      default:
        return {
          activeFilters: teamFilters,
          toggleFilter: toggleTeamFilter,
          setFilters: setTeamFilters,
          title: 'Teams',
        };
    }
  }, [colorBy, teamFilters, departmentFilters, officeFilters, toggleTeamFilter, toggleDepartmentFilter, toggleOfficeFilter, setTeamFilters, setDepartmentFilters, setOfficeFilters]);

  const allLabels = legendItems.map((item) => item.label);
  const selectedCount = activeFilters.size;
  const totalCount = allLabels.length;

  // Tri-state: none selected, some selected (indeterminate), all selected
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  // Update indeterminate state on the checkbox
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const handleHeaderClick = () => {
    // If none or some selected -> select all
    // If all selected -> select none
    if (isAllSelected) {
      setFilters(new Set<string>());
    } else {
      setFilters(new Set(allLabels));
    }
  };

  const handleItemClick = (label: string) => {
    toggleFilter(label);
  };

  if (isMinimized) {
    return (
      <div className="map-legend map-legend-minimized">
        <button
          className="map-legend-toggle-btn"
          onClick={() => setIsMinimized(false)}
          title="Show legend"
        >
          <span className="map-legend-toggle-icon">&#9654;</span>
          <span className="map-legend-title">{title}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="map-legend">
      <div className="map-legend-header">
        <label className="map-legend-checkbox-label">
          <input
            ref={headerCheckboxRef}
            type="checkbox"
            checked={isAllSelected}
            onChange={handleHeaderClick}
            className="map-legend-checkbox"
          />
          <span className="map-legend-title">{title}</span>
        </label>
        <button
          className="map-legend-toggle-btn map-legend-minimize-btn"
          onClick={() => setIsMinimized(true)}
          title="Minimize legend"
        >
          &#9660;
        </button>
      </div>
      <div className="map-legend-items">
        {legendItems.map(({ label, color }) => {
          const isChecked = activeFilters.has(label);
          return (
            <label
              key={label}
              className="map-legend-item map-legend-checkbox-label"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleItemClick(label)}
                className="map-legend-checkbox"
              />
              <span
                className="map-legend-color"
                style={{ backgroundColor: color }}
              />
              <span className="map-legend-label">{label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
