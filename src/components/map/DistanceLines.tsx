import { Polyline, Tooltip } from 'react-leaflet';
import { calculateDistance, formatDistance } from '../../utils/distance';
import { useFilterStore } from '../../stores/filterStore';
import type { Employee } from '../../types/employee';
import type { Office } from '../../types/office';

interface DistanceLinesProps {
  employee: Employee;
  offices: Office[];
}

/**
 * Renders dashed polylines from a selected employee to all geocoded offices,
 * with distance labels at the midpoint of each line.
 */
export function DistanceLines({ employee, offices }: DistanceLinesProps) {
  const useRoadDistance = useFilterStore((s) => s.useRoadDistance);

  if (!employee.coords) {
    return null;
  }

  const empLat = employee.coords.lat;
  const empLon = employee.coords.lon;

  return (
    <>
      {offices.map((office) => {
        if (!office.coords) return null;

        const dist = calculateDistance(
          empLat,
          empLon,
          office.coords.lat,
          office.coords.lon
        );

        const positions: [number, number][] = [
          [empLat, empLon],
          [office.coords.lat, office.coords.lon],
        ];

        return (
          <Polyline
            key={office.id}
            positions={positions}
            pathOptions={{
              color: '#3b82f6',
              weight: 2,
              dashArray: '8 4',
              opacity: 0.8,
            }}
          >
            <Tooltip
              permanent
              direction="center"
              className="distance-tooltip"
            >
              {formatDistance(dist, useRoadDistance)} to {office.name}
            </Tooltip>
          </Polyline>
        );
      })}
    </>
  );
}
