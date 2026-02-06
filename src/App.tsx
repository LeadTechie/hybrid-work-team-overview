import { useEffect } from 'react'
import './App.css'
import { useOfficeStore } from './stores/officeStore'
import { useEmployeeStore } from './stores/employeeStore'
import { generateSeedOffices } from './data/seedOffices'
import { generateSeedEmployees } from './data/seedEmployees'
import { DataSummary } from './components/DataSummary'
import { ImportPanel } from './components/import/ImportPanel'

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    textAlign: 'left' as const,
  },
  title: {
    textAlign: 'center' as const,
    marginBottom: '24px',
  },
}

function App() {
  const { offices, isInitialized: officesInitialized, setOffices, setInitialized: setOfficesInitialized } = useOfficeStore()
  const { employees, isInitialized: employeesInitialized, setEmployees, setInitialized: setEmployeesInitialized } = useEmployeeStore()

  useEffect(() => {
    // Load seed data on first visit (when stores are empty and not initialized)
    if (!officesInitialized && offices.length === 0) {
      const seedOffices = generateSeedOffices()
      setOffices(seedOffices)
      setOfficesInitialized(true)
      console.log('Seed offices loaded:', seedOffices)
    }

    if (!employeesInitialized && employees.length === 0) {
      const seedEmployees = generateSeedEmployees()
      setEmployees(seedEmployees)
      setEmployeesInitialized(true)
      console.log('Seed employees loaded:', seedEmployees)
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
  ])

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Hybrid Office Finder</h1>
      <DataSummary />
      <ImportPanel />
    </div>
  )
}

export default App
