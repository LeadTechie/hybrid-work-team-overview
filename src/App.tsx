import { useEffect } from 'react'
import './App.css'
import { useOfficeStore } from './stores/officeStore'
import { useEmployeeStore } from './stores/employeeStore'
import { generateSeedOffices } from './data/seedOffices'
import { generateSeedEmployees } from './data/seedEmployees'

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
    <div>
      <h1>Hybrid Office Finder</h1>
      <p>{offices.length} offices, {employees.length} employees loaded</p>
    </div>
  )
}

export default App
