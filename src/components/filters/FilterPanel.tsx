import { useMemo, useState } from 'react';
import { useEmployeeStore } from '../../stores/employeeStore';
import { useOfficeStore } from '../../stores/officeStore';
import { useFilterStore, type ColorByOption } from '../../stores/filterStore';
import { CircuityInfoModal } from '../CircuityInfoModal';

/**
 * Filter panel with dropdowns for team, department, office filtering
 * and color-by selection.
 */
export function FilterPanel() {
  const employees = useEmployeeStore((s) => s.employees);
  const offices = useOfficeStore((s) => s.offices);
  const [showCircuityInfo, setShowCircuityInfo] = useState(false);

  const teamFilter = useFilterStore((s) => s.teamFilter);
  const departmentFilter = useFilterStore((s) => s.departmentFilter);
  const officeFilter = useFilterStore((s) => s.officeFilter);
  const colorBy = useFilterStore((s) => s.colorBy);

  const setTeamFilter = useFilterStore((s) => s.setTeamFilter);
  const setDepartmentFilter = useFilterStore((s) => s.setDepartmentFilter);
  const setOfficeFilter = useFilterStore((s) => s.setOfficeFilter);
  const mapMode = useFilterStore((s) => s.mapMode);
  const setColorBy = useFilterStore((s) => s.setColorBy);
  const setMapMode = useFilterStore((s) => s.setMapMode);
  const clearFilters = useFilterStore((s) => s.clearFilters);

  // Derive unique teams from employees
  const teams = useMemo(() => {
    return [...new Set(employees.map((e) => e.team))]
      .filter(Boolean)
      .sort() as string[];
  }, [employees]);

  // Derive unique departments from employees
  const departments = useMemo(() => {
    return [...new Set(employees.map((e) => e.department))]
      .filter(Boolean)
      .sort() as string[];
  }, [employees]);

  return (
    <div className="filter-panel">
      {/* Color-by selector */}
      <div className="filter-group">
        <label htmlFor="color-by">Color by:</label>
        <select
          id="color-by"
          value={colorBy}
          onChange={(e) => setColorBy(e.target.value as ColorByOption)}
        >
          <option value="team">Team</option>
          <option value="department">Department</option>
          <option value="assignedOffice">Assigned Office</option>
        </select>
      </div>

      {/* Team filter */}
      <div className="filter-group">
        <label htmlFor="team-filter">Team:</label>
        <select
          id="team-filter"
          value={teamFilter ?? ''}
          onChange={(e) => setTeamFilter(e.target.value || null)}
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      {/* Department filter */}
      <div className="filter-group">
        <label htmlFor="dept-filter">Department:</label>
        <select
          id="dept-filter"
          value={departmentFilter ?? ''}
          onChange={(e) => setDepartmentFilter(e.target.value || null)}
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Office filter */}
      <div className="filter-group">
        <label htmlFor="office-filter">Office:</label>
        <select
          id="office-filter"
          value={officeFilter ?? ''}
          onChange={(e) => setOfficeFilter(e.target.value || null)}
        >
          <option value="">All Offices</option>
          {offices.map((office) => (
            <option key={office.id} value={office.name}>
              {office.name}
            </option>
          ))}
        </select>
      </div>

      {/* Clear button */}
      <button type="button" className="clear-filters-btn" onClick={clearFilters}>
        Clear Filters
      </button>

      {/* Map Settings */}
      <div className="map-mode-toggle">
        <label>
          <input
            type="checkbox"
            checked={mapMode === 'grayscale'}
            onChange={(e) =>
              setMapMode(e.target.checked ? 'grayscale' : 'normal')
            }
          />
          B&W map mode
        </label>
      </div>
      <div className="map-mode-toggle">
        <label>
          <input
            type="checkbox"
            checked={useFilterStore((s) => s.disableClustering)}
            onChange={(e) =>
              useFilterStore.getState().setDisableClustering(e.target.checked)
            }
          />
          Don't group people
        </label>
      </div>
      <div className="map-mode-toggle">
        <label>
          <input
            type="checkbox"
            checked={useFilterStore((s) => s.useRoadDistance)}
            onChange={(e) =>
              useFilterStore.getState().setUseRoadDistance(e.target.checked)
            }
          />
          Est. road distances
        </label>
        <button
          type="button"
          onClick={() => setShowCircuityInfo(true)}
          style={{
            background: 'none',
            border: '1px solid #d1d5db',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '12px',
            cursor: 'pointer',
            color: '#6b7280',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '6px',
            padding: 0,
            lineHeight: 1,
            flexShrink: 0,
          }}
          title="How road distance estimation works"
          aria-label="How road distance estimation works"
        >
          ?
        </button>
      </div>
      {showCircuityInfo && (
        <CircuityInfoModal onClose={() => setShowCircuityInfo(false)} />
      )}
    </div>
  );
}
