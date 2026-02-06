import { create } from 'zustand';

export type ColorByOption = 'team' | 'department' | 'assignedOffice';

interface FilterState {
  teamFilter: string | null;
  departmentFilter: string | null;
  officeFilter: string | null;
  searchQuery: string;
  colorBy: ColorByOption;
  selectedEmployeeId: string | null;

  setTeamFilter: (team: string | null) => void;
  setDepartmentFilter: (dept: string | null) => void;
  setOfficeFilter: (office: string | null) => void;
  setSearchQuery: (query: string) => void;
  setColorBy: (colorBy: ColorByOption) => void;
  setSelectedEmployeeId: (id: string | null) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  teamFilter: null,
  departmentFilter: null,
  officeFilter: null,
  searchQuery: '',
  colorBy: 'team',
  selectedEmployeeId: null,

  setTeamFilter: (team) => set({ teamFilter: team }),
  setDepartmentFilter: (dept) => set({ departmentFilter: dept }),
  setOfficeFilter: (office) => set({ officeFilter: office }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setColorBy: (colorBy) => set({ colorBy }),
  setSelectedEmployeeId: (id) => set({ selectedEmployeeId: id }),
  clearFilters: () =>
    set({
      teamFilter: null,
      departmentFilter: null,
      officeFilter: null,
      searchQuery: '',
      selectedEmployeeId: null,
      // Note: colorBy is intentionally NOT reset
    }),
}));
