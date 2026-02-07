import * as L from 'leaflet';

/**
 * Creates a colored pin marker icon for employees.
 * Uses inline SVG for dynamic color without image loading.
 *
 * @param color - Fill color for the marker (hex or CSS color)
 * @param isHighlighted - Whether to show larger highlighted state
 */
export function createEmployeeIcon(
  color: string,
  isHighlighted = false
): L.DivIcon {
  const size = isHighlighted ? 42 : 32;
  const strokeWidth = isHighlighted ? 3 : 2;

  return L.divIcon({
    className: isHighlighted ? 'employee-marker-selected' : 'employee-marker',
    html: `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          fill="${color}"
          stroke="#fff"
          stroke-width="${strokeWidth}"
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
        />
      </svg>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size], // Bottom center
    popupAnchor: [0, -size], // Above the marker
  });
}

/**
 * Creates a building icon for office locations.
 * Uses a distinct visual style to differentiate from employee markers.
 */
export function createOfficeIcon(): L.DivIcon {
  const size = 32;

  return L.divIcon({
    className: 'office-marker',
    html: `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="6" width="18" height="15" fill="#1a365d" stroke="#fff" stroke-width="2" rx="2"/>
        <rect x="7" y="10" width="3" height="3" fill="#fff"/>
        <rect x="14" y="10" width="3" height="3" fill="#fff"/>
        <rect x="7" y="15" width="3" height="3" fill="#fff"/>
        <rect x="14" y="15" width="3" height="3" fill="#fff"/>
        <rect x="10" y="3" width="4" height="3" fill="#1a365d" stroke="#fff" stroke-width="1"/>
      </svg>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size], // Bottom center
    popupAnchor: [0, -size], // Above the marker
  });
}
