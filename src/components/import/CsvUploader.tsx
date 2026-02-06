import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface CsvUploaderProps {
  onCsvChange: (csvText: string) => void;
  placeholder?: string;
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  dropzone: {
    border: '2px dashed #ccc',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'border-color 0.2s, background-color 0.2s',
  },
  dropzoneActive: {
    borderColor: '#4a90d9',
    backgroundColor: '#f0f7ff',
  },
  dropzoneHover: {
    borderColor: '#666',
    backgroundColor: '#f9f9f9',
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontFamily: 'monospace',
    fontSize: '13px',
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
  },
  orDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#888',
    fontSize: '14px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#ddd',
  },
  clearButton: {
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  fileName: {
    marginTop: '8px',
    color: '#666',
    fontSize: '13px',
  },
};

export function CsvUploader({ onCsvChange, placeholder = 'Paste CSV data here...' }: CsvUploaderProps) {
  const [textValue, setTextValue] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileRead = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setTextValue(content);
      setFileName(file.name);
      onCsvChange(content);
    };
    reader.readAsText(file);
  }, [onCsvChange]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileRead(acceptedFiles[0]);
    }
  }, [handleFileRead]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    multiple: false,
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTextValue(value);
    setFileName(null);
    onCsvChange(value);
  };

  const handleClear = () => {
    setTextValue('');
    setFileName(null);
    onCsvChange('');
  };

  const dropzoneStyle = {
    ...styles.dropzone,
    ...(isDragActive ? styles.dropzoneActive : {}),
  };

  return (
    <div style={styles.container}>
      <div
        {...getRootProps()}
        style={dropzoneStyle}
        onMouseEnter={(e) => {
          if (!isDragActive) {
            e.currentTarget.style.borderColor = '#666';
            e.currentTarget.style.backgroundColor = '#f9f9f9';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragActive) {
            e.currentTarget.style.borderColor = '#ccc';
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the CSV file here...</p>
        ) : (
          <p>Drag & drop a CSV file here, or click to select</p>
        )}
        {fileName && <p style={styles.fileName}>File: {fileName}</p>}
      </div>

      <div style={styles.orDivider}>
        <div style={styles.dividerLine} />
        <span>or paste CSV below</span>
        <div style={styles.dividerLine} />
      </div>

      <textarea
        style={styles.textarea}
        value={textValue}
        onChange={handleTextChange}
        placeholder={placeholder}
      />

      {textValue && (
        <button
          style={styles.clearButton}
          onClick={handleClear}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e8e8e8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}
