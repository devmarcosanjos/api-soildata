import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import type { PSDRecord, PSDPlatformData } from '../src/types/index.js';

const csvPath = resolve(process.cwd(), 'src/data/c3_2025_11_28_soildata_psd_platform.csv');
const outputPath = resolve(process.cwd(), 'src/data/psd-platform-data.json');

console.log('📄 Lendo arquivo CSV:', csvPath);

const csvData = readFileSync(csvPath, 'utf-8');

console.log('🔄 Convertendo CSV para JSON...');

const records = parse(csvData, {
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
}) as PSDRecord[];

console.log(`✅ ${records.length} registros processados`);

const indices = {
  byDataset: new Map<string, number[]>(),
  byYear: new Map<number, number[]>(),
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
});

console.log(`📊 Índices criados:`);
console.log(`   - Por dataset: ${indices.byDataset.size} datasets únicos`);
console.log(`   - Por ano: ${indices.byYear.size} anos únicos`);

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
  },
};

console.log('💾 Salvando arquivo JSON:', outputPath);
writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log('✅ Conversão concluída!');
console.log(`📦 Arquivo gerado: ${outputPath}`);
console.log(`📈 Total de registros: ${records.length}`);

