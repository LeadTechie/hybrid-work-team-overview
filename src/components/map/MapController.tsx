import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import type { Employee } from '../../types/employee';
import type { Office } from '../../types/office';

interface MapControllerProps {
  selectedEmployee: Employee | null;
  offices: Office[];
}

/**
 * Controller component that handles programmatic map navigation.
 * When an employee is selected, zooms out to fit the employee and all
 * offices in view so distance lines are fully visible.
 */
export function MapController({ selectedEmployee, offices }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedEmployee?.coords) {
      // Build bounds containing the employee and all offices
      const points: L.LatLngExpression[] = [
        [selectedEmployee.coords.lat, selectedEmployee.coords.lon],
      ];

      for (const office of offices) {
        if (office.coords) {
          points.push([office.coords.lat, office.coords.lon]);
        }
      }

      if (points.length > 1) {
        const bounds = L.latLngBounds(points);
        map.flyToBounds(bounds, {
          padding: [50, 50],
          maxZoom: 10,
          duration: 1.5,
        });
      } else {
        // Fallback: only the employee, no offices with coords
        map.flyTo(
          [selectedEmployee.coords.lat, selectedEmployee.coords.lon],
          10,
          { duration: 1.5 }
        );
      }
    }
  }, [selectedEmployee, offices, map]);

  // Controller component - no visual output
  return null;
}
