import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

interface GranulometryCSVRecord {
  dataset_id: string;
  observacao_id: string;
  longitude_grau: string;
  latitude_grau: string;
  camada_id: string;
  profundidade_inicial_cm: string;
  profundidade_final_cm: string;
  fracao_grossa_gkg: string;
  fracao_argila_gkg: string;
  fracao_silte_gkg: string;
  fracao_areia_gkg: string;
  bioma_nome: string;
  estado_nome: string;
  regiao_nome: string;
  municipio_nome: string;
}

interface GranulometryRecord {
  datasetId: string;
  observationId: string;
  longitude: number;
  latitude: number;
  layerId: number;
  depthInitial: number;
  depthFinal: number;
  coarseFraction: number;
  clayFraction: number;
  siltFraction: number;
  sandFraction: number;
  biome: string | null;
  state: string | null;
  region: string | null;
  municipality: string | null;
}

interface GranulometryData {
  metadata: {
    total: number;
    source: string;
    generatedAt: string;
    uniqueDatasets: number;
    uniqueBiomes: number;
    uniqueStates: number;
    uniqueRegions: number;
    uniqueMunicipalities: number;
  };
  data: GranulometryRecord[];
  indices: {
    byDataset: Record<string, number[]>;
    byBiome: Record<string, number[]>;
    byState: Record<string, number[]>;
    byRegion: Record<string, number[]>;
    byMunicipality: Record<string, number[]>;
    byLayer: Record<number, number[]>;
  };
}

const csvPath = resolve(process.cwd(), 'src/data/Granulometria.csv');
const outputPath = resolve(process.cwd(), 'src/data/granulometry-data.json');

function normalizeString(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim();
  return normalized === '' ? null : normalized;
}

function convertRecord(csvRecord: GranulometryCSVRecord): GranulometryRecord {
  return {
    datasetId: csvRecord.dataset_id.trim(),
    observationId: csvRecord.observacao_id.trim(),
    longitude: parseFloat(csvRecord.longitude_grau) || 0,
    latitude: parseFloat(csvRecord.latitude_grau) || 0,
    layerId: parseInt(csvRecord.camada_id, 10) || 0,
    depthInitial: parseInt(csvRecord.profundidade_inicial_cm, 10) || 0,
    depthFinal: parseInt(csvRecord.profundidade_final_cm, 10) || 0,
    coarseFraction: parseInt(csvRecord.fracao_grossa_gkg, 10) || 0,
    clayFraction: parseInt(csvRecord.fracao_argila_gkg, 10) || 0,
    siltFraction: parseInt(csvRecord.fracao_silte_gkg, 10) || 0,
    sandFraction: parseInt(csvRecord.fracao_areia_gkg, 10) || 0,
    biome: normalizeString(csvRecord.bioma_nome),
    state: normalizeString(csvRecord.estado_nome),
    region: normalizeString(csvRecord.regiao_nome),
    municipality: normalizeString(csvRecord.municipio_nome),
  };
}

async function main() {
  console.log('📄 Reading CSV file:', csvPath);

  const csvData = readFileSync(csvPath, 'utf-8');

  console.log('🔄 Converting CSV to JSON...');

  const rawRecords = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
  }) as GranulometryCSVRecord[];

  console.log(`📊 Total records in CSV: ${rawRecords.length}`);

  // Convert records to English field names
  console.log('🔄 Converting records to English field names...');
  const records: GranulometryRecord[] = [];

  for (let i = 0; i < rawRecords.length; i++) {
    const record = convertRecord(rawRecords[i]);
    records.push(record);

    if ((i + 1) % 10000 === 0 || i === rawRecords.length - 1) {
      console.log(`   Processed records: ${i + 1}/${rawRecords.length}`);
    }
  }

  console.log(`✅ ${records.length} records processed`);

  // Create indices
  console.log('📊 Creating indices...');
  const indices = {
    byDataset: new Map<string, number[]>(),
    byBiome: new Map<string, number[]>(),
    byState: new Map<string, number[]>(),
    byRegion: new Map<string, number[]>(),
    byMunicipality: new Map<string, number[]>(),
    byLayer: new Map<number, number[]>(),
  };

  records.forEach((record, index) => {
    if (record.datasetId) {
      if (!indices.byDataset.has(record.datasetId)) {
        indices.byDataset.set(record.datasetId, []);
      }
      indices.byDataset.get(record.datasetId)!.push(index);
    }

    if (record.biome) {
      if (!indices.byBiome.has(record.biome)) {
        indices.byBiome.set(record.biome, []);
      }
      indices.byBiome.get(record.biome)!.push(index);
    }

    if (record.state) {
      if (!indices.byState.has(record.state)) {
        indices.byState.set(record.state, []);
      }
      indices.byState.get(record.state)!.push(index);
    }

    if (record.region) {
      if (!indices.byRegion.has(record.region)) {
        indices.byRegion.set(record.region, []);
      }
      indices.byRegion.get(record.region)!.push(index);
    }

    if (record.municipality) {
      if (!indices.byMunicipality.has(record.municipality)) {
        indices.byMunicipality.set(record.municipality, []);
      }
      indices.byMunicipality.get(record.municipality)!.push(index);
    }

    if (record.layerId) {
      if (!indices.byLayer.has(record.layerId)) {
        indices.byLayer.set(record.layerId, []);
      }
      indices.byLayer.get(record.layerId)!.push(index);
    }
  });

  console.log(`📊 Indices created:`);
  console.log(`   - By dataset: ${indices.byDataset.size} unique datasets`);
  console.log(`   - By biome: ${indices.byBiome.size} unique biomes`);
  console.log(`   - By state: ${indices.byState.size} unique states`);
  console.log(`   - By region: ${indices.byRegion.size} unique regions`);
  console.log(`   - By municipality: ${indices.byMunicipality.size} unique municipalities`);
  console.log(`   - By layer: ${indices.byLayer.size} unique layers`);

  // Calculate unique counts
  const uniqueDatasets = new Set(records.map(r => r.datasetId));
  const uniqueBiomes = new Set(records.map(r => r.biome).filter(Boolean));
  const uniqueStates = new Set(records.map(r => r.state).filter(Boolean));
  const uniqueRegions = new Set(records.map(r => r.region).filter(Boolean));
  const uniqueMunicipalities = new Set(records.map(r => r.municipality).filter(Boolean));

  const output: GranulometryData = {
    metadata: {
      total: records.length,
      source: 'Granulometria.csv',
      generatedAt: new Date().toISOString(),
      uniqueDatasets: uniqueDatasets.size,
      uniqueBiomes: uniqueBiomes.size,
      uniqueStates: uniqueStates.size,
      uniqueRegions: uniqueRegions.size,
      uniqueMunicipalities: uniqueMunicipalities.size,
    },
    data: records,
    indices: {
      byDataset: Object.fromEntries(indices.byDataset),
      byBiome: Object.fromEntries(indices.byBiome),
      byState: Object.fromEntries(indices.byState),
      byRegion: Object.fromEntries(indices.byRegion),
      byMunicipality: Object.fromEntries(indices.byMunicipality),
      byLayer: Object.fromEntries(indices.byLayer),
    },
  };

  console.log('💾 Saving JSON file:', outputPath);
  writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log('✅ Conversion completed!');
  console.log(`📦 File generated: ${outputPath}`);
  console.log(`📈 Total records: ${records.length}`);
  console.log(`📊 Metadata:`);
  console.log(`   - Unique datasets: ${uniqueDatasets.size}`);
  console.log(`   - Unique biomes: ${uniqueBiomes.size}`);
  console.log(`   - Unique states: ${uniqueStates.size}`);
  console.log(`   - Unique regions: ${uniqueRegions.size}`);
  console.log(`   - Unique municipalities: ${uniqueMunicipalities.size}`);
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

