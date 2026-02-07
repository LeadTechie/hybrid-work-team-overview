import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

import { MapContainer, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useOfficeStore } from '../../stores/officeStore';
import { useFilterStore } from '../../stores/filterStore';
import { useFilteredEmployees } from '../../hooks/useFilteredEmployees';
import { OfficeMarker } from './OfficeMarker';
import { EmployeeMarker } from './EmployeeMarker';
import { MapController } from './MapController';
import { MapLegend } from './MapLegend';
import { DistanceLines } from './DistanceLines';

// Germany geographic center
const GERMANY_CENTER: [number, number] = [51.1657, 10.4515];
const INITIAL_ZOOM = 6;

export function MapView() {
  const { offices } = useOfficeStore();
  const { colorBy, selectedEmployeeId, mapMode, disableClustering } = useFilterStore();

  // Get filtered employees (already filtered for geocode success)
  const filteredEmployees = useFilteredEmployees();

  // Find the selected employee for MapController (from filtered list)
  const selectedEmployee = selectedEmployeeId
    ? filteredEmployees.find((e) => e.id === selectedEmployeeId) ?? null
    : null;

  // Offices with valid coordinates
  const geocodedOffices = offices.filter(
    (o) => o.geocodeStatus === 'success' && o.coords
  );

  const tileClassName = mapMode === 'grayscale' ? 'map-tiles-grayscale' : '';

  return (
    <MapContainer
      center={GERMANY_CENTER}
      zoom={INITIAL_ZOOM}
      minZoom={5}
      maxZoom={18}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        key={tileClassName}
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        className={tileClassName}
      />

      <MapController selectedEmployee={selectedEmployee} offices={geocodedOffices} />

      {/* Distance lines from selected employee to all offices */}
      {selectedEmployee && selectedEmployee.coords && (
        <DistanceLines employee={selectedEmployee} offices={geocodedOffices} />
      )}

      {/* Office markers - not clustered, always visible */}
      {geocodedOffices.map((office) => (
        <OfficeMarker key={office.id} office={office} />
      ))}

      {/* Employee markers - clustered or individual based on setting */}
      {disableClustering ? (
        filteredEmployees.map((employee) => (
          <EmployeeMarker
            key={employee.id}
            employee={employee}
            colorBy={colorBy}
            isHighlighted={employee.id === selectedEmployeeId}
          />
        ))
      ) : (
        <MarkerClusterGroup chunkedLoading>
          {filteredEmployees.map((employee) => (
            <EmployeeMarker
              key={employee.id}
              employee={employee}
              colorBy={colorBy}
              isHighlighted={employee.id === selectedEmployeeId}
            />
          ))}
        </MarkerClusterGroup>
      )}

      {/* Legend showing color meanings */}
      <MapLegend />
    </MapContainer>
  );
}
