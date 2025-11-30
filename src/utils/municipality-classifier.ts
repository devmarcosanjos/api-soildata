import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// @ts-ignore - Turf.js has export issues, using any type
import { point as turfPoint } from '@turf/helpers';
// @ts-ignore - Turf.js has export issues, using any type
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getMunicipalitiesGeoJSONPath = (): string => {
  if (process.env.MUNICIPALITIES_GEOJSON_PATH) {
    return process.env.MUNICIPALITIES_GEOJSON_PATH.startsWith('/')
      ? process.env.MUNICIPALITIES_GEOJSON_PATH
      : path.resolve(process.cwd(), process.env.MUNICIPALITIES_GEOJSON_PATH);
  }
  
  // Lista de caminhos possíveis para tentar
  const possiblePaths = [
    // Caminho relativo ao arquivo compilado (desenvolvimento)
    path.resolve(__dirname, '../../../ladingpage-soildata/src/features/platform/data/geojson/brazil-municipalities.json'),
    // Caminho relativo ao cwd (produção)
    path.resolve(process.cwd(), '../ladingpage-soildata/src/features/platform/data/geojson/brazil-municipalities.json'),
    // Caminho absoluto comum em produção
    '/var/www/soildata/ladingpage-soildata/src/features/platform/data/geojson/brazil-municipalities.json',
  ];
  
  // Tenta encontrar o primeiro arquivo que existe
  for (const possiblePath of possiblePaths) {
    try {
      if (existsSync(possiblePath)) {
        return possiblePath;
      }
    } catch {
      // Continua tentando
    }
  }
  
  // Se nenhum existir, retorna o primeiro (será tratado no erro)
  return possiblePaths[0];
};

interface MunicipalityFeature {
  type: string;
  properties: {
    name?: string;
    Name?: string;
    NOME?: string;
    NM_MUNICIP?: string;
    NM_MUNICIPIO?: string;
    municipio?: string;
    Municipio?: string;
  };
  geometry: {
    type: string;
    coordinates: any;
  };
}

interface MunicipalityGeoJSON {
  type: string;
  features: MunicipalityFeature[];
}

let municipalitiesData: MunicipalityGeoJSON | null = null;

function loadMunicipalitiesData(): MunicipalityGeoJSON | null {
  if (municipalitiesData) {
    return municipalitiesData;
  }
  try {
    const dataPath = getMunicipalitiesGeoJSONPath();
    const data = readFileSync(dataPath, 'utf-8');
    const parsed = JSON.parse(data) as MunicipalityGeoJSON;
    municipalitiesData = parsed;
    console.log(`[Municipality Classifier] GeoJSON carregado de: ${dataPath}`);
    console.log(`[Municipality Classifier] Total de features: ${parsed.features?.length || 0}`);
    return parsed;
  } catch (error) {
    console.error('[Municipality Classifier] Failed to load Brazil municipalities GeoJSON:', error);
    console.error(`[Municipality Classifier] Tentou carregar de: ${getMunicipalitiesGeoJSONPath()}`);
    return null;
  }
}

export function getMunicipalityFromCoordinates(lon: number, lat: number): string | null {
  const point = turfPoint([lon, lat]);
  const municipalities = loadMunicipalitiesData();

  if (municipalities?.features) {
    for (const feature of municipalities.features) {
      if (feature.geometry && booleanPointInPolygon(point, feature as any)) {
        return feature.properties?.NM_MUNICIP || feature.properties?.NM_MUNICIPIO || 
               feature.properties?.NOME || feature.properties?.name || 
               feature.properties?.Name || feature.properties?.municipio || 
               feature.properties?.Municipio || null;
      }
    }
  }
  return null;
}

export function getAvailableMunicipalities(): string[] {
  const municipalities = loadMunicipalitiesData();
  const municipalityNames = new Set<string>();
  
  if (municipalities?.features) {
    for (const feature of municipalities.features) {
      const municipalityName = feature.properties?.NM_MUNICIP || feature.properties?.NM_MUNICIPIO || 
                               feature.properties?.NOME || feature.properties?.name || 
                               feature.properties?.Name || feature.properties?.municipio || 
                               feature.properties?.Municipio;
      if (municipalityName) {
        municipalityNames.add(municipalityName);
      }
    }
  }
  
  return Array.from(municipalityNames).sort();
}

