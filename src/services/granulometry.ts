import { readFile } from 'fs/promises';
import { config } from '../config/index.js';
import type { GranulometryRecord, GranulometryData, GranulometryQuery, GranulometryFractionQuery } from '../types/index.js';
import { applyTextFilters, applyRangeFilters, sortRecords, validateAndSanitizeQuery } from '../utils/granulometry-filters.js';
import { fractionResultCache } from '../utils/result-cache.js';

const CACHE_TTL = 5 * 60 * 1000;

let cachedData: GranulometryData | null = null;
let lastLoadTime: number = 0;

async function loadGranulometryData(): Promise<GranulometryData> {
  const now = Date.now();
  
  if (cachedData && (now - lastLoadTime) < CACHE_TTL) {
    return cachedData;
  }

  const dataPath = config.data.granulometryDataPath;
  
  try {
    const data = await readFile(dataPath, 'utf-8');
    const parsedData: GranulometryData = JSON.parse(data);
    
    cachedData = parsedData;
    lastLoadTime = now;
    
    return parsedData;
  } catch (error) {
    throw new Error(`Failed to load granulometry data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getGranulometryData(query?: GranulometryQuery): Promise<{
  total: number;
  returned: number;
  data: GranulometryRecord[];
}> {
  const granulometryData = await loadGranulometryData();
  const sanitizedQuery = validateAndSanitizeQuery(query);
  let filteredRecords = granulometryData.data;

  if (sanitizedQuery.datasetId) {
    const indices = granulometryData.indices.byDataset[sanitizedQuery.datasetId];
    if (indices && indices.length > 0) {
      filteredRecords = indices.map(i => granulometryData.data[i]);
    } else {
      filteredRecords = [];
    }
  }

  if (sanitizedQuery.layerId !== undefined) {
    if (sanitizedQuery.datasetId) {
      filteredRecords = filteredRecords.filter(r => r.layerId === sanitizedQuery.layerId);
    } else {
      const indices = granulometryData.indices.byLayer[sanitizedQuery.layerId];
      if (indices && indices.length > 0) {
        filteredRecords = indices.map(i => granulometryData.data[i]);
      } else {
        filteredRecords = [];
      }
    }
  }

  filteredRecords = applyTextFilters(filteredRecords, granulometryData, sanitizedQuery);
  filteredRecords = applyRangeFilters(filteredRecords, sanitizedQuery);
  filteredRecords = sortRecords(
    filteredRecords,
    sanitizedQuery.sortBy,
    sanitizedQuery.sortOrder || 'asc'
  );

  const limit = sanitizedQuery.limit || 100;
  const offset = sanitizedQuery.offset || 0;
  const start = offset;
  const end = start + limit;
  const paginatedData = filteredRecords.slice(start, end);

  return {
    total: filteredRecords.length,
    returned: paginatedData.length,
    data: paginatedData,
  };
}

export async function getAllGranulometryData(query?: Omit<GranulometryQuery, 'limit' | 'offset'>): Promise<{
  total: number;
  data: GranulometryRecord[];
}> {
  const granulometryData = await loadGranulometryData();
  const sanitizedQuery = validateAndSanitizeQuery(query);
  let filteredRecords = granulometryData.data;

  if (sanitizedQuery.datasetId) {
    const indices = granulometryData.indices.byDataset[sanitizedQuery.datasetId];
    if (indices && indices.length > 0) {
      filteredRecords = indices.map(i => granulometryData.data[i]);
    } else {
      filteredRecords = [];
    }
  }

  if (sanitizedQuery.layerId !== undefined) {
    if (sanitizedQuery.datasetId) {
      filteredRecords = filteredRecords.filter(r => r.layerId === sanitizedQuery.layerId);
    } else {
      const indices = granulometryData.indices.byLayer[sanitizedQuery.layerId];
      if (indices && indices.length > 0) {
        filteredRecords = indices.map(i => granulometryData.data[i]);
      } else {
        filteredRecords = [];
      }
    }
  }

  filteredRecords = applyTextFilters(filteredRecords, granulometryData, sanitizedQuery);
  filteredRecords = applyRangeFilters(filteredRecords, sanitizedQuery);
  filteredRecords = sortRecords(
    filteredRecords,
    sanitizedQuery.sortBy,
    sanitizedQuery.sortOrder || 'asc'
  );

  return {
    total: filteredRecords.length,
    data: filteredRecords,
  };
}

export async function getGranulometrySummary(): Promise<{
  total: number;
  datasets: number;
  biomes: number;
  states: number;
  regions: number;
  municipalities: number;
  layers: number;
  availableFilters: {
    datasets: string[];
    biomes: string[];
    states: string[];
    regions: string[];
    municipalities: string[];
    layers: number[];
  };
}> {
  const granulometryData = await loadGranulometryData();
  const records = granulometryData.data;

  const datasets = new Set(records.map(p => p.datasetId));
  const biomes = new Set(records.map(p => p.biome).filter(Boolean)) as Set<string>;
  const states = new Set(records.map(p => p.state).filter(Boolean)) as Set<string>;
  const regions = new Set(records.map(p => p.region).filter(Boolean)) as Set<string>;
  const municipalities = new Set(records.map(p => p.municipality).filter(Boolean)) as Set<string>;
  const layers = new Set(records.map(p => p.layerId));

  return {
    total: records.length,
    datasets: datasets.size,
    biomes: biomes.size,
    states: states.size,
    regions: regions.size,
    municipalities: municipalities.size,
    layers: layers.size,
    availableFilters: {
      datasets: Array.from(datasets).sort(),
      biomes: Array.from(biomes).sort(),
      states: Array.from(states).sort(),
      regions: Array.from(regions).sort(),
      municipalities: Array.from(municipalities).sort(),
      layers: Array.from(layers).sort((a, b) => a - b),
    },
  };
}

export async function getGranulometryStats(): Promise<{
  total: number;
  byDataset: Array<{ dataset: string; count: number }>;
  byBiome: Array<{ biome: string; count: number }>;
  byState: Array<{ state: string; count: number }>;
  byRegion: Array<{ region: string; count: number }>;
  byMunicipality: Array<{ municipality: string; count: number }>;
  byLayer: Array<{ layer: number; count: number }>;
}> {
  const granulometryData = await loadGranulometryData();
  const records = granulometryData.data;

  const byDataset: Record<string, number> = {};
  records.forEach(record => {
    byDataset[record.datasetId] = (byDataset[record.datasetId] || 0) + 1;
  });

  const byBiome: Record<string, number> = {};
  records.forEach(record => {
    if (record.biome) {
      byBiome[record.biome] = (byBiome[record.biome] || 0) + 1;
    }
  });

  const byState: Record<string, number> = {};
  records.forEach(record => {
    if (record.state) {
      byState[record.state] = (byState[record.state] || 0) + 1;
    }
  });

  const byRegion: Record<string, number> = {};
  records.forEach(record => {
    if (record.region) {
      byRegion[record.region] = (byRegion[record.region] || 0) + 1;
    }
  });

  const byMunicipality: Record<string, number> = {};
  records.forEach(record => {
    if (record.municipality) {
      byMunicipality[record.municipality] = (byMunicipality[record.municipality] || 0) + 1;
    }
  });

  const byLayer: Record<number, number> = {};
  records.forEach(record => {
    byLayer[record.layerId] = (byLayer[record.layerId] || 0) + 1;
  });

  return {
    total: records.length,
    byDataset: Object.entries(byDataset)
      .map(([dataset, count]) => ({ dataset, count }))
      .sort((a, b) => b.count - a.count),
    byBiome: Object.entries(byBiome)
      .map(([biome, count]) => ({ biome, count }))
      .sort((a, b) => b.count - a.count),
    byState: Object.entries(byState)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count),
    byRegion: Object.entries(byRegion)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count),
    byMunicipality: Object.entries(byMunicipality)
      .map(([municipality, count]) => ({ municipality, count }))
      .sort((a, b) => b.count - a.count),
    byLayer: Object.entries(byLayer)
      .map(([layer, count]) => ({ layer: parseInt(layer, 10), count }))
      .sort((a, b) => a.layer - b.layer),
  };
}

export async function getGranulometryMetadata() {
  const granulometryData = await loadGranulometryData();
  return granulometryData.metadata;
}

function calculateStatisticsOptimized(values: number[]): {
  min: number;
  max: number;
  average: number;
  median: number;
} {
  if (values.length === 0) {
    return { min: 0, max: 0, average: 0, median: 0 };
  }

  let min = values[0];
  let max = values[0];
  let sum = 0;

  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    if (val < min) min = val;
    if (val > max) max = val;
    sum += val;
  }

  const average = sum / values.length;

  let median: number;
  if (values.length <= 1000) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  } else {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  return {
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    average: Math.round(average * 100) / 100,
    median: Math.round(median * 100) / 100,
  };
}

export async function getGranulometryFractionAnalysis(
  query: GranulometryFractionQuery,
  options?: { limit?: number; offset?: number }
): Promise<{
  fraction: string;
  fractionLabel: string;
  total: number;
  returned: number;
  filters: {
    biome: string | null;
    region: string | null;
    state: string | null;
    municipality: string | null;
  };
  statistics: {
    min: number;
    max: number;
    average: number;
    median: number;
  };
  pagination?: {
    limit: number;
    offset: number;
  };
  data: Array<{
    observationId: string;
    longitude: number;
    latitude: number;
    layerId: number;
    depthInitial: number;
    depthFinal: number;
    fractionValue: number;
    biome: string | null;
    state: string | null;
    region: string | null;
    municipality: string | null;
  }>;
}> {
  const cacheKey = { ...query, ...options };
  const cached = fractionResultCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const granulometryData = await loadGranulometryData();
  let filteredRecords = granulometryData.data;

  const filterQuery: GranulometryQuery = {
    biome: query.biome,
    region: query.region,
    state: query.state,
    municipality: query.municipality,
  };

  filteredRecords = applyTextFilters(filteredRecords, granulometryData, filterQuery);

  const fractionFieldMap: Record<GranulometryFractionQuery['fraction'], keyof GranulometryRecord> = {
    clay: 'clayFraction',
    silt: 'siltFraction',
    sand: 'sandFraction',
    coarse: 'coarseFraction',
  };

  const fractionLabelMap: Record<GranulometryFractionQuery['fraction'], string> = {
    clay: 'Fração Argila (g/kg)',
    silt: 'Fração Silte (g/kg)',
    sand: 'Fração Areia (g/kg)',
    coarse: 'Fração Grossa (g/kg)',
  };

  const fractionField = fractionFieldMap[query.fraction];
  const fractionLabel = fractionLabelMap[query.fraction];

  const fractionValues: number[] = [];
  const validRecords: GranulometryRecord[] = [];

  for (const record of filteredRecords) {
    const value = record[fractionField] as number;
    if (value !== null && value !== undefined && !isNaN(value)) {
      fractionValues.push(value);
      validRecords.push(record);
    }
  }

  const statistics = calculateStatisticsOptimized(fractionValues);
  const limit = options?.limit;
  const offset = options?.offset || 0;
  const start = offset;
  const end = limit ? start + limit : validRecords.length;
  const paginatedRecords = validRecords.slice(start, end);

  const data = paginatedRecords.map(record => ({
    observationId: record.observationId,
    longitude: record.longitude,
    latitude: record.latitude,
    layerId: record.layerId,
    depthInitial: record.depthInitial,
    depthFinal: record.depthFinal,
    fractionValue: record[fractionField] as number,
    biome: record.biome,
    state: record.state,
    region: record.region,
    municipality: record.municipality,
  }));

  const result = {
    fraction: query.fraction,
    fractionLabel,
    total: validRecords.length,
    returned: data.length,
    filters: {
      biome: query.biome || null,
      region: query.region || null,
      state: query.state || null,
      municipality: query.municipality || null,
    },
    statistics,
    ...(limit && { pagination: { limit, offset } }),
    data,
  };

  fractionResultCache.set(cacheKey, result);

  return result;
}

