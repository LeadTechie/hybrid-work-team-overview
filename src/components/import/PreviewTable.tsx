interface InvalidRow {
  row: number;
  data: Record<string, unknown>;
  errors: string[];
}

interface PreviewTableProps {
  valid: Array<Record<string, unknown>>;
  invalid: InvalidRow[];
}

const styles = {
  container: {
    marginTop: '16px',
  },
  summary: {
    display: 'flex',
    gap: '16px',
    marginBottom: '12px',
    fontSize: '14px',
  },
  validCount: {
    color: '#2e7d32',
    fontWeight: 'bold' as const,
  },
  invalidCount: {
    color: '#c62828',
    fontWeight: 'bold' as const,
  },
  tableWrapper: {
    overflowX: 'auto' as const,
    maxHeight: '400px',
    overflowY: 'auto' as const,
    border: '1px solid #ddd',
    borderRadius: '6px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '13px',
    textAlign: 'left' as const,
  },
  th: {
    backgroundColor: '#f5f5f5',
    padding: '10px 12px',
    borderBottom: '2px solid #ddd',
    fontWeight: 600,
    position: 'sticky' as const,
    top: 0,
    zIndex: 1,
  },
  td: {
    padding: '8px 12px',
    borderBottom: '1px solid #eee',
  },
  validRow: {
    backgroundColor: 'transparent',
  },
  invalidRow: {
    backgroundColor: '#ffebee',
  },
  errorCell: {
    color: '#c62828',
    fontSize: '12px',
    maxWidth: '200px',
  },
  moreRows: {
    padding: '12px',
    textAlign: 'center' as const,
    color: '#666',
    fontStyle: 'italic' as const,
    backgroundColor: '#fafafa',
  },
  errorTooltip: {
    display: 'block',
    fontSize: '11px',
    color: '#c62828',
    marginTop: '4px',
  },
  statusColumn: {
    width: '80px',
  },
};

const PREVIEW_LIMIT = 10;

export function PreviewTable({ valid, invalid }: PreviewTableProps) {
  // Get all unique columns from both valid and invalid rows
  const allColumns = new Set<string>();

  valid.forEach(row => {
    Object.keys(row).forEach(key => {
      if (key !== 'id' && key !== 'geocodeStatus') {
        allColumns.add(key);
      }
    });
  });

  invalid.forEach(item => {
    Object.keys(item.data).forEach(key => allColumns.add(key));
  });

  const columns = Array.from(allColumns);

  // Create merged display data with status
  interface DisplayRow {
    data: Record<string, unknown>;
    isValid: boolean;
    errors?: string[];
    originalRow?: number;
  }

  const displayData: DisplayRow[] = [
    ...valid.map(row => ({ data: row, isValid: true })),
    ...invalid.map(item => ({
      data: item.data,
      isValid: false,
      errors: item.errors,
      originalRow: item.row,
    })),
  ];

  // Sort by original row number for invalid, valid items at top
  const sortedData = displayData.sort((a, b) => {
    if (a.isValid && !b.isValid) return -1;
    if (!a.isValid && b.isValid) return 1;
    if (!a.isValid && !b.isValid) {
      return (a.originalRow || 0) - (b.originalRow || 0);
    }
    return 0;
  });

  const previewData = sortedData.slice(0, PREVIEW_LIMIT);
  const remainingCount = sortedData.length - PREVIEW_LIMIT;

  const totalRows = valid.length + invalid.length;

  if (totalRows === 0) {
    return (
      <div style={styles.container}>
        <p>No data to preview</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.summary}>
        <span style={styles.validCount}>{valid.length} valid</span>
        <span style={styles.invalidCount}>{invalid.length} invalid</span>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, ...styles.statusColumn }}>Status</th>
              {columns.map(col => (
                <th key={col} style={styles.th}>
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.map((item, idx) => (
              <tr
                key={idx}
                style={item.isValid ? styles.validRow : styles.invalidRow}
              >
                <td style={styles.td}>
                  {item.isValid ? (
                    <span style={{ color: '#2e7d32' }}>Valid</span>
                  ) : (
                    <div style={styles.errorCell}>
                      <span>Invalid</span>
                      {item.errors && item.errors.map((err, i) => (
                        <span key={i} style={styles.errorTooltip}>
                          {err}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                {columns.map(col => (
                  <td key={col} style={styles.td}>
                    {String(item.data[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
            {remainingCount > 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  style={styles.moreRows}
                >
                  ...and {remainingCount} more row{remainingCount === 1 ? '' : 's'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
