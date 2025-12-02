import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { getBiomeFromCoordinates } from '../src/utils/biome-classifier.js';
import { getStateFromCoordinates } from '../src/utils/state-classifier.js';
import { getMunicipalityFromCoordinates } from '../src/utils/municipality-classifier.js';
import { getRegionFromEstado } from '../src/utils/region-classifier.js';
import type { PSDRecord, PSDPlatformData } from '../src/types/index.js';

// MapBiomas Territories API - usar mesma base da plataforma
const MAPBIOMAS_TERRITORIES_BASE =
  'https://prd.plataforma.mapbiomas.org/api/v1/brazil/territories';

// Configurações
const RATE_LIMIT_DELAY_MS = 150; // Delay entre requisições (ms)
const MAX_RETRIES = 3; // Número máximo de tentativas
const RETRY_BASE_DELAY_MS = 1000; // Delay base para retry (ms)

interface MapBiomasTerritoryCategory {
  id?: number;
  name?: {
    [lang: string]: string;
  };
}

interface MapBiomasTerritory {
  id?: string;
  name?: string;
  nameFormatted?: string;
  category?: MapBiomasTerritoryCategory;
}

interface ClassificationResult {
  biome: string | null;
  estado: string | null;
  municipio: string | null;
  regiao: string | null;
}

interface Statistics {
  totalRecords: number;
  uniqueCoordinates: number;
  apiRequests: number;
  cacheHits: number;
  apiErrors: number;
  retries: number;
}

const csvPath = resolve(
  process.cwd(),
  'src/data/c3_2025_11_28_soildata_psd_platform.csv',
);
const outputPath = resolve(process.cwd(), 'src/data/psd-platform-data.json');

// Cache de coordenadas já processadas
const coordinateCache = new Map<string, ClassificationResult>();

// Estatísticas
const stats: Statistics = {
  totalRecords: 0,
  uniqueCoordinates: 0,
  apiRequests: 0,
  cacheHits: 0,
  apiErrors: 0,
  retries: 0,
};

function normalizeString(value: string | null | undefined): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function getCacheKey(lon: number, lat: number): string {
  // Arredondar para 6 casas decimais para agrupar coordenadas próximas
  return `${lon.toFixed(6)},${lat.toFixed(6)}`;
}

function validateCoordinates(lon: number, lat: number): boolean {
  return (
    typeof lon === 'number' &&
    typeof lat === 'number' &&
    !isNaN(lon) &&
    !isNaN(lat) &&
    lon >= -180 &&
    lon <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchTerritoriesForPointWithRetry(
  lon: number,
  lat: number,
  attempt: number = 1,
): Promise<MapBiomasTerritory[]> {
  // Validar coordenadas
  if (!validateCoordinates(lon, lat)) {
    console.warn(
      `⚠️  Coordenadas inválidas: longitude=${lon}, latitude=${lat}`,
    );
    return [];
  }

  // Usar latitude primeiro conforme exemplo do usuário
  const url = `${MAPBIOMAS_TERRITORIES_BASE}/point?latitude=${lat}&longitude=${lon}`;

  try {
    stats.apiRequests++;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limit - aguardar mais tempo
        const waitTime = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(
          `⚠️  Rate limit atingido (tentativa ${attempt}/${MAX_RETRIES}). Aguardando ${waitTime}ms...`,
        );
        await sleep(waitTime);
        if (attempt < MAX_RETRIES) {
          stats.retries++;
          return fetchTerritoriesForPointWithRetry(lon, lat, attempt + 1);
        }
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) return data as MapBiomasTerritory[];
    if (Array.isArray(data?.territories))
      return data.territories as MapBiomasTerritory[];
    if (Array.isArray(data?.data)) return data.data as MapBiomasTerritory[];

    return [];
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    // Tentar novamente se não for o último attempt
    if (attempt < MAX_RETRIES) {
      const waitTime = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.warn(
        `⚠️  Erro ao buscar territórios para ponto (${lat}, ${lon}) [tentativa ${attempt}/${MAX_RETRIES}]: ${errorMessage}. Tentando novamente em ${waitTime}ms...`,
      );
      stats.retries++;
      await sleep(waitTime);
      return fetchTerritoriesForPointWithRetry(lon, lat, attempt + 1);
    }

    // Última tentativa falhou
    stats.apiErrors++;
    console.error(
      `❌ Falha ao buscar territórios para ponto (${lat}, ${lon}) após ${MAX_RETRIES} tentativas: ${errorMessage}`,
    );
    return [];
  }
}

function extractClassificationFromTerritories(
  territories: MapBiomasTerritory[],
  fallback: ClassificationResult,
): ClassificationResult {
  let biome = fallback.biome;
  let estado = fallback.estado;
  let municipio = fallback.municipio;
  let regiao = fallback.regiao;

  if (!territories.length) {
    return { biome, estado, municipio, regiao };
  }

  const getCategoryName = (t: MapBiomasTerritory, lang: string) =>
    t.category?.name?.[lang] ||
    t.category?.name?.['pt-BR'] ||
    t.category?.name?.['en-US'] ||
    '';

  for (const t of territories) {
    const catId = t.category?.id;
    const catName = normalizeString(getCategoryName(t, 'pt-BR')).toLowerCase();

    if (
      !municipio &&
      (catId === 95 || catName === 'municipio' || catName === 'município')
    ) {
      municipio = t.name || municipio;
    }

    if (!biome && (catId === 4 || catName === 'bioma')) {
      biome = t.name || biome;
    }

    if (!regiao && (catId === 2 || catName === 'regiao' || catName === 'região')) {
      regiao = t.name || regiao;
    }

    if (!estado && (catName === 'estado' || catName === 'province')) {
      estado = t.name || estado;
    }
  }

  return {
    biome: biome || null,
    estado: estado || null,
    municipio: municipio || null,
    regiao: regiao || null,
  };
}

async function classifyCoordinate(
  lon: number,
  lat: number,
): Promise<ClassificationResult> {
  const cacheKey = getCacheKey(lon, lat);

  // Verificar cache primeiro
  if (coordinateCache.has(cacheKey)) {
    stats.cacheHits++;
    return coordinateCache.get(cacheKey)!;
  }

  // Fallback rápido com os classificadores locais existentes
  const fallback: ClassificationResult = {
    biome: getBiomeFromCoordinates(lon, lat) || null,
    estado: getStateFromCoordinates(lon, lat) || null,
    municipio: getMunicipalityFromCoordinates(lon, lat) || null,
    regiao: getRegionFromEstado(
      getStateFromCoordinates(lon, lat) || '',
    ) || null,
  };

  // Buscar na API MapBiomas
  const territories = await fetchTerritoriesForPointWithRetry(lon, lat);
  const classification = extractClassificationFromTerritories(
    territories,
    fallback,
  );

  // Armazenar no cache
  coordinateCache.set(cacheKey, classification);

  // Rate limiting - aguardar antes da próxima requisição
  await sleep(RATE_LIMIT_DELAY_MS);

  return classification;
}

async function main() {
  console.log('📄 Lendo arquivo CSV:', csvPath);

  const csvData = readFileSync(csvPath, 'utf-8');

  console.log('🔄 Convertendo CSV para JSON...');

  const rawRecords = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    cast: (value, context) => {
      const column = String(context.column || '');
      if (!column) return value;

      if (column === 'longitude_grau' || column === 'latitude_grau') {
        return parseFloat(value) || 0;
      }

      if (
        column.includes('_gkg') ||
        column.includes('_cm') ||
        column === 'ano' ||
        column === 'camada_id'
      ) {
        return parseInt(value, 10) || 0;
      }

      return value;
    },
  }) as Array<Omit<PSDRecord, 'biome' | 'estado' | 'municipio' | 'regiao'>>;

  stats.totalRecords = rawRecords.length;

  console.log(`📊 Total de registros no CSV: ${stats.totalRecords}`);

  // Extrair coordenadas únicas
  console.log('🔍 Extraindo coordenadas únicas...');
  const uniqueCoordinates = new Set<string>();
  const coordinateToRecords = new Map<string, number[]>();

  rawRecords.forEach((record, index) => {
    const lon = record.longitude_grau;
    const lat = record.latitude_grau;
    const cacheKey = getCacheKey(lon, lat);

    uniqueCoordinates.add(cacheKey);

    if (!coordinateToRecords.has(cacheKey)) {
      coordinateToRecords.set(cacheKey, []);
    }
    coordinateToRecords.get(cacheKey)!.push(index);
  });

  stats.uniqueCoordinates = uniqueCoordinates.size;
  console.log(
    `📍 Coordenadas únicas encontradas: ${stats.uniqueCoordinates} (${((stats.uniqueCoordinates / stats.totalRecords) * 100).toFixed(2)}% do total)`,
  );

  // Processar coordenadas únicas
  console.log(
    '🌍 Enriquecendo dados com informação de bioma, estado, município e região (MapBiomas Territories API)...',
  );
  console.log(`⏱️  Estimativa: ~${Math.ceil((stats.uniqueCoordinates * RATE_LIMIT_DELAY_MS) / 1000 / 60)} minutos (com rate limiting de ${RATE_LIMIT_DELAY_MS}ms)`);

  const coordinatesArray = Array.from(uniqueCoordinates);
  let processedCoordinates = 0;

  for (const cacheKey of coordinatesArray) {
    const [lonStr, latStr] = cacheKey.split(',');
    const lon = parseFloat(lonStr);
    const lat = parseFloat(latStr);

    await classifyCoordinate(lon, lat);

    processedCoordinates++;

    if (
      processedCoordinates % 100 === 0 ||
      processedCoordinates === coordinatesArray.length
    ) {
      const progress = ((processedCoordinates / coordinatesArray.length) * 100).toFixed(1);
      const cacheHitRate = stats.cacheHits > 0
        ? ((stats.cacheHits / (stats.cacheHits + stats.apiRequests)) * 100).toFixed(1)
        : '0.0';
      console.log(
        `   Progresso: ${processedCoordinates}/${coordinatesArray.length} (${progress}%) | ` +
        `Requisições API: ${stats.apiRequests} | ` +
        `Cache hits: ${stats.cacheHits} (${cacheHitRate}%) | ` +
        `Erros: ${stats.apiErrors} | ` +
        `Retries: ${stats.retries}`,
      );
    }
  }

  console.log('✅ Todas as coordenadas únicas processadas');
  console.log(`📈 Estatísticas da API:`);
  console.log(`   - Requisições feitas: ${stats.apiRequests}`);
  console.log(`   - Cache hits: ${stats.cacheHits} (${((stats.cacheHits / (stats.cacheHits + stats.apiRequests)) * 100).toFixed(1)}%)`);
  console.log(`   - Erros: ${stats.apiErrors}`);
  console.log(`   - Retries: ${stats.retries}`);

  // Aplicar classificações aos registros
  console.log('🔄 Aplicando classificações aos registros...');
  const records: PSDRecord[] = [];

  for (let index = 0; index < rawRecords.length; index += 1) {
    const baseRecord = rawRecords[index];
    const lon = baseRecord.longitude_grau;
    const lat = baseRecord.latitude_grau;
    const cacheKey = getCacheKey(lon, lat);

    const classification = coordinateCache.get(cacheKey) || {
      biome: null,
      estado: null,
      municipio: null,
      regiao: null,
    };

    records.push({
      ...baseRecord,
      ...classification,
    });

    if ((index + 1) % 10000 === 0 || index === rawRecords.length - 1) {
      console.log(`   Registros processados: ${index + 1}/${rawRecords.length}`);
    }
  }

  console.log(`✅ ${records.length} registros processados`);

const indices = {
  byDataset: new Map<string, number[]>(),
  byYear: new Map<number, number[]>(),
  byBiome: new Map<string, number[]>(),
  byEstado: new Map<string, number[]>(),
  byMunicipio: new Map<string, number[]>(),
  byRegiao: new Map<string, number[]>(),
};

records.forEach((record, index) => {
  if (record.dataset_id) {
    if (!indices.byDataset.has(record.dataset_id)) {
      indices.byDataset.set(record.dataset_id, []);
    }
    indices.byDataset.get(record.dataset_id)!.push(index);
  }

  if (record.ano) {
    if (!indices.byYear.has(record.ano)) {
      indices.byYear.set(record.ano, []);
    }
    indices.byYear.get(record.ano)!.push(index);
  }

  if (record.biome) {
    if (!indices.byBiome.has(record.biome)) {
      indices.byBiome.set(record.biome, []);
    }
    indices.byBiome.get(record.biome)!.push(index);
  }

  if (record.estado) {
    if (!indices.byEstado.has(record.estado)) {
      indices.byEstado.set(record.estado, []);
    }
    indices.byEstado.get(record.estado)!.push(index);
  }

  if (record.municipio) {
    if (!indices.byMunicipio.has(record.municipio)) {
      indices.byMunicipio.set(record.municipio, []);
    }
    indices.byMunicipio.get(record.municipio)!.push(index);
  }

  if (record.regiao) {
    if (!indices.byRegiao.has(record.regiao)) {
      indices.byRegiao.set(record.regiao, []);
    }
    indices.byRegiao.get(record.regiao)!.push(index);
  }
});

console.log(`📊 Índices criados:`);
console.log(`   - Por dataset: ${indices.byDataset.size} datasets únicos`);
console.log(`   - Por ano: ${indices.byYear.size} anos únicos`);
console.log(`   - Por bioma: ${indices.byBiome.size} biomas únicos`);
console.log(`   - Por estado: ${indices.byEstado.size} estados únicos`);
console.log(`   - Por município: ${indices.byMunicipio.size} municípios únicos`);
console.log(`   - Por região: ${indices.byRegiao.size} regiões únicas`);

const biomeCounts = new Map<string, number>();
records.forEach(r => {
  if (r.biome) {
    biomeCounts.set(r.biome, (biomeCounts.get(r.biome) || 0) + 1);
  }
});
console.log(`   Distribuição por bioma:`);
Array.from(biomeCounts.entries())
  .sort((a, b) => b[1] - a[1])
  .forEach(([biome, count]) => {
    console.log(`     - ${biome}: ${count} registros`);
  });

const estadoCounts = new Map<string, number>();
records.forEach(r => {
  if (r.estado) {
    estadoCounts.set(r.estado, (estadoCounts.get(r.estado) || 0) + 1);
  }
});
console.log(`   Distribuição por estado:`);
Array.from(estadoCounts.entries())
  .sort((a, b) => b[1] - a[1])
  .forEach(([estado, count]) => {
    console.log(`     - ${estado}: ${count} registros`);
  });

const municipioCounts = new Map<string, number>();
records.forEach(r => {
  if (r.municipio) {
    municipioCounts.set(r.municipio, (municipioCounts.get(r.municipio) || 0) + 1);
  }
});
console.log(`   Distribuição por município (top 10):`);
Array.from(municipioCounts.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([municipio, count]) => {
    console.log(`     - ${municipio}: ${count} registros`);
  });

const regiaoCounts = new Map<string, number>();
records.forEach(r => {
  if (r.regiao) {
    regiaoCounts.set(r.regiao, (regiaoCounts.get(r.regiao) || 0) + 1);
  }
});
console.log(`   Distribuição por região:`);
Array.from(regiaoCounts.entries())
  .sort((a, b) => b[1] - a[1])
  .forEach(([regiao, count]) => {
    console.log(`     - ${regiao}: ${count} registros`);
  });

  const output: PSDPlatformData = {
    metadata: {
      total: records.length,
      source: 'c3_2025_11_28_soildata_psd_platform.csv',
      generatedAt: new Date().toISOString(),
    },
    data: records,
    indices: {
      byDataset: Object.fromEntries(indices.byDataset),
      byYear: Object.fromEntries(indices.byYear),
      byBiome: Object.fromEntries(indices.byBiome),
      byEstado: Object.fromEntries(indices.byEstado),
      byMunicipio: Object.fromEntries(indices.byMunicipio),
      byRegiao: Object.fromEntries(indices.byRegiao),
    },
  };

  console.log('💾 Salvando arquivo JSON:', outputPath);
  writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log('✅ Conversão concluída!');
  console.log(`📦 Arquivo gerado: ${outputPath}`);
  console.log(`📈 Total de registros: ${records.length}`);
}

main().catch((error) => {
  console.error('❌ Conversão falhou:', error);
  process.exit(1);
});
