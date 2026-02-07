import { useEmployeeStore } from '../stores/employeeStore';
import { useOfficeStore } from '../stores/officeStore';

export function ClearDataButton() {
  const clearEmployees = useEmployeeStore((state) => state.clearEmployees);
  const clearOffices = useOfficeStore((state) => state.clearOffices);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to delete all data? This cannot be undone.')) {
      // Clear Zustand stores
      clearEmployees();
      clearOffices();

      // Clear all localStorage
      localStorage.clear();

      // Clear sessionStorage (API key if any)
      sessionStorage.clear();

      // Clear all cookies
      document.cookie.split(';').forEach((cookie) => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });

      // Clear caches if available
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }

      // Force reload to reset app state
      window.location.reload();
    }
  };

  return (
    <button
      onClick={handleClear}
      style={{
        padding: '8px 16px',
        backgroundColor: '#ffebee',
        color: '#c62828',
        border: '1px solid #ef9a9a',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
      title="Delete all stored data from your browser"
    >
      <span aria-hidden="true">&#128465;</span>
      <span>Clear All Data</span>
    </button>
  );
}
