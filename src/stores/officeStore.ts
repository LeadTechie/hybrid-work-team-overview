import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Office } from '../types/office';
import { encryptedStorage } from '../services/encryptedStorage';

interface OfficeState {
  offices: Office[];
  isInitialized: boolean;
  setOffices: (offices: Office[]) => void;
  addOffices: (offices: Office[]) => void;
  clearOffices: () => void;
  updateGeocode: (
    id: string,
    coords: { lat: number; lon: number } | undefined,
    status: 'pending' | 'success' | 'failed'
  ) => void;
  setInitialized: (value: boolean) => void;
}

export const useOfficeStore = create<OfficeState>()(
  persist(
    (set) => ({
      offices: [],
      isInitialized: false,

      setOffices: (offices) => set({ offices }),

      addOffices: (newOffices) =>
        set((state) => {
          // Merge by id - new entries override existing ones with same id
          const existingIds = new Set(state.offices.map((o) => o.id));
          const uniqueNew = newOffices.filter((o) => !existingIds.has(o.id));
          return { offices: [...state.offices, ...uniqueNew] };
        }),

      clearOffices: () => set({ offices: [], isInitialized: false }),

      updateGeocode: (id, coords, status) =>
        set((state) => ({
          offices: state.offices.map((office) =>
            office.id === id
              ? { ...office, coords, geocodeStatus: status }
              : office
          ),
        })),

      setInitialized: (value) => set({ isInitialized: value }),
    }),
    {
      name: 'office-storage',
      storage: encryptedStorage,
    }
  )
);
