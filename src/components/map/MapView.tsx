import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

import { MapContainer, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useOfficeStore } from '../../stores/officeStore';
import { useEmployeeStore } from '../../stores/employeeStore';
import { useFilterStore } from '../../stores/filterStore';
import { OfficeMarker } from './OfficeMarker';
import { EmployeeMarker } from './EmployeeMarker';
import { MapController } from './MapController';

// Germany geographic center
const GERMANY_CENTER: [number, number] = [51.1657, 10.4515];
const INITIAL_ZOOM = 6;

export function MapView() {
  const { offices } = useOfficeStore();
  const { employees } = useEmployeeStore();
  const { colorBy, selectedEmployeeId } = useFilterStore();

  // Find the selected employee for MapController
  const selectedEmployee = selectedEmployeeId
    ? employees.find((e) => e.id === selectedEmployeeId) ?? null
    : null;

  // Filter to only employees with valid coordinates
  // (Plan 03 will wire in useFilteredEmployees hook for full filtering)
  const geocodedEmployees = employees.filter(
    (e) => e.geocodeStatus === 'success' && e.coords
  );

  // Offices with valid coordinates
  const geocodedOffices = offices.filter(
    (o) => o.geocodeStatus === 'success' && o.coords
  );

  return (
    <MapContainer
      center={GERMANY_CENTER}
      zoom={INITIAL_ZOOM}
      minZoom={5}
      maxZoom={18}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <MapController selectedEmployee={selectedEmployee} />

      {/* Office markers - not clustered, always visible */}
      {geocodedOffices.map((office) => (
        <OfficeMarker key={office.id} office={office} />
      ))}

      {/* Employee markers - clustered for performance */}
      <MarkerClusterGroup chunkedLoading>
        {geocodedEmployees.map((employee) => (
          <EmployeeMarker
            key={employee.id}
            employee={employee}
            colorBy={colorBy}
            isHighlighted={employee.id === selectedEmployeeId}
          />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
