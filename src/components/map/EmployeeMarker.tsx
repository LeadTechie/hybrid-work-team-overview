import { memo, useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import type { Employee } from '../../types/employee';
import { useFilterStore, type ColorByOption } from '../../stores/filterStore';
import { useOfficeStore } from '../../stores/officeStore';
import { getColorForEmployee } from '../../utils/markerColors';
import { createEmployeeIcon } from '../../utils/markerIcons';
import { buildGoogleMapsDirectionsUrl } from '../../utils/googleMapsUrl';

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

  // Find assigned office for Google Maps link
  const assignedOffice = useMemo(() => {
    if (!employee.assignedOffice) return null;
    return offices.find((o) => o.name === employee.assignedOffice) ?? null;
  }, [employee.assignedOffice, offices]);

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
          {employee.assignedOffice && (
            <>
              <br />
              Office: {employee.assignedOffice}
            </>
          )}
          {assignedOffice?.coords && employee.coords && (
            <div style={{ marginTop: '6px' }}>
              <a
                href={buildGoogleMapsDirectionsUrl(
                  employee.coords,
                  assignedOffice.coords
                )}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontSize: '12px',
                }}
              >
                Navigate to {employee.assignedOffice}
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
