import { useMemo } from 'react';
import { useFilterStore } from '../../stores/filterStore';
import { useEmployeeStore } from '../../stores/employeeStore';
import { colorService } from '../../services/colorService';

/**
 * Legend component showing color meanings for the current colorBy mode.
 * Derives legend items dynamically from ALL employees (not filtered).
 * Clicking a legend item filters to show only that group and zooms out.
 * Positioned in the bottom-right corner of the map.
 */
export function MapLegend() {
  const colorBy = useFilterStore((s) => s.colorBy);
  const teamFilter = useFilterStore((s) => s.teamFilter);
  const departmentFilter = useFilterStore((s) => s.departmentFilter);
  const officeFilter = useFilterStore((s) => s.officeFilter);
  const setTeamFilter = useFilterStore((s) => s.setTeamFilter);
  const setDepartmentFilter = useFilterStore((s) => s.setDepartmentFilter);
  const setOfficeFilter = useFilterStore((s) => s.setOfficeFilter);

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

  let title: string;
  let activeFilter: string | null;

  switch (colorBy) {
    case 'team':
      title = 'Teams';
      activeFilter = teamFilter;
      break;
    case 'department':
      title = 'Departments';
      activeFilter = departmentFilter;
      break;
    case 'assignedOffice':
      title = 'Offices';
      activeFilter = officeFilter;
      break;
    default:
      title = 'Teams';
      activeFilter = teamFilter;
  }

  const handleLegendClick = (label: string) => {
    // Toggle: if already filtered to this, clear the filter
    const isAlreadyActive = activeFilter === label;
    const newValue = isAlreadyActive ? null : label;

    switch (colorBy) {
      case 'team':
        setTeamFilter(newValue);
        break;
      case 'department':
        setDepartmentFilter(newValue);
        break;
      case 'assignedOffice':
        setOfficeFilter(newValue);
        break;
    }
  };

  const handleTitleClick = () => {
    // Clear the filter for current colorBy mode
    switch (colorBy) {
      case 'team':
        setTeamFilter(null);
        break;
      case 'department':
        setDepartmentFilter(null);
        break;
      case 'assignedOffice':
        setOfficeFilter(null);
        break;
    }
  };

  return (
    <div className="map-legend">
      <div
        className={`map-legend-title${activeFilter ? ' map-legend-title-clickable' : ''}`}
        onClick={activeFilter ? handleTitleClick : undefined}
        title={activeFilter ? `Show all ${title.toLowerCase()}` : undefined}
      >
        {title}
      </div>
      <div className="map-legend-items">
        {legendItems.map(({ label, color }) => {
          const isActive = activeFilter === label;
          return (
            <div
              key={label}
              className={`map-legend-item map-legend-item-clickable${isActive ? ' map-legend-item-active' : ''}`}
              onClick={() => handleLegendClick(label)}
              title={isActive ? `Show all ${title.toLowerCase()}` : `Filter to ${label}`}
            >
              <span
                className="map-legend-color"
                style={{ backgroundColor: color }}
              />
              <span className="map-legend-label">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
