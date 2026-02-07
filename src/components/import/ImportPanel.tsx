import { useState, useCallback } from 'react';
import { CsvUploader } from './CsvUploader';
import { PreviewTable } from './PreviewTable';
import { parseOfficeCsv, parseEmployeeCsv } from '../../services/csvService';
import { useOfficeStore } from '../../stores/officeStore';
import { useEmployeeStore } from '../../stores/employeeStore';
import type { Office } from '../../types/office';
import type { Employee } from '../../types/employee';
import { DATA_LIMITS, type CsvParseResult, type ValidationError } from '../../services/validationService';

type ImportMode = 'idle' | 'preview' | 'done';
type ImportType = 'offices' | 'employees';

interface ImportResult {
  total: number;
  geocoded: number;
  failed: number;
}

const styles = {
  container: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '20px',
    textAlign: 'left' as const,
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: 600,
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  tab: {
    padding: '10px 20px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'background-color 0.2s',
  },
  tabActive: {
    backgroundColor: '#4a90d9',
    color: 'white',
    borderColor: '#4a90d9',
  },
  buttons: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
  },
  primaryButton: {
    backgroundColor: '#4a90d9',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    border: '1px solid #ccc',
    color: '#333',
  },
  disabledButton: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  warning: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#fff3e0',
    borderRadius: '6px',
    color: '#e65100',
    fontSize: '14px',
  },
  success: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#e8f5e9',
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  successTitle: {
    margin: '0 0 8px 0',
    color: '#2e7d32',
    fontSize: '18px',
  },
  successStats: {
    color: '#666',
    fontSize: '14px',
  },
};

export function ImportPanel() {
  const [mode, setMode] = useState<ImportMode>('idle');
  const [importType, setImportType] = useState<ImportType>('offices');
  const [csvText, setCsvText] = useState('');
  const [parseResult, setParseResult] = useState<CsvParseResult<Office | Employee> | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { offices, addOffices } = useOfficeStore();
  const { employees, addEmployees } = useEmployeeStore();

  const handleCsvChange = useCallback((text: string) => {
    setCsvText(text);

    if (!text.trim()) {
      setMode('idle');
      setParseResult(null);
      return;
    }

    // Parse based on import type
    const result = importType === 'offices'
      ? parseOfficeCsv(text)
      : parseEmployeeCsv(text);

    setParseResult(result);
    setMode('preview');
  }, [importType]);

  const handleTabChange = (type: ImportType) => {
    setImportType(type);
    // Re-parse if we have CSV text
    if (csvText.trim()) {
      const result = type === 'offices'
        ? parseOfficeCsv(csvText)
        : parseEmployeeCsv(csvText);
      setParseResult(result);
    }
  };

  const handleCancel = () => {
    setCsvText('');
    setParseResult(null);
    setMode('idle');
    setImportResult(null);
    setError(null);
  };

  const handleImport = () => {
    if (!parseResult || parseResult.valid.length === 0) return;

    // Check data limits before import
    const currentCount = importType === 'offices' ? offices.length : employees.length;
    const limit = importType === 'offices' ? DATA_LIMITS.MAX_OFFICES : DATA_LIMITS.MAX_EMPLOYEES;
    const newTotal = currentCount + parseResult.valid.length;

    if (newTotal > limit) {
      setError(`Cannot import: would exceed ${limit} ${importType} limit. ` +
        `Current: ${currentCount}, Importing: ${parseResult.valid.length}`);
      return;
    }

    setError(null);

    const validItems = parseResult.valid;

    // Add items to store - geocoding already done during parsing (synchronous local geocoding)
    if (importType === 'offices') {
      addOffices(validItems as Office[]);
    } else {
      addEmployees(validItems as Employee[]);
    }

    // Count geocoded vs failed from the parsed items
    let geocodedCount = 0;
    let failedCount = 0;

    validItems.forEach((item) => {
      if (item.geocodeStatus === 'success') {
        geocodedCount++;
      } else {
        failedCount++;
      }
    });

    setImportResult({
      total: validItems.length,
      geocoded: geocodedCount,
      failed: failedCount,
    });
    setMode('done');
  };

  const handleImportMore = () => {
    handleCancel();
  };

  const renderIdle = () => (
    <>
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(importType === 'offices' ? styles.tabActive : {}),
          }}
          onClick={() => handleTabChange('offices')}
        >
          Import Offices
        </button>
        <button
          style={{
            ...styles.tab,
            ...(importType === 'employees' ? styles.tabActive : {}),
          }}
          onClick={() => handleTabChange('employees')}
        >
          Import Employees
        </button>
      </div>
      <CsvUploader
        onCsvChange={handleCsvChange}
        placeholder={
          importType === 'offices'
            ? 'name,postcode,street,city\nMain Office,10178,Alexanderplatz 1,Berlin'
            : 'name,postcode,team,street,city\nMax Mustermann,10115,Engineering,Hauptstr. 1,Berlin'
        }
      />
    </>
  );

  const renderPreview = () => {
    if (!parseResult) return null;

    const validRows = parseResult.valid.map(item => ({ ...item }) as Record<string, unknown>);
    const invalidRows: Array<{ row: number; data: Record<string, unknown>; errors: string[] }> =
      parseResult.invalid.map((item: ValidationError) => ({
        row: item.row,
        data: item.data,
        errors: item.errors,
      }));

    return (
      <>
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(importType === 'offices' ? styles.tabActive : {}),
            }}
            onClick={() => handleTabChange('offices')}
          >
            Import Offices
          </button>
          <button
            style={{
              ...styles.tab,
              ...(importType === 'employees' ? styles.tabActive : {}),
            }}
            onClick={() => handleTabChange('employees')}
          >
            Import Employees
          </button>
        </div>

        <CsvUploader
          onCsvChange={handleCsvChange}
          placeholder=""
        />

        <PreviewTable valid={validRows} invalid={invalidRows} />

        {parseResult.invalid.length > 0 && (
          <div style={styles.warning}>
            {parseResult.invalid.length} row{parseResult.invalid.length === 1 ? '' : 's'} will be skipped due to validation errors.
          </div>
        )}

        {error && (
          <div style={{ ...styles.warning, backgroundColor: '#ffebee', color: '#c62828' }}>
            {error}
          </div>
        )}

        <div style={styles.buttons}>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            style={{
              ...styles.button,
              ...styles.primaryButton,
              ...(parseResult.valid.length === 0 ? styles.disabledButton : {}),
            }}
            onClick={handleImport}
            disabled={parseResult.valid.length === 0}
          >
            Import {parseResult.valid.length} valid row{parseResult.valid.length === 1 ? '' : 's'}
          </button>
        </div>
      </>
    );
  };

  const renderDone = () => {
    if (!importResult) return null;

    return (
      <div style={styles.success}>
        <h3 style={styles.successTitle}>Import Complete</h3>
        <p style={styles.successStats}>
          Imported {importResult.total} {importType}.{' '}
          {importResult.geocoded} geocoded successfully
          {importResult.failed > 0 && `, ${importResult.failed} failed`}.
        </p>
        <div style={styles.buttons}>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={handleImportMore}
          >
            Import More
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Import Data</h2>
      {mode === 'idle' && renderIdle()}
      {mode === 'preview' && renderPreview()}
      {mode === 'done' && renderDone()}
    </div>
  );
}
