import { v4 as uuidv4 } from 'uuid';
import type { Office } from '../types/office';

/**
 * Generate 5 German office locations with pre-geocoded coordinates.
 * These are major German cities with significant tech presence.
 * Uses postcode-based format with pre-defined coordinates.
 */
export function generateSeedOffices(): Office[] {
  return [
    {
      id: uuidv4(),
      name: 'Frankfurt HQ',
      postcode: '60311',
      street: 'Neue Mainzer Str. 52-58',
      city: 'Frankfurt am Main',
      coords: { lat: 50.1109, lon: 8.6821 },
      geocodeStatus: 'success',
    },
    {
      id: uuidv4(),
      name: 'Berlin Office',
      postcode: '10117',
      street: 'Unter den Linden 21',
      city: 'Berlin',
      coords: { lat: 52.52, lon: 13.405 },
      geocodeStatus: 'success',
    },
    {
      id: uuidv4(),
      name: 'Munich Office',
      postcode: '80539',
      street: 'Maximilianstrasse 35',
      city: 'Muenchen',
      coords: { lat: 48.1351, lon: 11.582 },
      geocodeStatus: 'success',
    },
    {
      id: uuidv4(),
      name: 'Hamburg Office',
      postcode: '20354',
      street: 'Jungfernstieg 7',
      city: 'Hamburg',
      coords: { lat: 53.5511, lon: 9.9937 },
      geocodeStatus: 'success',
    },
    {
      id: uuidv4(),
      name: 'Duesseldorf Office',
      postcode: '40212',
      street: 'Koenigsallee 60',
      city: 'Duesseldorf',
      coords: { lat: 51.2277, lon: 6.7735 },
      geocodeStatus: 'success',
    },
  ];
}
