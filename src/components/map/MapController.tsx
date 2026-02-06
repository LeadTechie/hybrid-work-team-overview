import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { Employee } from '../../types/employee';

interface MapControllerProps {
  selectedEmployee: Employee | null;
}

/**
 * Controller component that handles programmatic map navigation.
 * Animates the map to the selected employee's location.
 */
export function MapController({ selectedEmployee }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedEmployee?.coords) {
      map.flyTo(
        [selectedEmployee.coords.lat, selectedEmployee.coords.lon],
        14, // Zoom level for focused view
        { duration: 1.5 } // Smooth animation duration in seconds
      );
    }
  }, [selectedEmployee, map]);

  // Controller component - no visual output
  return null;
}
