import type { GranulometryRecord, GranulometryData, GranulometryQuery } from '../types/index.js';

function applyIndexFilter<T extends string | number>(
  records: GranulometryRecord[],
  data: GranulometryData,
  indexKey: keyof GranulometryData['indices'],
  filterValue: T,
  getRecordValue: (record: GranulometryRecord) => T | null,
  hasOtherFilters: boolean
): GranulometryRecord[] {
  const indices = data.indices[indexKey] as Record<string | number, number[]>;
  
  if (!indices) {
    return records.filter(r => {
      const value = getRecordValue(r);
      return value !== null && String(value).toLowerCase() === String(filterValue).toLowerCase();
    });
  }

  const indexKeyFound = Object.keys(indices).find(
    key => String(key).toLowerCase() === String(filterValue).toLowerCase()
  );

  if (indexKeyFound) {
    const indexArray = indices[indexKeyFound];
    if (indexArray && indexArray.length > 0) {
      if (hasOtherFilters) {
        return records.filter(r => {
          const value = getRecordValue(r);
          return value !== null && String(value).toLowerCase() === String(filterValue).toLowerCase();
        });
      } else {
        return indexArray
          .map(i => data.data[i])
          .filter(r => {
            const value = getRecordValue(r);
            return value !== null && String(value).toLowerCase() === String(filterValue).toLowerCase();
          });
      }
    }
  }

  return records.filter(r => {
    const value = getRecordValue(r);
    return value !== null && String(value).toLowerCase() === String(filterValue).toLowerCase();
  });
}

export function applyTextFilters(
  records: GranulometryRecord[],
  data: GranulometryData,
  query: GranulometryQuery
): GranulometryRecord[] {
  let filtered = records;
  let hasIndexFilters = !!(query.datasetId || query.layerId !== undefined);

  if (query.biome) {
    filtered = applyIndexFilter(
      filtered,
      data,
      'byBiome',
      query.biome,
      r => r.biome,
      hasIndexFilters
    );
    hasIndexFilters = true;
  }

  if (query.state) {
    filtered = applyIndexFilter(
      filtered,
      data,
      'byState',
      query.state,
      r => r.state,
      hasIndexFilters
    );
    hasIndexFilters = true;
  }

  if (query.region) {
    filtered = applyIndexFilter(
      filtered,
      data,
      'byRegion',
      query.region,
      r => r.region,
      hasIndexFilters
    );
    hasIndexFilters = true;
  }

  if (query.municipality) {
    filtered = applyIndexFilter(
      filtered,
      data,
      'byMunicipality',
      query.municipality,
      r => r.municipality,
      hasIndexFilters
    );
  }

  return filtered;
}

export function applyRangeFilters(
  records: GranulometryRecord[],
  query: GranulometryQuery
): GranulometryRecord[] {
  let filtered = records;

  if (query.minDepth !== undefined || query.maxDepth !== undefined) {
    filtered = filtered.filter(r => {
      const depth = r.depthFinal;
      if (query.minDepth !== undefined && depth < query.minDepth) return false;
      if (query.maxDepth !== undefined && depth > query.maxDepth) return false;
      return true;
    });
  }

  if (query.minLatitude !== undefined || query.maxLatitude !== undefined) {
    filtered = filtered.filter(r => {
      if (query.minLatitude !== undefined && r.latitude < query.minLatitude) return false;
      if (query.maxLatitude !== undefined && r.latitude > query.maxLatitude) return false;
      return true;
    });
  }

  if (query.minLongitude !== undefined || query.maxLongitude !== undefined) {
    filtered = filtered.filter(r => {
      if (query.minLongitude !== undefined && r.longitude < query.minLongitude) return false;
      if (query.maxLongitude !== undefined && r.longitude > query.maxLongitude) return false;
      return true;
    });
  }

  if (query.minClayFraction !== undefined || query.maxClayFraction !== undefined) {
    filtered = filtered.filter(r => {
      if (query.minClayFraction !== undefined && r.clayFraction < query.minClayFraction) return false;
      if (query.maxClayFraction !== undefined && r.clayFraction > query.maxClayFraction) return false;
      return true;
    });
  }

  if (query.minSiltFraction !== undefined || query.maxSiltFraction !== undefined) {
    filtered = filtered.filter(r => {
      if (query.minSiltFraction !== undefined && r.siltFraction < query.minSiltFraction) return false;
      if (query.maxSiltFraction !== undefined && r.siltFraction > query.maxSiltFraction) return false;
      return true;
    });
  }

  if (query.minSandFraction !== undefined || query.maxSandFraction !== undefined) {
    filtered = filtered.filter(r => {
      if (query.minSandFraction !== undefined && r.sandFraction < query.minSandFraction) return false;
      if (query.maxSandFraction !== undefined && r.sandFraction > query.maxSandFraction) return false;
      return true;
    });
  }

  return filtered;
}

export function sortRecords(
  records: GranulometryRecord[],
  sortBy?: GranulometryQuery['sortBy'],
  sortOrder: 'asc' | 'desc' = 'asc'
): GranulometryRecord[] {
  if (!sortBy) {
    return records;
  }

  const sorted = [...records].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortBy) {
      case 'datasetId':
        aValue = a.datasetId;
        bValue = b.datasetId;
        break;
      case 'observationId':
        aValue = a.observationId;
        bValue = b.observationId;
        break;
      case 'longitude':
        aValue = a.longitude;
        bValue = b.longitude;
        break;
      case 'latitude':
        aValue = a.latitude;
        bValue = b.latitude;
        break;
      case 'layerId':
        aValue = a.layerId;
        bValue = b.layerId;
        break;
      case 'depthInitial':
        aValue = a.depthInitial;
        bValue = b.depthInitial;
        break;
      case 'depthFinal':
        aValue = a.depthFinal;
        bValue = b.depthFinal;
        break;
      case 'clayFraction':
        aValue = a.clayFraction;
        bValue = b.clayFraction;
        break;
      case 'siltFraction':
        aValue = a.siltFraction;
        bValue = b.siltFraction;
        break;
      case 'sandFraction':
        aValue = a.sandFraction;
        bValue = b.sandFraction;
        break;
      default:
        return 0;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  return sorted;
}

export function validateAndSanitizeQuery(query?: GranulometryQuery): GranulometryQuery {
  if (!query) {
    return {};
  }

  const sanitized: GranulometryQuery = { ...query };

  if (sanitized.limit !== undefined) {
    sanitized.limit = Math.max(1, Math.min(1000, Math.floor(sanitized.limit || 100)));
  }

  if (sanitized.offset !== undefined) {
    sanitized.offset = Math.max(0, Math.floor(sanitized.offset || 0));
  }

  if (sanitized.sortOrder && sanitized.sortOrder !== 'asc' && sanitized.sortOrder !== 'desc') {
    sanitized.sortOrder = 'asc';
  }

  if (sanitized.minDepth !== undefined && sanitized.maxDepth !== undefined) {
    if (sanitized.minDepth > sanitized.maxDepth) {
      [sanitized.minDepth, sanitized.maxDepth] = [sanitized.maxDepth, sanitized.minDepth];
    }
  }

  if (sanitized.minLatitude !== undefined && sanitized.maxLatitude !== undefined) {
    if (sanitized.minLatitude > sanitized.maxLatitude) {
      [sanitized.minLatitude, sanitized.maxLatitude] = [sanitized.maxLatitude, sanitized.minLatitude];
    }
  }

  if (sanitized.minLongitude !== undefined && sanitized.maxLongitude !== undefined) {
    if (sanitized.minLongitude > sanitized.maxLongitude) {
      [sanitized.minLongitude, sanitized.maxLongitude] = [sanitized.maxLongitude, sanitized.minLongitude];
    }
  }

  return sanitized;
}

