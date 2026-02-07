interface CircuityInfoModalProps {
  onClose: () => void;
}

/**
 * Info modal explaining how circuity factor distance estimation works.
 * Follows the modal pattern from AccurateGeocodingModal (fixed overlay, accessible, click-outside-close).
 */
export function CircuityInfoModal({ onClose }: CircuityInfoModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="circuity-modal-title"
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="circuity-modal-title"
          style={{ margin: '0 0 16px', fontSize: '20px' }}
        >
          How Distance Estimation Works
        </h2>

        <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#333' }}>
          As the Crow Flies
        </h3>
        <p style={{ margin: '0 0 16px', fontSize: '14px', lineHeight: 1.6, color: '#555' }}>
          By default, distances show the straight-line (haversine) distance between the
          employee's postcode centroid and the office. This is the shortest possible
          distance — as a bird would fly.
        </p>

        <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#333' }}>
          Estimated Road Distance
        </h3>
        <p style={{ margin: '0 0 8px', fontSize: '14px', lineHeight: 1.6, color: '#555' }}>
          When enabled, distances are multiplied by a circuity factor — an
          empirically-measured ratio of actual road distance to straight-line distance.
          This accounts for the fact that roads don't go in straight lines.
        </p>
        <ul style={{ margin: '0 0 16px', paddingLeft: '20px', fontSize: '14px', lineHeight: 1.8, color: '#555' }}>
          <li>
            <strong>Short distances (&lt;20 km):</strong> factor 1.4 (urban streets, many turns)
          </li>
          <li>
            <strong>Medium distances (20-100 km):</strong> factor 1.35 (mixed regional roads)
          </li>
          <li>
            <strong>Long distances (&gt;100 km):</strong> factor 1.25 (mostly Autobahn, more direct)
          </li>
        </ul>

        <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#333' }}>
          Accuracy
        </h3>
        <p style={{ margin: '0 0 4px', fontSize: '14px', lineHeight: 1.6, color: '#555' }}>
          Road estimates are typically within 10-15% of actual driving distances for trips
          over 20 km.
        </p>
        <p style={{ margin: '0 0 4px', fontSize: '14px', lineHeight: 1.6, color: '#555' }}>
          For shorter urban trips, accuracy is lower due to complex street networks.
        </p>
        <p style={{ margin: '0 0 16px', fontSize: '14px', lineHeight: 1.6, color: '#555' }}>
          All estimated distances show a ~ prefix (e.g. ~70 km) to indicate they are
          approximations.
        </p>

        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
          }}
        >
          <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '14px' }}>
            Example: An employee 50 km straight-line from an office
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: 1.8 }}>
            <li>Straight-line: 50.0 km</li>
            <li>Road estimate: ~70 km (50 x 1.35 factor)</li>
            <li>Actual driving (Google Maps): typically 60-75 km</li>
          </ul>
        </div>

        <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#999' }}>
          Based on European circuity research (Mennicken, Lemoy &amp; Caruso 2024; average 1.343)
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: '#4a90d9',
              color: 'white',
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
