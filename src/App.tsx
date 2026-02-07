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

type ViewTab = 'map' | 'offices' | 'employees';

function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('map');

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
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <ReloadTestDataButton />
              <ClearDataButton />
            </div>
          </div>
        </aside>
        <main className={activeTab === 'map' ? 'map-container' : 'table-container'}>
          {activeTab === 'map' && <MapView />}
          {activeTab === 'offices' && <OfficesTable />}
          {activeTab === 'employees' && <EmployeesTable />}
        </main>
      </div>
    </div>
  );
}

export default App;
