import { useFilterStore } from '../../stores/filterStore';
import {
  TEAM_COLORS,
  DEPARTMENT_COLORS,
  OFFICE_COLORS,
} from '../../utils/markerColors';

/**
 * Legend component showing color meanings for the current colorBy mode.
 * Positioned in the bottom-right corner of the map.
 */
export function MapLegend() {
  const colorBy = useFilterStore((s) => s.colorBy);

  // Select the appropriate color map based on colorBy
  let colorMap: Record<string, string>;
  let title: string;

  switch (colorBy) {
    case 'team':
      colorMap = TEAM_COLORS;
      title = 'Teams';
      break;
    case 'department':
      colorMap = DEPARTMENT_COLORS;
      title = 'Departments';
      break;
    case 'assignedOffice':
      colorMap = OFFICE_COLORS;
      title = 'Offices';
      break;
    default:
      colorMap = TEAM_COLORS;
      title = 'Teams';
  }

  // Get entries, excluding 'default'
  const entries = Object.entries(colorMap).filter(([key]) => key !== 'default');

  return (
    <div className="map-legend">
      <div className="map-legend-title">{title}</div>
      <div className="map-legend-items">
        {entries.map(([label, color]) => (
          <div key={label} className="map-legend-item">
            <span
              className="map-legend-color"
              style={{ backgroundColor: color }}
            />
            <span className="map-legend-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
