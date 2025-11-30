import { readFile } from 'fs/promises';
import { config } from '../config/index.js';
import type { PSDRecord, PSDPlatformData, PSDQuery } from '../types/index.js';

const CACHE_TTL = 5 * 60 * 1000;

let cachedData: PSDPlatformData | null = null;
let lastLoadTime: number = 0;

async function loadPSDData(): Promise<PSDPlatformData> {
  const now = Date.now();
  
  if (cachedData && (now - lastLoadTime) < CACHE_TTL) {
    return cachedData;
  }

  const dataPath = config.data.psdPlatformPath;
  
  try {
    const data = await readFile(dataPath, 'utf-8');
    const parsedData: PSDPlatformData = JSON.parse(data);
    
    cachedData = parsedData;
    lastLoadTime = now;
    
    return parsedData;
  } catch (error) {
    throw new Error(`Failed to load PSD platform data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getPSDData(query?: PSDQuery): Promise<{
  total: number;
  returned: number;
  data: PSDRecord[];
}> {
  const psdData = await loadPSDData();
  let filteredRecords = psdData.data;

  if (query?.dataset_id) {
    const indices = psdData.indices.byDataset[query.dataset_id];
    if (indices && indices.length > 0) {
      filteredRecords = indices.map(i => psdData.data[i]);
    } else {
      filteredRecords = [];
    }
  }

  if (query?.ano !== undefined) {
    if (query.dataset_id) {
      filteredRecords = filteredRecords.filter(r => r.ano === query.ano);
    } else {
      const indices = psdData.indices.byYear[query.ano];
      if (indices && indices.length > 0) {
        filteredRecords = indices.map(i => psdData.data[i]);
      } else {
        filteredRecords = [];
      }
    }
  }

  const limit = Math.min(query?.limit || 100, 1000);
  const offset = query?.offset || 0;
  const start = offset;
  const end = limit ? start + limit : filteredRecords.length;
  const paginatedData = filteredRecords.slice(start, end);

  return {
    total: filteredRecords.length,
    returned: paginatedData.length,
    data: paginatedData,
  };
}

