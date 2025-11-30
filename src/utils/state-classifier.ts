import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// @ts-ignore - Turf.js has export issues, using any type
import { point as turfPoint } from '@turf/helpers';
// @ts-ignore - Turf.js has export issues, using any type
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATES_GEOJSON_PATH = path.resolve(__dirname, '../../../ladingpage-soildata/src/features/platform/data/geojson/brazil-states.json');

interface StateFeature {
  type: string;
  properties: {
    name?: string;
    Name?: string;
    NOME?: string;
    Estado?: string;
    SIGLA?: string;
    sigla?: string;
  };
  geometry: {
    type: string;
    coordinates: any;
  };
}

interface StateGeoJSON {
  type: string;
  features: StateFeature[];
}

let statesData: StateGeoJSON | null = null;

function loadStatesData(): StateGeoJSON | null {
  if (statesData) {
    return statesData;
  }
  try {
    const data = readFileSync(STATES_GEOJSON_PATH, 'utf-8');
    statesData = JSON.parse(data);
    return statesData;
  } catch (error) {
    console.error('Failed to load Brazil states GeoJSON:', error);
    return null;
  }
}

export function getStateFromCoordinates(lon: number, lat: number): string | null {
  const point = turfPoint([lon, lat]);
  const states = loadStatesData();

  if (states?.features) {
    for (const feature of states.features) {
      if (feature.geometry && booleanPointInPolygon(point, feature as any)) {
        return feature.properties?.Estado || feature.properties?.NOME || feature.properties?.name || feature.properties?.Name || null;
      }
    }
  }
  return null;
}

export function getAvailableStates(): string[] {
  const states = loadStatesData();
  const stateNames = new Set<string>();
  
  if (states?.features) {
    for (const feature of states.features) {
      const stateName = feature.properties?.Estado || feature.properties?.NOME || feature.properties?.name || feature.properties?.Name;
      if (stateName) {
        stateNames.add(stateName);
      }
    }
  }
  
  return Array.from(stateNames).sort();
}

