import { readFile } from 'fs/promises';
import { join } from 'path';
import type { EnrichedPoint, EnrichedSoilData, SoilDataQuery } from '../types/index.js';

// Caminho padrão para o arquivo JSON (pode ser configurado via env)
const DEFAULT_DATA_PATH = join(process.cwd(), '../ladingpage-soildata/src/data/enriched-soil-data.json');

let cachedData: EnrichedSoilData | null = null;
let lastLoadTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

async function loadSoilData(): Promise<EnrichedSoilData> {
  const now = Date.now();
  
  // Retornar cache se ainda válido
  if (cachedData && (now - lastLoadTime) < CACHE_TTL) {
    return cachedData;
  }

  const dataPath = process.env.SOIL_DATA_PATH || DEFAULT_DATA_PATH;
  
  try {
    const data = await readFile(dataPath, 'utf-8');
    const parsedData: EnrichedSoilData = JSON.parse(data);
    
    cachedData = parsedData;
    lastLoadTime = now;
    
    return parsedData;
  } catch (error) {
    throw new Error(`Failed to load soil data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getSoilData(query?: SoilDataQuery): Promise<{
  total: number;
  returned: number;
  data: EnrichedPoint[];
}> {
  const soilData = await loadSoilData();
  let filteredPoints = soilData.points;

  // Aplicar filtros
  if (query) {
    if (query.state) {
      const stateLower = query.state.toLowerCase();
      filteredPoints = filteredPoints.filter(
        point => point.st?.toLowerCase() === stateLower
      );
    }

    if (query.municipality) {
      const municipalityLower = query.municipality.toLowerCase();
      filteredPoints = filteredPoints.filter(
        point => point.mu?.toLowerCase().includes(municipalityLower)
      );
    }

    if (query.biome) {
      const biomeLower = query.biome.toLowerCase();
      filteredPoints = filteredPoints.filter(
        point => point.bi?.toLowerCase() === biomeLower
      );
    }

    if (query.datasetCode) {
      filteredPoints = filteredPoints.filter(
        point => point.dc === query.datasetCode
      );
    }
  }

  // Aplicar paginação
  const offset = query?.offset || 0;
  const limit = query?.limit;
  const start = offset;
  const end = limit ? start + limit : filteredPoints.length;
  const paginatedData = filteredPoints.slice(start, end);

  return {
    total: filteredPoints.length,
    returned: paginatedData.length,
    data: paginatedData,
  };
}

export async function getSoilDataSummary(): Promise<{
  total: number;
  states: number;
  municipalities: number;
  biomes: number;
  datasets: number;
  availableFilters: {
    states: string[];
    biomes: string[];
    datasetCodes: string[];
  };
}> {
  const soilData = await loadSoilData();
  const points = soilData.points;

  const states = new Set(points.map(p => p.st).filter(Boolean)) as Set<string>;
  const municipalities = new Set(points.map(p => p.mu).filter(Boolean)) as Set<string>;
  const biomes = new Set(points.map(p => p.bi).filter(Boolean)) as Set<string>;
  const datasets = new Set(points.map(p => p.dc));

  return {
    total: points.length,
    states: states.size,
    municipalities: municipalities.size,
    biomes: biomes.size,
    datasets: datasets.size,
    availableFilters: {
      states: Array.from(states).sort(),
      biomes: Array.from(biomes).sort(),
      datasetCodes: Array.from(datasets).sort(),
    },
  };
}

export async function getSoilDataStats(): Promise<{
  total: number;
  byState: Array<{ state: string; count: number }>;
  byBiome: Array<{ biome: string; count: number }>;
  byDataset: Array<{ dataset: string; count: number }>;
}> {
  const soilData = await loadSoilData();
  const points = soilData.points;

  // Contagem por estado
  const byState: Record<string, number> = {};
  points.forEach(point => {
    if (point.st) {
      byState[point.st] = (byState[point.st] || 0) + 1;
    }
  });

  // Contagem por bioma
  const byBiome: Record<string, number> = {};
  points.forEach(point => {
    if (point.bi) {
      byBiome[point.bi] = (byBiome[point.bi] || 0) + 1;
    }
  });

  // Contagem por dataset
  const byDataset: Record<string, number> = {};
  points.forEach(point => {
    byDataset[point.dc] = (byDataset[point.dc] || 0) + 1;
  });

  return {
    total: points.length,
    byState: Object.entries(byState)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count),
    byBiome: Object.entries(byBiome)
      .map(([biome, count]) => ({ biome, count }))
      .sort((a, b) => b.count - a.count),
    byDataset: Object.entries(byDataset)
      .map(([dataset, count]) => ({ dataset, count }))
      .sort((a, b) => b.count - a.count),
  };
}

export async function getSoilDataMetadata() {
  const soilData = await loadSoilData();
  return soilData.metadata;
}

