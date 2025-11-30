// Tipos de Dataset
export interface Dataset {
  title: string;
  authors: string[];
  publicationDate: string;
  doi: string;
  summary: string;
  version: string;
  url: string;
}

// Tipos de Métricas
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

// Tipos de Dados de Solo (formato compacto do JSON)
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

// Tipos de Query Parameters
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

// Tipos de Resposta da API
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

// Tipos do Dataverse API
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

// Tipos de Dados PSD Platform
export interface PSDRecord {
  dataset_id: string;
  observacao_id: string;
  longitude_grau: number;
  latitude_grau: number;
  ano: number;
  camada_id: number;
  profundidade_inicial_cm: number;
  profundidade_final_cm: number;
  fracao_grossa_gkg: number;
  fracao_argila_gkg: number;
  fracao_silte_gkg: number;
  fracao_areia_gkg: number;
  biome: string | null;
}

export interface PSDPlatformData {
  metadata: {
    total: number;
    source: string;
    generatedAt: string;
  };
  data: PSDRecord[];
  indices: {
    byDataset: Record<string, number[]>;
    byYear: Record<number, number[]>;
    byBiome: Record<string, number[]>;
  };
}

export interface PSDQuery {
  dataset_id?: string;
  ano?: number;
  biome?: string;
  limit?: number;
  offset?: number;
}

