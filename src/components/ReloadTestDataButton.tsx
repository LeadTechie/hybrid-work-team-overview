import { useEmployeeStore } from '../stores/employeeStore';
import { useOfficeStore } from '../stores/officeStore';
import { generateSeedOffices } from '../data/seedOffices';
import { generateSeedEmployees } from '../data/seedEmployees';

export function ReloadTestDataButton() {
  const { setOffices, setInitialized: setOfficesInitialized } = useOfficeStore();
  const { setEmployees, setInitialized: setEmployeesInitialized } = useEmployeeStore();

  const handleReload = () => {
    // Generate fresh seed data
    const seedOffices = generateSeedOffices();
    const seedEmployees = generateSeedEmployees();

    // Replace current data with seed data
    setOffices(seedOffices);
    setOfficesInitialized(true);
    setEmployees(seedEmployees);
    setEmployeesInitialized(true);

    console.log('Test data reloaded:', { offices: seedOffices.length, employees: seedEmployees.length });
  };

  return (
    <button
      onClick={handleReload}
      style={{
        padding: '8px 16px',
        backgroundColor: '#e3f2fd',
        color: '#1565c0',
        border: '1px solid #90caf9',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
      title="Replace current data with standard test dataset"
    >
      <span aria-hidden="true">&#128260;</span>
      <span>Reload Test Data</span>
    </button>
  );
}
