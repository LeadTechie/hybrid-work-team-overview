export interface Employee {
  id: string;
  name: string;
  address: string;
  team: string;
  department?: string;
  role?: string;
  assignedOffice?: string;
  coords?: { lat: number; lon: number };
  geocodeStatus: 'pending' | 'success' | 'failed';
}
