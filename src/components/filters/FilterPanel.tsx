import { useState } from 'react';
import { useFilterStore, type ColorByOption } from '../../stores/filterStore';
import { CircuityInfoModal } from '../CircuityInfoModal';
import { DistanceSlider } from './DistanceSlider';

/**
 * Filter panel with color-by selection and map settings.
 * Team/department/office filtering is done via the legend checkboxes.
 */
export function FilterPanel() {
  const [showCircuityInfo, setShowCircuityInfo] = useState(false);

  const colorBy = useFilterStore((s) => s.colorBy);
  const mapMode = useFilterStore((s) => s.mapMode);
  const setColorBy = useFilterStore((s) => s.setColorBy);
  const setMapMode = useFilterStore((s) => s.setMapMode);
  const clearFilters = useFilterStore((s) => s.clearFilters);

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

      {/* Distance filter slider */}
      <DistanceSlider />

      {showCircuityInfo && (
        <CircuityInfoModal onClose={() => setShowCircuityInfo(false)} />
      )}
    </div>
  );
}
