interface ImportProgressProps {
  current: number;
  total: number;
  currentAddress: string;
  status: 'processing' | 'success' | 'failed';
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    marginTop: '16px',
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: 600,
  },
  progressWrapper: {
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    height: '24px',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4a90d9',
    transition: 'width 0.3s ease-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold' as const,
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#666',
  },
  currentAddress: {
    marginTop: '8px',
    fontSize: '13px',
    color: '#888',
    fontStyle: 'italic' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  statusIcon: {
    marginRight: '6px',
  },
};

export function ImportProgress({ current, total, currentAddress, status }: ImportProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const statusEmoji = status === 'processing' ? '' : status === 'success' ? '' : '';

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Geocoding Addresses</h3>

      <div style={styles.progressWrapper}>
        <div
          style={{
            ...styles.progressBar,
            width: `${percentage}%`,
          }}
        >
          {percentage > 10 ? `${percentage}%` : ''}
        </div>
      </div>

      <div style={styles.stats}>
        <span>
          <span style={styles.statusIcon}>{statusEmoji}</span>
          {current} of {total} addresses
        </span>
        <span>{percentage}% complete</span>
      </div>

      {currentAddress && (
        <div style={styles.currentAddress}>
          {status === 'processing' ? 'Processing: ' : status === 'success' ? 'Completed: ' : 'Failed: '}
          {currentAddress}
        </div>
      )}
    </div>
  );
}
