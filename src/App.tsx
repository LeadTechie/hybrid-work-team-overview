import './App.css'
import { useOfficeStore } from './stores/officeStore'
import { useEmployeeStore } from './stores/employeeStore'

function App() {
  const { offices } = useOfficeStore()
  const { employees } = useEmployeeStore()

  console.log('Offices:', offices)
  console.log('Employees:', employees)

  return (
    <div>
      <h1>Hybrid Office Finder</h1>
      <p>{offices.length} offices, {employees.length} employees loaded</p>
    </div>
  )
}

export default App
