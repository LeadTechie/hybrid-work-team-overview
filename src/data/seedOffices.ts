import { v4 as uuidv4 } from 'uuid';
import type { Office } from '../types/office';

/**
 * Generate 5 German office locations with pre-geocoded coordinates.
 * These are major German cities with significant tech presence.
 */
export function generateSeedOffices(): Office[] {
  return [
    {
      id: uuidv4(),
      name: 'Frankfurt HQ',
      address: 'Neue Mainzer Str. 52-58, 60311 Frankfurt am Main',
      city: 'Frankfurt am Main',
      coords: { lat: 50.1109, lon: 8.6821 },
      geocodeStatus: 'success',
    },
    {
      id: uuidv4(),
      name: 'Berlin Office',
      address: 'Unter den Linden 21, 10117 Berlin',
      city: 'Berlin',
      coords: { lat: 52.52, lon: 13.405 },
      geocodeStatus: 'success',
    },
    {
      id: uuidv4(),
      name: 'Munich Office',
      address: 'Maximilianstraße 35, 80539 München',
      city: 'München',
      coords: { lat: 48.1351, lon: 11.582 },
      geocodeStatus: 'success',
    },
    {
      id: uuidv4(),
      name: 'Hamburg Office',
      address: 'Jungfernstieg 7, 20354 Hamburg',
      city: 'Hamburg',
      coords: { lat: 53.5511, lon: 9.9937 },
      geocodeStatus: 'success',
    },
    {
      id: uuidv4(),
      name: 'Düsseldorf Office',
      address: 'Königsallee 60, 40212 Düsseldorf',
      city: 'Düsseldorf',
      coords: { lat: 51.2277, lon: 6.7735 },
      geocodeStatus: 'success',
    },
  ];
}
