import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Employee } from '../types/employee';
import { encryptedStorage } from '../services/encryptedStorage';

interface EmployeeState {
  employees: Employee[];
  isInitialized: boolean;
  setEmployees: (employees: Employee[]) => void;
  addEmployees: (employees: Employee[]) => void;
  clearEmployees: () => void;
  updateGeocode: (
    id: string,
    coords: { lat: number; lon: number } | undefined,
    status: 'pending' | 'success' | 'failed'
  ) => void;
  setInitialized: (value: boolean) => void;
}

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set) => ({
      employees: [],
      isInitialized: false,

      setEmployees: (employees) => set({ employees }),

      addEmployees: (newEmployees) =>
        set((state) => {
          // Merge by id - new entries override existing ones with same id
          const existingIds = new Set(state.employees.map((e) => e.id));
          const uniqueNew = newEmployees.filter((e) => !existingIds.has(e.id));
          return { employees: [...state.employees, ...uniqueNew] };
        }),

      clearEmployees: () => set({ employees: [], isInitialized: false }),

      updateGeocode: (id, coords, status) =>
        set((state) => ({
          employees: state.employees.map((employee) =>
            employee.id === id
              ? { ...employee, coords, geocodeStatus: status }
              : employee
          ),
        })),

      setInitialized: (value) => set({ isInitialized: value }),
    }),
    {
      name: 'employee-storage',
      storage: encryptedStorage,
    }
  )
);
