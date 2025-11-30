import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// @ts-ignore - Turf.js has export issues, using any type
import { point as turfPoint } from '@turf/helpers';
// @ts-ignore - Turf.js has export issues, using any type
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getStatesGeoJSONPath = (): string => {
  if (process.env.STATES_GEOJSON_PATH) {
    return process.env.STATES_GEOJSON_PATH.startsWith('/')
      ? process.env.STATES_GEOJSON_PATH
      : path.resolve(process.cwd(), process.env.STATES_GEOJSON_PATH);
  }
  
  // Lista de caminhos possíveis para tentar
  const possiblePaths = [
    // Caminho relativo ao arquivo compilado (desenvolvimento)
    path.resolve(__dirname, '../../../ladingpage-soildata/src/features/platform/data/geojson/brazil-states.json'),
    // Caminho relativo ao cwd (produção)
    path.resolve(process.cwd(), '../ladingpage-soildata/src/features/platform/data/geojson/brazil-states.json'),
    // Caminho absoluto comum em produção
    '/var/www/soildata/ladingpage-soildata/src/features/platform/data/geojson/brazil-states.json',
  ];
  
  // Tenta encontrar o primeiro arquivo que existe
  const fs = require('fs');
  for (const possiblePath of possiblePaths) {
    try {
      if (fs.existsSync(possiblePath)) {
        return possiblePath;
      }
    } catch {
      // Continua tentando
    }
  }
  
  // Se nenhum existir, retorna o primeiro (será tratado no erro)
  return possiblePaths[0];
};


interface StateFeature {
  type: string;
  properties: {
    name?: string;
    Name?: string;
    NOME?: string;
    Estado?: string;
    SIGLA?: string;
    sigla?: string;
    PK_sigla?: string;
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
    const dataPath = getStatesGeoJSONPath();
    const data = readFileSync(dataPath, 'utf-8');
    const parsed = JSON.parse(data) as StateGeoJSON;
    statesData = parsed;
    console.log(`[State Classifier] GeoJSON carregado de: ${dataPath}`);
    console.log(`[State Classifier] Total de features: ${parsed.features?.length || 0}`);
    return parsed;
  } catch (error) {
    console.error('[State Classifier] Failed to load Brazil states GeoJSON:', error);
    console.error(`[State Classifier] Tentou carregar de: ${getStatesGeoJSONPath()}`);
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

export function getStateNameFromSigla(sigla: string): string | null {
  const states = loadStatesData();
  const siglaUpper = sigla.toUpperCase();
  
  if (!states) {
    console.error('[State Classifier] GeoJSON de estados não foi carregado');
    return null;
  }
  
  if (!states.features || states.features.length === 0) {
    console.error('[State Classifier] Nenhuma feature encontrada no GeoJSON');
    return null;
  }
  
  if (states?.features) {
    for (const feature of states.features) {
      const featureSigla = feature.properties?.SIGLA || feature.properties?.sigla || feature.properties?.PK_sigla;
      if (featureSigla?.toUpperCase() === siglaUpper) {
        const stateName = feature.properties?.Estado || feature.properties?.NOME || feature.properties?.name || feature.properties?.Name;
        if (stateName) {
          return stateName;
        }
      }
    }
  }
  
  const totalFeatures = states?.features?.length || 0;
  console.warn(`[State Classifier] Sigla "${sigla}" não encontrada. Total de features: ${totalFeatures}`);
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

export function getStateSiglaFromName(stateName: string): string | null {
  const states = loadStatesData();
  const stateNameLower = stateName.toLowerCase();
  
  if (states?.features) {
    for (const feature of states.features) {
      const featureStateName = feature.properties?.Estado || feature.properties?.NOME || feature.properties?.name || feature.properties?.Name;
      if (featureStateName?.toLowerCase() === stateNameLower) {
        return feature.properties?.SIGLA || feature.properties?.sigla || null;
      }
    }
  }
  
  return null;
}

