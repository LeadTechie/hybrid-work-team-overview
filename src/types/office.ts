export interface Office {
  id: string;
  name: string;
  postcode: string; // Required for local geocoding
  street?: string; // Optional, for display
  city?: string; // Auto-filled from postcode lookup or CSV
  coords?: { lat: number; lon: number };
  geocodeStatus: 'pending' | 'success' | 'failed';
}
