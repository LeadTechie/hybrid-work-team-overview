import { useFilterStore } from '../../stores/filterStore';
import {
  TEAM_COLORS,
  DEPARTMENT_COLORS,
  OFFICE_COLORS,
} from '../../utils/markerColors';

/**
 * Legend component showing color meanings for the current colorBy mode.
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

  let colorMap: Record<string, string>;
  let title: string;
  let activeFilter: string | null;

  switch (colorBy) {
    case 'team':
      colorMap = TEAM_COLORS;
      title = 'Teams';
      activeFilter = teamFilter;
      break;
    case 'department':
      colorMap = DEPARTMENT_COLORS;
      title = 'Departments';
      activeFilter = departmentFilter;
      break;
    case 'assignedOffice':
      colorMap = OFFICE_COLORS;
      title = 'Offices';
      activeFilter = officeFilter;
      break;
    default:
      colorMap = TEAM_COLORS;
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

  // Get entries, excluding 'default'
  const entries = Object.entries(colorMap).filter(([key]) => key !== 'default');

  return (
    <div className="map-legend">
      <div className="map-legend-title">{title}</div>
      <div className="map-legend-items">
        {entries.map(([label, color]) => {
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
