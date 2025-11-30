import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { getBiomeFromCoordinates } from '../src/utils/biome-classifier.js';
import { getStateFromCoordinates } from '../src/utils/state-classifier.js';
import { getMunicipalityFromCoordinates } from '../src/utils/municipality-classifier.js';
import { getRegionFromEstado } from '../src/utils/region-classifier.js';
import type { PSDRecord, PSDPlatformData } from '../src/types/index.js';

const csvPath = resolve(process.cwd(), 'src/data/c3_2025_11_28_soildata_psd_platform.csv');
const outputPath = resolve(process.cwd(), 'src/data/psd-platform-data.json');

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

console.log('🌍 Enriquecendo dados com informação de bioma, estado, município e região...');

const records: PSDRecord[] = rawRecords.map((record, index) => {
  const biome = getBiomeFromCoordinates(record.longitude_grau, record.latitude_grau);
  const estado = getStateFromCoordinates(record.longitude_grau, record.latitude_grau);
  const municipio = getMunicipalityFromCoordinates(record.longitude_grau, record.latitude_grau);
  const regiao = getRegionFromEstado(estado);
  
  if ((index + 1) % 5000 === 0 || index === rawRecords.length - 1) {
    console.log(`   Progresso: ${index + 1}/${rawRecords.length}`);
  }
  
  return {
    ...record,
    biome: biome || null,
    estado: estado || null,
    municipio: municipio || null,
    regiao: regiao || null,
  };
});

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

