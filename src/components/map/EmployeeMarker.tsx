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
  const useRoadDistance = useFilterStore((s) => s.useRoadDistance);

  const color = getColorForEmployee(employee, colorBy);

  // Memoize icon creation - only recreate when color or highlight state changes
  const icon = useMemo(
    () => createEmployeeIcon(color, isHighlighted),
    [color, isHighlighted]
  );

  // Calculate distances to all offices, sorted nearest first
  const officeDistances = useMemo(() => {
    if (!employee.coords) return [];
    const geocodedOffices = offices.filter(
      (o) => o.geocodeStatus === 'success' && o.coords
    );
    return geocodedOffices
      .map((office) => ({
        office,
        distance: calculateDistance(
          employee.coords!.lat,
          employee.coords!.lon,
          office.coords!.lat,
          office.coords!.lon
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [employee.coords, offices]);

  const closestOffice = officeDistances.length > 0 ? officeDistances[0] : null;

  return (
    <Marker
      position={[employee.coords.lat, employee.coords.lon]}
      icon={icon}
      eventHandlers={{
        click: () => {
          const store = useFilterStore.getState();
          const isDeselecting = store.selectedEmployeeId === employee.id;
          store.setSelectedEmployeeId(isDeselecting ? null : employee.id);
          store.setMapZoomMode(isDeselecting ? null : 'zoomIn');
        },
      }}
    >
      <Popup>
        <div style={{ minWidth: '180px' }}>
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
              <span style={{ color: '#6b7280', fontSize: '12px' }}>
                Assigned: {employee.assignedOffice}
              </span>
            </>
          )}

          {/* Distance to each office */}
          {officeDistances.length > 0 && (
            <div style={{ marginTop: '8px', borderTop: '1px solid #e5e7eb', paddingTop: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                {useRoadDistance ? 'Est. road distances:' : 'Distances to offices:'}
              </div>
              {officeDistances.map(({ office, distance }) => (
                <div key={office.id} style={{ fontSize: '12px', color: '#4b5563', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span>{office.name}</span>
                  <span style={{ fontWeight: office === closestOffice?.office ? 600 : 400, color: office === closestOffice?.office ? '#2563eb' : undefined }}>
                    {formatDistance(distance, useRoadDistance)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ marginTop: '8px', borderTop: '1px solid #e5e7eb', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {closestOffice?.office.coords && employee.coords && (
              <a
                href={buildGoogleMapsDirectionsUrl(
                  employee.coords,
                  closestOffice.office.coords
                )}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '12px' }}
              >
                Navigate to {closestOffice.office.name}
              </a>
            )}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                const store = useFilterStore.getState();
                store.setMapZoomMode('zoomOut');
              }}
              style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '12px' }}
            >
              Zoom out to all offices
            </a>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Wrap with React.memo to prevent unnecessary re-renders
export const EmployeeMarker = memo(EmployeeMarkerComponent);
