import { useEmployeeStore } from '../stores/employeeStore';
import { useOfficeStore } from '../stores/officeStore';
import { useFilterStore } from '../stores/filterStore';

const buttonStyle = {
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
};

export function ClearDataButton() {
  const clearEmployees = useEmployeeStore((state) => state.clearEmployees);
  const clearOffices = useOfficeStore((state) => state.clearOffices);
  const clearFilters = useFilterStore((state) => state.clearFilters);

  const handleClearPeople = () => {
    if (window.confirm('Are you sure you want to delete all people? This cannot be undone.')) {
      clearEmployees();
      clearFilters();
      useEmployeeStore.getState().setInitialized(true);
    }
  };

  const handleClearOffices = () => {
    if (window.confirm('Are you sure you want to delete all offices? This cannot be undone.')) {
      clearOffices();
      useOfficeStore.getState().setInitialized(true);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={handleClearPeople}
        style={buttonStyle}
        title="Delete all people from your browser"
      >
        <span aria-hidden="true">&#128100;</span>
        <span>Clear People</span>
      </button>
      <button
        onClick={handleClearOffices}
        style={buttonStyle}
        title="Delete all offices from your browser"
      >
        <span aria-hidden="true">&#127970;</span>
        <span>Clear Offices</span>
      </button>
    </div>
  );
}
