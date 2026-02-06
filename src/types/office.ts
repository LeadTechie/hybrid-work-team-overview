export interface Office {
  id: string;
  name: string;
  address: string;
  city: string;
  coords?: { lat: number; lon: number };
  geocodeStatus: 'pending' | 'success' | 'failed';
}
