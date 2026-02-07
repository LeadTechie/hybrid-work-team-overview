export interface Employee {
  id: string;
  name: string;
  postcode: string; // Required for local geocoding (5-digit German)
  street?: string; // Optional, for display and accurate mode
  city?: string; // Auto-filled from postcode lookup or CSV
  team: string;
  department?: string;
  role?: string;
  assignedOffice?: string;
  coords?: { lat: number; lon: number };
  geocodeAccuracy: 'postcode-centroid' | 'address';
  geocodeStatus: 'pending' | 'success' | 'failed';
}
