import { create } from 'zustand';

export type ColorByOption = 'team' | 'department' | 'assignedOffice';
export type MapMode = 'normal' | 'grayscale';

export type MapZoomMode = 'zoomIn' | 'zoomOut';

interface FilterState {
  // Multi-select filters: empty set = show all, non-empty = show only selected
  teamFilters: Set<string>;
  departmentFilters: Set<string>;
  officeFilters: Set<string>;
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

  // Toggle individual item in filter set
  toggleTeamFilter: (team: string) => void;
  toggleDepartmentFilter: (dept: string) => void;
  toggleOfficeFilter: (office: string) => void;
  // Set all items at once (for select all / clear all)
  setTeamFilters: (teams: Set<string>) => void;
  setDepartmentFilters: (depts: Set<string>) => void;
  setOfficeFilters: (offices: Set<string>) => void;
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

export const useFilterStore = create<FilterState>((set, get) => ({
  teamFilters: new Set<string>(),
  departmentFilters: new Set<string>(),
  officeFilters: new Set<string>(),
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

  toggleTeamFilter: (team) => {
    const current = get().teamFilters;
    const next = new Set(current);
    if (next.has(team)) {
      next.delete(team);
    } else {
      next.add(team);
    }
    set({ teamFilters: next });
  },
  toggleDepartmentFilter: (dept) => {
    const current = get().departmentFilters;
    const next = new Set(current);
    if (next.has(dept)) {
      next.delete(dept);
    } else {
      next.add(dept);
    }
    set({ departmentFilters: next });
  },
  toggleOfficeFilter: (office) => {
    const current = get().officeFilters;
    const next = new Set(current);
    if (next.has(office)) {
      next.delete(office);
    } else {
      next.add(office);
    }
    set({ officeFilters: next });
  },
  setTeamFilters: (teams) => set({ teamFilters: teams }),
  setDepartmentFilters: (depts) => set({ departmentFilters: depts }),
  setOfficeFilters: (offices) => set({ officeFilters: offices }),
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
      teamFilters: new Set<string>(),
      departmentFilters: new Set<string>(),
      officeFilters: new Set<string>(),
      searchQuery: '',
      selectedEmployeeId: null,
      mapZoomMode: null,
      distanceMin: 0,
      distanceMax: Infinity,
      distanceReference: 'nearest',
      // Note: colorBy, mapMode, and useRoadDistance are intentionally NOT reset (visual preferences, not filters)
    }),
}));
