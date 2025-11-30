// Mapa de estados para regiões do Brasil
const estadoToRegion: Record<string, string> = {
  // Norte
  'Acre': 'Norte',
  'Amapá': 'Norte',
  'Amazonas': 'Norte',
  'Pará': 'Norte',
  'Rondônia': 'Norte',
  'Roraima': 'Norte',
  'Tocantins': 'Norte',
  
  // Nordeste
  'Alagoas': 'Nordeste',
  'Bahia': 'Nordeste',
  'Ceará': 'Nordeste',
  'Maranhão': 'Nordeste',
  'Paraíba': 'Nordeste',
  'Pernambuco': 'Nordeste',
  'Piauí': 'Nordeste',
  'Rio Grande do Norte': 'Nordeste',
  'Sergipe': 'Nordeste',
  
  // Centro-Oeste
  'Distrito Federal': 'Centro-Oeste',
  'Goiás': 'Centro-Oeste',
  'Mato Grosso': 'Centro-Oeste',
  'Mato Grosso do Sul': 'Centro-Oeste',
  
  // Sudeste
  'Espírito Santo': 'Sudeste',
  'Minas Gerais': 'Sudeste',
  'Rio de Janeiro': 'Sudeste',
  'São Paulo': 'Sudeste',
  
  // Sul
  'Paraná': 'Sul',
  'Rio Grande do Sul': 'Sul',
  'Santa Catarina': 'Sul',
};

// Mapa de siglas para regiões (fallback)
const siglaToRegion: Record<string, string> = {
  // Norte
  'AC': 'Norte',
  'AP': 'Norte',
  'AM': 'Norte',
  'PA': 'Norte',
  'RO': 'Norte',
  'RR': 'Norte',
  'TO': 'Norte',
  
  // Nordeste
  'AL': 'Nordeste',
  'BA': 'Nordeste',
  'CE': 'Nordeste',
  'MA': 'Nordeste',
  'PB': 'Nordeste',
  'PE': 'Nordeste',
  'PI': 'Nordeste',
  'RN': 'Nordeste',
  'SE': 'Nordeste',
  
  // Centro-Oeste
  'DF': 'Centro-Oeste',
  'GO': 'Centro-Oeste',
  'MT': 'Centro-Oeste',
  'MS': 'Centro-Oeste',
  
  // Sudeste
  'ES': 'Sudeste',
  'MG': 'Sudeste',
  'RJ': 'Sudeste',
  'SP': 'Sudeste',
  
  // Sul
  'PR': 'Sul',
  'RS': 'Sul',
  'SC': 'Sul',
};

export type Region = 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';

export function getRegionFromEstado(estado: string | null): string | null {
  if (!estado) {
    return null;
  }
  
  // Tenta encontrar pelo nome completo do estado
  const region = estadoToRegion[estado];
  if (region) {
    return region;
  }
  
  // Se não encontrou, tenta pela sigla
  const sigla = estado.toUpperCase();
  return siglaToRegion[sigla] || null;
}

export function getAvailableRegions(): Region[] {
  return ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
}

export function getEstadosByRegion(region: Region): string[] {
  return Object.entries(estadoToRegion)
    .filter(([_, reg]) => reg === region)
    .map(([estado, _]) => estado)
    .sort();
}

