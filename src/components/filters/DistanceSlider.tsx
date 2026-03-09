import { useMemo } from 'react';
import { useEmployeeStore } from '../../stores/employeeStore';
import { useOfficeStore } from '../../stores/officeStore';
import { useFilterStore } from '../../stores/filterStore';
import { calculateDistance } from '../../utils/distance';
import type { Employee } from '../../types/employee';

export function DistanceSlider() {
  const employees = useEmployeeStore((s) => s.employees);
  const offices = useOfficeStore((s) => s.offices);

  const distanceMin = useFilterStore((s) => s.distanceMin);
  const distanceMax = useFilterStore((s) => s.distanceMax);
  const distanceReference = useFilterStore((s) => s.distanceReference);
  const setDistanceMin = useFilterStore((s) => s.setDistanceMin);
  const setDistanceMax = useFilterStore((s) => s.setDistanceMax);
  const setDistanceReference = useFilterStore((s) => s.setDistanceReference);

  // Get other filters (not distance) to compute counts based on current filter state
  const teamFilter = useFilterStore((s) => s.teamFilter);
  const departmentFilter = useFilterStore((s) => s.departmentFilter);
  const officeFilter = useFilterStore((s) => s.officeFilter);
  const searchQuery = useFilterStore((s) => s.searchQuery);

  // Helper to calculate distance to reference point for an employee
  const getDistanceToReference = (emp: Employee, geocodedOffices: typeof offices): number | null => {
    if (!emp.coords) return null;
    if (geocodedOffices.length === 0) return null;

    if (distanceReference === 'nearest') {
      return Math.min(
        ...geocodedOffices.map((o) =>
          calculateDistance(
            emp.coords!.lat,
            emp.coords!.lon,
            o.coords!.lat,
            o.coords!.lon
          )
        )
      );
    }

    const refOffice = geocodedOffices.find((o) => o.name === distanceReference);
    if (!refOffice?.coords) return null;
    return calculateDistance(
      emp.coords.lat,
      emp.coords.lon,
      refOffice.coords.lat,
      refOffice.coords.lon
    );
  };

  // Calculate max distance and counts based on current filters (excluding distance)
  const { sliderMax, hasData, belowCount, inRangeCount, aboveCount } = useMemo(() => {
    const geocodedOffices = offices.filter((o) => o.coords);

    // Apply all filters except distance
    const filteredEmployees = employees.filter((emp) => {
      if (emp.geocodeStatus !== 'success' || !emp.coords) return false;
      if (teamFilter && emp.team !== teamFilter) return false;
      if (departmentFilter && emp.department !== departmentFilter) return false;
      if (officeFilter && emp.assignedOffice !== officeFilter) return false;
      if (searchQuery.length > 0) {
        const query = searchQuery.toLowerCase();
        if (!emp.name.toLowerCase().includes(query)) return false;
      }
      return true;
    });

    if (filteredEmployees.length === 0 || geocodedOffices.length === 0) {
      return { sliderMax: 100, hasData: false, belowCount: 0, inRangeCount: 0, aboveCount: 0 };
    }

    // Calculate distances for all filtered employees
    let maxDist = 0;
    let below = 0;
    let inRange = 0;
    let above = 0;

    for (const emp of filteredEmployees) {
      const dist = getDistanceToReference(emp, geocodedOffices);
      if (dist === null) continue;

      maxDist = Math.max(maxDist, dist);

      // Categorize by distance range
      if (dist < distanceMin) {
        below++;
      } else if (distanceMax === Infinity || dist <= distanceMax) {
        inRange++;
      } else {
        above++;
      }
    }

    // Round up to nearest 10km for cleaner UI
    const computedMax = Math.ceil(maxDist / 10) * 10 || 100;
    return {
      sliderMax: computedMax,
      hasData: true,
      belowCount: below,
      inRangeCount: inRange,
      aboveCount: above
    };
  }, [employees, offices, distanceReference, teamFilter, departmentFilter, officeFilter, searchQuery, distanceMin, distanceMax]);

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
        <div className="slider-counts">
          {distanceMin > 0 && (
            <span className="count-below">{belowCount} closer</span>
          )}
          <span className="count-in-range">{inRangeCount} in range</span>
          {distanceMax !== Infinity && distanceMax < sliderMax && (
            <span className="count-above">{aboveCount} further</span>
          )}
        </div>
      </div>
    </div>
  );
}
