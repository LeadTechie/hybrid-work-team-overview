import { useMemo } from 'react';
import { useEmployeeStore } from '../../stores/employeeStore';
import { useOfficeStore } from '../../stores/officeStore';
import { useFilterStore } from '../../stores/filterStore';
import { calculateDistance } from '../../utils/distance';

export function DistanceSlider() {
  const employees = useEmployeeStore((s) => s.employees);
  const offices = useOfficeStore((s) => s.offices);

  const distanceMin = useFilterStore((s) => s.distanceMin);
  const distanceMax = useFilterStore((s) => s.distanceMax);
  const distanceReference = useFilterStore((s) => s.distanceReference);
  const setDistanceMin = useFilterStore((s) => s.setDistanceMin);
  const setDistanceMax = useFilterStore((s) => s.setDistanceMax);
  const setDistanceReference = useFilterStore((s) => s.setDistanceReference);

  // Calculate max distance from data for slider range
  const { sliderMax, hasData } = useMemo(() => {
    const geocodedEmployees = employees.filter(
      (e) => e.geocodeStatus === 'success' && e.coords
    );
    const geocodedOffices = offices.filter((o) => o.coords);

    if (geocodedEmployees.length === 0 || geocodedOffices.length === 0) {
      return { sliderMax: 100, hasData: false };
    }

    let maxDist = 0;
    for (const emp of geocodedEmployees) {
      if (!emp.coords) continue;

      if (distanceReference === 'nearest') {
        // Find distance to nearest office
        const nearestDist = Math.min(
          ...geocodedOffices.map((o) =>
            calculateDistance(
              emp.coords!.lat,
              emp.coords!.lon,
              o.coords!.lat,
              o.coords!.lon
            )
          )
        );
        maxDist = Math.max(maxDist, nearestDist);
      } else {
        // Find distance to specific office
        const refOffice = geocodedOffices.find(
          (o) => o.name === distanceReference
        );
        if (refOffice?.coords) {
          const dist = calculateDistance(
            emp.coords.lat,
            emp.coords.lon,
            refOffice.coords.lat,
            refOffice.coords.lon
          );
          maxDist = Math.max(maxDist, dist);
        }
      }
    }

    // Round up to nearest 10km for cleaner UI
    return { sliderMax: Math.ceil(maxDist / 10) * 10 || 100, hasData: true };
  }, [employees, offices, distanceReference]);

  // Clamp displayed values to slider range
  const displayMin = Math.min(distanceMin, sliderMax);
  const displayMax =
    distanceMax === Infinity ? sliderMax : Math.min(distanceMax, sliderMax);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), displayMax - 1);
    setDistanceMin(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), displayMin + 1);
    // If dragged to max, set to Infinity (no upper limit)
    setDistanceMax(value >= sliderMax ? Infinity : value);
  };

  if (!hasData) {
    return null; // Don't show slider if no geocoded data
  }

  return (
    <div className="distance-filter">
      <label htmlFor="distance-reference">Distance from:</label>
      <select
        id="distance-reference"
        value={distanceReference}
        onChange={(e) => setDistanceReference(e.target.value)}
      >
        <option value="nearest">Nearest office</option>
        {offices.map((office) => (
          <option key={office.id} value={office.name}>
            {office.name}
          </option>
        ))}
      </select>

      <div className="distance-slider">
        <div className="slider-track">
          <input
            type="range"
            min={0}
            max={sliderMax}
            value={displayMin}
            onChange={handleMinChange}
            className="slider-input slider-min"
            aria-label="Minimum distance"
          />
          <input
            type="range"
            min={0}
            max={sliderMax}
            value={displayMax}
            onChange={handleMaxChange}
            className="slider-input slider-max"
            aria-label="Maximum distance"
          />
        </div>
        <div className="slider-values">
          <span>{displayMin} km</span>
          <span>
            {displayMax >= sliderMax ? `${sliderMax}+ km` : `${displayMax} km`}
          </span>
        </div>
      </div>
    </div>
  );
}
