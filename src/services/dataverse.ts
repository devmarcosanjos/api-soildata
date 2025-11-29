import type {
  Dataset,
  DataverseItem,
  DataverseSearchResponse,
  MetricsApiParams,
  MetricCount,
  MonthlyMetric,
  DatasetBySubject,
  DatasetByCategory,
  FileDownload,
  MonthlyFileDownload,
  TreeDataverse,
  DataverseApiResponse,
} from '../types/index.js';

const DATAVERSE_SEARCH_BASE = 'https://soildata.mapbiomas.org/api/search';
const DATAVERSE_METRICS_BASE = 'https://soildata.mapbiomas.org/api/info/metrics';

function extractValue(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (Array.isArray(value)) return extractValue(value[0]);
  if (value && typeof value === 'object' && 'value' in value) {
    return extractValue((value as { value: unknown }).value);
  }
  return null;
}

function findFieldValue(
  fields: Array<{ typeName?: string; value?: unknown; fields?: Array<{ typeName?: string; value?: unknown }> }>,
  names: string[]
): string | null {
  for (const field of fields) {
    if (field.typeName && names.some((name) => field.typeName?.toLowerCase() === name.toLowerCase())) {
      return extractValue(field.value);
    }
    if (field.fields) {
      const found = findFieldValue(field.fields, names);
      if (found) return found;
    }
  }
  return null;
}

function extractAuthors(item: DataverseItem): string[] {
  if (item.contacts && Array.isArray(item.contacts) && item.contacts.length > 0) {
    return item.contacts
      .map(contact => contact.name)
      .filter((name): name is string => typeof name === 'string' && name.length > 0);
  }

  const metadataBlocks = item.metadataBlocks ?? {};
  const allFields: Array<{ typeName?: string; value?: unknown; fields?: Array<{ typeName?: string; value?: unknown }> }> = [];
  
  for (const block of Object.values(metadataBlocks)) {
    if (block.fields) {
      allFields.push(...block.fields);
    }
  }

  const authorField = findFieldValue(allFields, ['author', 'authorName', 'datasetContact']);
  if (authorField) {
    return authorField.split(',').map(a => a.trim()).filter(Boolean);
  }
  
  return [];
}

function extractSummary(item: DataverseItem): string {
  if (item.description && typeof item.description === 'string') {
    return item.description;
  }

  const metadataBlocks = item.metadataBlocks ?? {};
  const allFields: Array<{ typeName?: string; value?: unknown; fields?: Array<{ typeName?: string; value?: unknown }> }> = [];
  
  for (const block of Object.values(metadataBlocks)) {
    if (block.fields) {
      allFields.push(...block.fields);
    }
  }

  return findFieldValue(allFields, ['dsDescription', 'description', 'abstract']) || '';
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getFullYear()} ${months[date.getMonth()]} ${date.getDate()}`;
  } catch {
    return dateString;
  }
}

function generateDatasetUrl(doi: string): string {
  return `https://soildata.mapbiomas.org/dataset.xhtml?persistentId=${doi}`;
}

function transformToDataset(item: DataverseItem): Dataset {
  const metadataBlocks = item.metadataBlocks ?? {};
  const allFields: Array<{ typeName?: string; value?: unknown; fields?: Array<{ typeName?: string; value?: unknown }> }> = [];
  
  for (const block of Object.values(metadataBlocks)) {
    if (block.fields) {
      allFields.push(...block.fields);
    }
  }

  const titleFromFields = findFieldValue(allFields, ['title', 'datasetTitle']);
  const title = titleFromFields || item.title || item.name || item.dataset || 'Dataset sem título';
  
  const globalId = typeof item.global_id === 'string' ? item.global_id.trim() : null;
  const doi = globalId ? `doi:${globalId}` : '';
  
  const dateOfDeposit = item.published_at || item.updatedAt || item.createdAt;
  const publicationDate = formatDate(dateOfDeposit);
  
  const authors = extractAuthors(item);
  const summary = extractSummary(item);
  const version = findFieldValue(allFields, ['version', 'datasetVersion']) || 'V1';

  return {
    title,
    authors: authors.length > 0 ? authors : ['Autor não informado'],
    publicationDate: publicationDate || 'Data não informada',
    doi,
    summary: summary || 'Descrição não disponível',
    version,
    url: globalId ? generateDatasetUrl(globalId) : '#',
  };
}

async function fetchDataverse<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Dataverse API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as DataverseApiResponse<T> | T;
  if (data && typeof data === 'object' && 'data' in data) {
    return (data as DataverseApiResponse<T>).data as T;
  }
  return data as T;
}

function buildMetricsUrl(endpoint: string, params?: MetricsApiParams): string {
  const url = new URL(`${DATAVERSE_METRICS_BASE}${endpoint}`);
  
  if (params) {
    if (params.parentAlias) url.searchParams.set('parentAlias', params.parentAlias);
    if (params.dataLocation) url.searchParams.set('dataLocation', params.dataLocation);
    if (params.country) url.searchParams.set('country', params.country);
  }
  
  return url.toString();
}

export async function searchDatasets(params: {
  q?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}): Promise<DataverseSearchResponse> {
  const { q = '*', limit = 10, offset = 0, sort = 'date', order = 'desc' } = params;
  const url = `${DATAVERSE_SEARCH_BASE}?q=${encodeURIComponent(q)}&type=dataset&sort=${sort}&order=${order}&per_page=${limit}&start=${offset}`;
  
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to search datasets: ${response.status}`);
  }

  return await response.json() as DataverseSearchResponse;
}

export function transformDatasets(items: DataverseItem[]): Dataset[] {
  return items.map(transformToDataset);
}

export async function getTotalDatasets(params?: MetricsApiParams): Promise<MetricCount> {
  return fetchDataverse<MetricCount>(buildMetricsUrl('/datasets', params));
}

export async function getTotalDownloads(params?: MetricsApiParams): Promise<MetricCount> {
  return fetchDataverse<MetricCount>(buildMetricsUrl('/downloads', params));
}

export async function getTotalFiles(params?: MetricsApiParams): Promise<MetricCount> {
  return fetchDataverse<MetricCount>(buildMetricsUrl('/files', params));
}

export async function getTotalDataverses(params?: MetricsApiParams): Promise<MetricCount> {
  return fetchDataverse<MetricCount>(buildMetricsUrl('/dataverses', params));
}

export async function getMonthlyDownloads(params?: MetricsApiParams): Promise<MonthlyMetric[]> {
  return fetchDataverse<MonthlyMetric[]>(buildMetricsUrl('/downloads/monthly', params));
}

export async function getMonthlyDatasets(params?: MetricsApiParams): Promise<MonthlyMetric[]> {
  return fetchDataverse<MonthlyMetric[]>(buildMetricsUrl('/datasets/monthly', params));
}

export async function getMonthlyFiles(params?: MetricsApiParams): Promise<MonthlyMetric[]> {
  return fetchDataverse<MonthlyMetric[]>(buildMetricsUrl('/files/monthly', params));
}

export async function getDownloadsPastDays(days: number, params?: MetricsApiParams): Promise<MetricCount> {
  return fetchDataverse<MetricCount>(buildMetricsUrl(`/downloads/pastDays/${days}`, params));
}

export async function getDatasetsPastDays(days: number, params?: MetricsApiParams): Promise<MetricCount> {
  return fetchDataverse<MetricCount>(buildMetricsUrl(`/datasets/pastDays/${days}`, params));
}

export async function getDatasetsBySubject(params?: MetricsApiParams): Promise<DatasetBySubject[]> {
  return fetchDataverse<DatasetBySubject[]>(buildMetricsUrl('/datasets/bySubject', params));
}

export async function getDataversesByCategory(params?: MetricsApiParams): Promise<DatasetByCategory[]> {
  return fetchDataverse<DatasetByCategory[]>(buildMetricsUrl('/dataverses/byCategory', params));
}

export async function getFileDownloads(params?: MetricsApiParams): Promise<FileDownload[]> {
  try {
    return await fetchDataverse<FileDownload[]>(buildMetricsUrl('/filedownloads', params));
  } catch {
    return [];
  }
}

export async function getMonthlyFileDownloads(params?: MetricsApiParams): Promise<MonthlyFileDownload[]> {
  return fetchDataverse<MonthlyFileDownload[]>(buildMetricsUrl('/filedownloads/monthly', params));
}

export async function getDataverseTree(params?: MetricsApiParams): Promise<TreeDataverse[]> {
  return fetchDataverse<TreeDataverse[]>(buildMetricsUrl('/tree', params));
}
