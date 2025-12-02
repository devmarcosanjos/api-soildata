export interface Dataset {
  title: string;
  authors: string[];
  publicationDate: string;
  doi: string;
  summary: string;
  version: string;
  url: string;
}

export interface MetricCount {
  count: number;
}

export interface DataverseApiResponse<T> {
  status: string;
  data: T;
}

export interface MonthlyMetric {
  date: string; // Formato YYYY-MM
  count: number;
}

export interface DatasetBySubject {
  subject: string;
  count: number;
}

export interface DatasetByCategory {
  category: string;
  count: number;
}

export interface FileDownload {
  id: number;
  pid?: string;
  count: number;
}

export interface MonthlyFileDownload {
  date: string;
  id: number;
  pid?: string;
  count: number;
}

export interface TreeDataverse {
  id: number;
  ownerId: number;
  alias: string;
  depth: number;
  name: string;
  children?: TreeDataverse[];
}

export interface MetricsApiParams {
  parentAlias?: string;
  dataLocation?: 'local' | 'remote' | 'all';
  country?: string;
}

export interface EnrichedPoint {
  id: string;
  lon: number; // longitude
  lat: number; // latitude
  d: number | null; // depth
  lcs: number | null; // logClaySand
  lss: number | null; // logSiltSand
  dc: string; // datasetCode
  st: string | null; // state
  mu: string | null; // municipality
  bi: string | null; // biome
  ti: string; // title
  doi: string | null;
  url: string; // datasetUrl
  csv: string; // csvDataUri
}

export interface EnrichedSoilData {
  metadata: {
    generatedAt: string;
    sourceFile: string;
    totalPoints: number;
    uniqueDatasets: number;
    version: number;
  };
  points: EnrichedPoint[];
}

export interface DatasetsQuery {
  limit?: number;
  offset?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  q?: string;
}

export interface SoilDataQuery {
  limit?: number;
  offset?: number;
  state?: string;
  municipality?: string;
  biome?: string;
  datasetCode?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data?: T;
  count?: number;
  returned?: number;
  pagination?: {
    limit: number | null;
    offset: number;
  };
  filters?: Record<string, string | null>;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  status?: number;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface DataverseContact {
  name?: string;
  affiliation?: string;
}

export interface DataverseItem {
  title?: string;
  name?: string;
  dataset?: string;
  global_id?: string;
  published_at?: string;
  updatedAt?: string;
  createdAt?: string;
  dateOfDeposit?: string;
  publicationDate?: string;
  description?: string;
  contacts?: DataverseContact[];
  metadataBlocks?: Record<string, {
    fields?: Array<{
      typeName?: string;
      value?: unknown;
      fields?: Array<{
        typeName?: string;
        value?: unknown;
      }>;
    }>;
  }>;
}

export interface DataverseSearchResponse {
  data?: {
    items?: DataverseItem[];
  };
}

export interface GranulometryRecord {
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

export interface GranulometryData {
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

export interface GranulometryQuery {
  datasetId?: string;
  biome?: string;
  state?: string;
  region?: string;
  municipality?: string;
  layerId?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'datasetId' | 'observationId' | 'longitude' | 'latitude' | 'layerId' | 'depthInitial' | 'depthFinal' | 'clayFraction' | 'siltFraction' | 'sandFraction';
  sortOrder?: 'asc' | 'desc';
  minDepth?: number;
  maxDepth?: number;
  minLatitude?: number;
  maxLatitude?: number;
  minLongitude?: number;
  maxLongitude?: number;
  minClayFraction?: number;
  maxClayFraction?: number;
  minSiltFraction?: number;
  maxSiltFraction?: number;
  minSandFraction?: number;
  maxSandFraction?: number;
}

export interface GranulometryFractionQuery {
  fraction: 'clay' | 'silt' | 'sand' | 'coarse';
  biome?: string;
  region?: string;
  state?: string;
  municipality?: string;
  limit?: number;
  offset?: number;
}

