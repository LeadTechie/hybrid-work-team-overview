import { memo, useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import type { Employee } from '../../types/employee';
import type { ColorByOption } from '../../stores/filterStore';
import { getColorForEmployee } from '../../utils/markerColors';
import { createEmployeeIcon } from '../../utils/markerIcons';

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

  const color = getColorForEmployee(employee, colorBy);

  // Memoize icon creation - only recreate when color or highlight state changes
  const icon = useMemo(
    () => createEmployeeIcon(color, isHighlighted),
    [color, isHighlighted]
  );

  return (
    <Marker
      position={[employee.coords.lat, employee.coords.lon]}
      icon={icon}
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
        </div>
      </Popup>
    </Marker>
  );
}

// Wrap with React.memo to prevent unnecessary re-renders
export const EmployeeMarker = memo(EmployeeMarkerComponent);
