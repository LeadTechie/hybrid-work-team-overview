import { useEffect, useState } from 'react';
import './App.css';
import { useOfficeStore } from './stores/officeStore';
import { useEmployeeStore } from './stores/employeeStore';
import { generateSeedOffices } from './data/seedOffices';
import { generateSeedEmployees } from './data/seedEmployees';
import { MapView } from './components/map/MapView';
import { FilterPanel } from './components/filters/FilterPanel';
import { EmployeeSearch } from './components/filters/EmployeeSearch';
import { DataSummary } from './components/DataSummary';
import { ViewTabs } from './components/ViewTabs';
import { OfficesTable } from './components/tables/OfficesTable';
import { EmployeesTable } from './components/tables/EmployeesTable';
import { PrivacyBadge } from './components/PrivacyBadge';
import { ClearDataButton } from './components/ClearDataButton';
import { ReloadTestDataButton } from './components/ReloadTestDataButton';
import { AccurateGeocodingButton } from './components/AccurateGeocodingButton';
import { ImportPanel } from './components/import/ImportPanel';

type ViewTab = 'map' | 'offices' | 'employees';
type ImportModalTab = 'offices' | 'employees' | null;

function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('map');
  const [importModal, setImportModal] = useState<ImportModalTab>(null);

  const {
    offices,
    isInitialized: officesInitialized,
    setOffices,
    setInitialized: setOfficesInitialized,
  } = useOfficeStore();
  const {
    employees,
    isInitialized: employeesInitialized,
    setEmployees,
    setInitialized: setEmployeesInitialized,
  } = useEmployeeStore();

  useEffect(() => {
    // Load seed data on first visit (when stores are empty and not initialized)
    if (!officesInitialized && offices.length === 0) {
      const seedOffices = generateSeedOffices();
      setOffices(seedOffices);
      setOfficesInitialized(true);
      console.log('Seed offices loaded:', seedOffices);
    }

    if (!employeesInitialized && employees.length === 0) {
      const seedEmployees = generateSeedEmployees();
      setEmployees(seedEmployees);
      setEmployeesInitialized(true);
      console.log('Seed employees loaded:', seedEmployees);
    }
  }, [
    officesInitialized,
    employeesInitialized,
    offices.length,
    employees.length,
    setOffices,
    setOfficesInitialized,
    setEmployees,
    setEmployeesInitialized,
  ]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Hybrid Office Finder</h1>
        <ViewTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </header>
      <div className="app-content">
        <aside className="sidebar">
          <EmployeeSearch />
          <FilterPanel />
          <DataSummary />
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px' }}>
            <PrivacyBadge />
            <AccurateGeocodingButton />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setImportModal('employees')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e3f2fd',
                  color: '#1565c0',
                  border: '1px solid #90caf9',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Load People
              </button>
              <button
                onClick={() => setImportModal('offices')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e8f5e9',
                  color: '#2e7d32',
                  border: '1px solid #a5d6a7',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Load Offices
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <ClearDataButton />
              <ReloadTestDataButton />
            </div>
          </div>
        </aside>
        <main className={activeTab === 'map' ? 'map-container' : 'table-container'}>
          {activeTab === 'map' && <MapView />}
          {activeTab === 'offices' && <OfficesTable />}
          {activeTab === 'employees' && <EmployeesTable />}
        </main>
      </div>

      {/* Import modal overlay */}
      {importModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setImportModal(null);
          }}
        >
          <div style={{ width: '600px', maxHeight: '80vh', overflow: 'auto', background: '#fff', borderRadius: '12px' }}>
            <ImportPanel
              initialTab={importModal}
              onClose={() => setImportModal(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
