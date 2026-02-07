import { create } from 'zustand';

export type ColorByOption = 'team' | 'department' | 'assignedOffice';
export type MapMode = 'normal' | 'grayscale';

interface FilterState {
  teamFilter: string | null;
  departmentFilter: string | null;
  officeFilter: string | null;
  searchQuery: string;
  colorBy: ColorByOption;
  mapMode: MapMode;
  selectedEmployeeId: string | null;

  setTeamFilter: (team: string | null) => void;
  setDepartmentFilter: (dept: string | null) => void;
  setOfficeFilter: (office: string | null) => void;
  setSearchQuery: (query: string) => void;
  setColorBy: (colorBy: ColorByOption) => void;
  setMapMode: (mode: MapMode) => void;
  setSelectedEmployeeId: (id: string | null) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  teamFilter: null,
  departmentFilter: null,
  officeFilter: null,
  searchQuery: '',
  colorBy: 'team',
  mapMode: 'normal',
  selectedEmployeeId: null,

  setTeamFilter: (team) => set({ teamFilter: team }),
  setDepartmentFilter: (dept) => set({ departmentFilter: dept }),
  setOfficeFilter: (office) => set({ officeFilter: office }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setColorBy: (colorBy) => set({ colorBy }),
  setMapMode: (mode) => set({ mapMode: mode }),
  setSelectedEmployeeId: (id) => set({ selectedEmployeeId: id }),
  clearFilters: () =>
    set({
      teamFilter: null,
      departmentFilter: null,
      officeFilter: null,
      searchQuery: '',
      selectedEmployeeId: null,
      // Note: colorBy and mapMode are intentionally NOT reset (visual preferences, not filters)
    }),
}));
