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

  if (query?.biome) {
    const biomeLower = query.biome.toLowerCase();
    const indices = psdData.indices.byBiome[query.biome];
    if (indices && indices.length > 0) {
      if (query.dataset_id || query.ano !== undefined) {
        filteredRecords = filteredRecords.filter(r => r.biome?.toLowerCase() === biomeLower);
      } else {
        filteredRecords = indices.map(i => psdData.data[i]);
      }
    } else {
      filteredRecords = [];
    }
  }

  if (query?.estado) {
    const estadoLower = query.estado.toLowerCase();
    // Tenta encontrar o estado no índice (case-insensitive)
    let estadoKey: string | undefined;
    if (psdData.indices.byEstado) {
      estadoKey = Object.keys(psdData.indices.byEstado).find(
        key => key.toLowerCase() === estadoLower
      );
    }
    
    if (estadoKey) {
      const indices = psdData.indices.byEstado[estadoKey];
      if (indices && indices.length > 0) {
        if (query.dataset_id || query.ano !== undefined || query.biome) {
          filteredRecords = filteredRecords.filter(r => r.estado?.toLowerCase() === estadoLower);
        } else {
          filteredRecords = indices.map(i => psdData.data[i]);
        }
      } else {
        filteredRecords = [];
      }
    } else {
      // Se não encontrou no índice, filtra diretamente nos dados
      filteredRecords = filteredRecords.filter(r => r.estado?.toLowerCase() === estadoLower);
    }
  }

  if (query?.municipio) {
    const municipioLower = query.municipio.toLowerCase();
    // Tenta encontrar o município no índice (case-insensitive)
    let municipioKey: string | undefined;
    if (psdData.indices.byMunicipio) {
      municipioKey = Object.keys(psdData.indices.byMunicipio).find(
        key => key.toLowerCase() === municipioLower
      );
    }
    
    if (municipioKey) {
      const indices = psdData.indices.byMunicipio[municipioKey];
      if (indices && indices.length > 0) {
        if (query.dataset_id || query.ano !== undefined || query.biome || query.estado) {
          filteredRecords = filteredRecords.filter(r => r.municipio?.toLowerCase() === municipioLower);
        } else {
          filteredRecords = indices.map(i => psdData.data[i]);
        }
      } else {
        filteredRecords = [];
      }
    } else {
      // Se não encontrou no índice, filtra diretamente nos dados
      filteredRecords = filteredRecords.filter(r => r.municipio?.toLowerCase() === municipioLower);
    }
  }

  if (query?.regiao) {
    const regiaoLower = query.regiao.toLowerCase();
    // Tenta encontrar a região no índice (case-insensitive)
    let regiaoKey: string | undefined;
    if (psdData.indices.byRegiao) {
      regiaoKey = Object.keys(psdData.indices.byRegiao).find(
        key => key.toLowerCase() === regiaoLower
      );
    }
    
    if (regiaoKey) {
      const indices = psdData.indices.byRegiao[regiaoKey];
      if (indices && indices.length > 0) {
        if (query.dataset_id || query.ano !== undefined || query.biome || query.estado || query.municipio) {
          filteredRecords = filteredRecords.filter(r => r.regiao?.toLowerCase() === regiaoLower);
        } else {
          filteredRecords = indices.map(i => psdData.data[i]);
        }
      } else {
        filteredRecords = [];
      }
    } else {
      // Se não encontrou no índice, filtra diretamente nos dados
      filteredRecords = filteredRecords.filter(r => r.regiao?.toLowerCase() === regiaoLower);
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

export async function getAllPSDData(query?: Omit<PSDQuery, 'limit' | 'offset'>): Promise<{
  total: number;
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

  if (query?.biome) {
    const biomeLower = query.biome.toLowerCase();
    const indices = psdData.indices.byBiome[query.biome];
    if (indices && indices.length > 0) {
      if (query.dataset_id || query.ano !== undefined) {
        filteredRecords = filteredRecords.filter(r => r.biome?.toLowerCase() === biomeLower);
      } else {
        filteredRecords = indices.map(i => psdData.data[i]);
      }
    } else {
      filteredRecords = [];
    }
  }

  if (query?.estado) {
    const estadoLower = query.estado.toLowerCase();
    // Tenta encontrar o estado no índice (case-insensitive)
    let estadoKey: string | undefined;
    if (psdData.indices.byEstado) {
      estadoKey = Object.keys(psdData.indices.byEstado).find(
        key => key.toLowerCase() === estadoLower
      );
    }
    
    if (estadoKey) {
      const indices = psdData.indices.byEstado[estadoKey];
      if (indices && indices.length > 0) {
        if (query.dataset_id || query.ano !== undefined || query.biome) {
          filteredRecords = filteredRecords.filter(r => r.estado?.toLowerCase() === estadoLower);
        } else {
          filteredRecords = indices.map(i => psdData.data[i]);
        }
      } else {
        filteredRecords = [];
      }
    } else {
      // Se não encontrou no índice, filtra diretamente nos dados
      filteredRecords = filteredRecords.filter(r => r.estado?.toLowerCase() === estadoLower);
    }
  }

  if (query?.municipio) {
    const municipioLower = query.municipio.toLowerCase();
    // Tenta encontrar o município no índice (case-insensitive)
    let municipioKey: string | undefined;
    if (psdData.indices.byMunicipio) {
      municipioKey = Object.keys(psdData.indices.byMunicipio).find(
        key => key.toLowerCase() === municipioLower
      );
    }
    
    if (municipioKey) {
      const indices = psdData.indices.byMunicipio[municipioKey];
      if (indices && indices.length > 0) {
        if (query.dataset_id || query.ano !== undefined || query.biome || query.estado) {
          filteredRecords = filteredRecords.filter(r => r.municipio?.toLowerCase() === municipioLower);
        } else {
          filteredRecords = indices.map(i => psdData.data[i]);
        }
      } else {
        filteredRecords = [];
      }
    } else {
      // Se não encontrou no índice, filtra diretamente nos dados
      filteredRecords = filteredRecords.filter(r => r.municipio?.toLowerCase() === municipioLower);
    }
  }

  if (query?.regiao) {
    const regiaoLower = query.regiao.toLowerCase();
    // Tenta encontrar a região no índice (case-insensitive)
    let regiaoKey: string | undefined;
    if (psdData.indices.byRegiao) {
      regiaoKey = Object.keys(psdData.indices.byRegiao).find(
        key => key.toLowerCase() === regiaoLower
      );
    }
    
    if (regiaoKey) {
      const indices = psdData.indices.byRegiao[regiaoKey];
      if (indices && indices.length > 0) {
        if (query.dataset_id || query.ano !== undefined || query.biome || query.estado || query.municipio) {
          filteredRecords = filteredRecords.filter(r => r.regiao?.toLowerCase() === regiaoLower);
        } else {
          filteredRecords = indices.map(i => psdData.data[i]);
        }
      } else {
        filteredRecords = [];
      }
    } else {
      // Se não encontrou no índice, filtra diretamente nos dados
      filteredRecords = filteredRecords.filter(r => r.regiao?.toLowerCase() === regiaoLower);
    }
  }

  return {
    total: filteredRecords.length,
    data: filteredRecords,
  };
}

