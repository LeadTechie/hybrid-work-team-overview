import { memo, useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import type { Employee } from '../../types/employee';
import { useFilterStore, type ColorByOption } from '../../stores/filterStore';
import { useOfficeStore } from '../../stores/officeStore';
import { getColorForEmployee } from '../../utils/markerColors';
import { createEmployeeIcon } from '../../utils/markerIcons';
import { buildGoogleMapsDirectionsUrl } from '../../utils/googleMapsUrl';
import { calculateDistance, formatDistance } from '../../utils/distance';

interface EmployeeMarkerProps {
  employee: Employee;
  colorBy: ColorByOption;
  isHighlighted?: boolean;
}

function EmployeeMarkerComponent({
  employee,
  colorBy,
  isHighlighted = false,
}: EmployeeMarkerProps) {
  // Only render if employee has valid coordinates
  if (!employee.coords) {
    return null;
  }

  const offices = useOfficeStore((s) => s.offices);

  const color = getColorForEmployee(employee, colorBy);

  // Memoize icon creation - only recreate when color or highlight state changes
  const icon = useMemo(
    () => createEmployeeIcon(color, isHighlighted),
    [color, isHighlighted]
  );

  // Find the closest office by straight-line distance
  const closestOffice = useMemo(() => {
    if (!employee.coords) return null;
    const geocodedOffices = offices.filter(
      (o) => o.geocodeStatus === 'success' && o.coords
    );
    if (geocodedOffices.length === 0) return null;

    let nearest = geocodedOffices[0];
    let minDist = Infinity;

    for (const office of geocodedOffices) {
      if (!office.coords) continue;
      const dist = calculateDistance(
        employee.coords.lat,
        employee.coords.lon,
        office.coords.lat,
        office.coords.lon
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = office;
      }
    }

    return { office: nearest, distance: minDist };
  }, [employee.coords, offices]);

  return (
    <Marker
      position={[employee.coords.lat, employee.coords.lon]}
      icon={icon}
      eventHandlers={{
        click: () => {
          const store = useFilterStore.getState();
          store.setSelectedEmployeeId(
            store.selectedEmployeeId === employee.id ? null : employee.id
          );
        },
      }}
    >
      <Popup>
        <div>
          <strong>{employee.name}</strong>
          <br />
          Team: {employee.team}
          {employee.department && (
            <>
              <br />
              Department: {employee.department}
            </>
          )}
          {closestOffice && (
            <>
              <br />
              Closest office: {closestOffice.office.name} (
              {formatDistance(closestOffice.distance)})
            </>
          )}
          {employee.assignedOffice &&
            closestOffice &&
            employee.assignedOffice !== closestOffice.office.name && (
              <>
                <br />
                <span style={{ color: '#6b7280', fontSize: '12px' }}>
                  Assigned: {employee.assignedOffice}
                </span>
              </>
            )}
          {closestOffice?.office.coords && employee.coords && (
            <div style={{ marginTop: '6px' }}>
              <a
                href={buildGoogleMapsDirectionsUrl(
                  employee.coords,
                  closestOffice.office.coords
                )}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontSize: '12px',
                }}
              >
                Navigate to {closestOffice.office.name}
              </a>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

// Wrap with React.memo to prevent unnecessary re-renders
export const EmployeeMarker = memo(EmployeeMarkerComponent);
