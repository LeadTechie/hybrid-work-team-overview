import { useState, useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useEmployeeStore } from '../../stores/employeeStore';
import { useFilterStore } from '../../stores/filterStore';
import type { Employee } from '../../types/employee';

/**
 * Search input with debounced filtering and autocomplete suggestions.
 */
export function EmployeeSearch() {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const employees = useEmployeeStore((s) => s.employees);
  const setSearchQuery = useFilterStore((s) => s.setSearchQuery);
  const setSelectedEmployeeId = useFilterStore((s) => s.setSelectedEmployeeId);

  // Debounced search to avoid filtering on every keystroke
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value);
  }, 250);

  // Generate suggestions based on input value
  const suggestions = useMemo(() => {
    if (inputValue.length < 2) {
      return [];
    }
    const query = inputValue.toLowerCase();
    return employees
      .filter((e) => e.name.toLowerCase().includes(query))
      .slice(0, 5);
  }, [inputValue, employees]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
    setShowSuggestions(true);
  };

  const handleSelect = (employee: Employee) => {
    setInputValue(employee.name);
    setSearchQuery(employee.name);
    setSelectedEmployeeId(employee.id);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setInputValue('');
    setSearchQuery('');
    setSelectedEmployeeId(null);
    setShowSuggestions(false);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow click on suggestion to register
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  return (
    <div className="employee-search" style={{ position: 'relative' }}>
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="Search employee by name..."
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={handleBlur}
          aria-label="Search employees"
          className="search-input"
        />
        {inputValue && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            aria-label="Clear search"
          >
            x
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="search-suggestions">
          {suggestions.map((employee) => (
            <li key={employee.id}>
              <button
                type="button"
                className="suggestion-btn"
                onMouseDown={() => handleSelect(employee)}
              >
                <span className="suggestion-name">{employee.name}</span>
                <span className="suggestion-team">{employee.team}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
