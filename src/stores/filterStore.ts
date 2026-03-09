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
  distanceMin: number;
  distanceMax: number;
  distanceReference: string; // 'nearest' or office name

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
  setDistanceMin: (value: number) => void;
  setDistanceMax: (value: number) => void;
  setDistanceReference: (ref: string) => void;
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
  distanceMin: 0,
  distanceMax: Infinity, // No upper bound by default (shows all)
  distanceReference: 'nearest',

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
  setDistanceMin: (value) => set({ distanceMin: value }),
  setDistanceMax: (value) => set({ distanceMax: value }),
  setDistanceReference: (ref) => set({ distanceReference: ref }),
  clearFilters: () =>
    set({
      teamFilter: null,
      departmentFilter: null,
      officeFilter: null,
      searchQuery: '',
      selectedEmployeeId: null,
      mapZoomMode: null,
      distanceMin: 0,
      distanceMax: Infinity,
      distanceReference: 'nearest',
      // Note: colorBy, mapMode, and useRoadDistance are intentionally NOT reset (visual preferences, not filters)
    }),
}));
