import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import type { Employee } from '../../types/employee';
import type { Office } from '../../types/office';
import { useFilterStore } from '../../stores/filterStore';

interface MapControllerProps {
  selectedEmployee: Employee | null;
  offices: Office[];
}

/**
 * Controller component that handles programmatic map navigation.
 * Single click: zooms in to the employee (distances visible at closer range).
 * Double click: zooms out to fit the employee and all offices in view.
 */
export function MapController({ selectedEmployee, offices }: MapControllerProps) {
  const map = useMap();
  const mapZoomMode = useFilterStore((s) => s.mapZoomMode);
  const setMapZoomMode = useFilterStore((s) => s.setMapZoomMode);

  useEffect(() => {
    if (!selectedEmployee?.coords || !mapZoomMode) return;

    if (mapZoomMode === 'zoomIn') {
      // Single click: zoom in to the employee
      map.flyTo(
        [selectedEmployee.coords.lat, selectedEmployee.coords.lon],
        12,
        { duration: 1 }
      );
    } else if (mapZoomMode === 'zoomOut') {
      // Double click: zoom out to fit employee + all offices
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
        map.flyTo(
          [selectedEmployee.coords.lat, selectedEmployee.coords.lon],
          8,
          { duration: 1.5 }
        );
      }
    }

    // Clear zoom mode after applying
    setMapZoomMode(null);
  }, [selectedEmployee, mapZoomMode, offices, map, setMapZoomMode]);

  return null;
}
