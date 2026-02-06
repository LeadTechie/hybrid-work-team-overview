import { useOfficeStore } from '../stores/officeStore';
import { useEmployeeStore } from '../stores/employeeStore';

const styles = {
  container: {
    backgroundColor: '#f8f9fa',
    padding: '16px 20px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  stats: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '24px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: '#333',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  geocodeStats: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
    justifyContent: 'center',
    fontSize: '13px',
    color: '#666',
  },
  geocodePending: {
    color: '#f59e0b',
  },
  geocodeSuccess: {
    color: '#10b981',
  },
  geocodeFailed: {
    color: '#ef4444',
  },
  clearButton: {
    marginTop: '12px',
    padding: '8px 16px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#666',
    transition: 'background-color 0.2s, border-color 0.2s',
  },
};

export function DataSummary() {
  const { offices, clearOffices } = useOfficeStore();
  const { employees, clearEmployees } = useEmployeeStore();

  // Calculate geocode status breakdown
  const officeGeocodeStats = {
    pending: offices.filter(o => o.geocodeStatus === 'pending').length,
    success: offices.filter(o => o.geocodeStatus === 'success').length,
    failed: offices.filter(o => o.geocodeStatus === 'failed').length,
  };

  const employeeGeocodeStats = {
    pending: employees.filter(e => e.geocodeStatus === 'pending').length,
    success: employees.filter(e => e.geocodeStatus === 'success').length,
    failed: employees.filter(e => e.geocodeStatus === 'failed').length,
  };

  const totalPending = officeGeocodeStats.pending + employeeGeocodeStats.pending;
  const totalFailed = officeGeocodeStats.failed + employeeGeocodeStats.failed;

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearOffices();
      clearEmployees();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.stats}>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{offices.length}</span>
          <span style={styles.statLabel}>Offices</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{employees.length}</span>
          <span style={styles.statLabel}>Employees</span>
        </div>
      </div>

      {(totalPending > 0 || totalFailed > 0) && (
        <div style={styles.geocodeStats}>
          {totalPending > 0 && (
            <span style={styles.geocodePending}>
              {totalPending} pending geocode
            </span>
          )}
          {totalFailed > 0 && (
            <span style={styles.geocodeFailed}>
              {totalFailed} failed geocode
            </span>
          )}
        </div>
      )}

      {(offices.length > 0 || employees.length > 0) && (
        <div style={{ textAlign: 'center' as const }}>
          <button
            style={styles.clearButton}
            onClick={handleClearAll}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fee2e2';
              e.currentTarget.style.borderColor = '#ef4444';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.borderColor = '#ddd';
              e.currentTarget.style.color = '#666';
            }}
          >
            Clear All Data
          </button>
        </div>
      )}
    </div>
  );
}
