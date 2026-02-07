import { create } from 'zustand';

export type ColorByOption = 'team' | 'department' | 'assignedOffice';
export type MapMode = 'normal' | 'grayscale';

export type MapZoomMode = 'zoomIn' | 'zoomOut';

interface FilterState {
  teamFilter: string | null;
  departmentFilter: string | null;
  officeFilter: string | null;
  searchQuery: string;
  colorBy: ColorByOption;
  mapMode: MapMode;
  selectedEmployeeId: string | null;
  mapZoomMode: MapZoomMode | null;
  disableClustering: boolean;
  useRoadDistance: boolean;

  setTeamFilter: (team: string | null) => void;
  setDepartmentFilter: (dept: string | null) => void;
  setOfficeFilter: (office: string | null) => void;
  setSearchQuery: (query: string) => void;
  setColorBy: (colorBy: ColorByOption) => void;
  setMapMode: (mode: MapMode) => void;
  setSelectedEmployeeId: (id: string | null) => void;
  setMapZoomMode: (mode: MapZoomMode | null) => void;
  setDisableClustering: (value: boolean) => void;
  setUseRoadDistance: (value: boolean) => void;
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
  mapZoomMode: null,
  disableClustering: false,
  useRoadDistance: false,

  setTeamFilter: (team) => set({ teamFilter: team }),
  setDepartmentFilter: (dept) => set({ departmentFilter: dept }),
  setOfficeFilter: (office) => set({ officeFilter: office }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setColorBy: (colorBy) => set({ colorBy }),
  setMapMode: (mode) => set({ mapMode: mode }),
  setSelectedEmployeeId: (id) => set({ selectedEmployeeId: id }),
  setMapZoomMode: (mode) => set({ mapZoomMode: mode }),
  setDisableClustering: (value) => set({ disableClustering: value }),
  setUseRoadDistance: (value) => set({ useRoadDistance: value }),
  clearFilters: () =>
    set({
      teamFilter: null,
      departmentFilter: null,
      officeFilter: null,
      searchQuery: '',
      selectedEmployeeId: null,
      mapZoomMode: null,
      // Note: colorBy, mapMode, and useRoadDistance are intentionally NOT reset (visual preferences, not filters)
    }),
}));
