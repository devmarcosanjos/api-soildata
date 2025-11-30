# Endpoints Disponíveis - API SoilData

## Base URL
- **Desenvolvimento:** `http://localhost:3000`
- **Produção:** `https://api.soildata.cmob.online`

## Endpoints Gerais

### GET /
Informações da API e lista de endpoints disponíveis

### GET /health
Health check da API

## Datasets

### GET /api/datasets
Lista datasets com paginação

**Query Parameters:**
- `limit` (number, padrão: 10) - Número de resultados por página
- `offset` (number, padrão: 0) - Número de resultados para pular
- `sort` (string, padrão: 'date') - Campo para ordenação
- `order` ('asc' | 'desc', padrão: 'desc') - Ordem de classificação
- `q` (string, padrão: '*') - Query de busca

### GET /api/datasets/latest
Últimos N datasets

**Query Parameters:**
- `limit` (number, padrão: 6) - Número de datasets a retornar

### GET /api/datasets/search
Busca datasets

**Query Parameters:**
- `q` (string, obrigatório) - Termo de busca
- `limit` (number, padrão: 10) - Número de resultados por página
- `offset` (number, padrão: 0) - Número de resultados para pular

## Métricas

### GET /api/metrics/datasets
Total de datasets

**Query Parameters (opcionais):**
- `parentAlias` (string)
- `dataLocation` ('local' | 'remote' | 'all')
- `country` (string)

### GET /api/metrics/downloads
Total de downloads

### GET /api/metrics/files
Total de arquivos

### GET /api/metrics/dataverses
Total de dataverses

### GET /api/metrics/monthly/downloads
Downloads mensais

### GET /api/metrics/monthly/datasets
Datasets mensais

### GET /api/metrics/monthly/files
Arquivos mensais

### GET /api/metrics/downloads/past-days/:days
Downloads dos últimos N dias

**Path Parameters:**
- `days` (number, obrigatório) - Número de dias

### GET /api/metrics/datasets/past-days/:days
Datasets dos últimos N dias

**Path Parameters:**
- `days` (number, obrigatório) - Número de dias

### GET /api/metrics/datasets/by-subject
Datasets por assunto

### GET /api/metrics/dataverses/by-category
Dataverses por categoria

### GET /api/metrics/file-downloads
Downloads por arquivo

### GET /api/metrics/monthly/file-downloads
Downloads mensais por arquivo

### GET /api/metrics/tree
Árvore de dataverses

## Dados de Solo

### GET /api/soil-data
Lista pontos de solo com filtros e paginação

**Query Parameters:**
- `limit` (number) - Número de resultados por página
- `offset` (number, padrão: 0) - Número de resultados para pular
- `state` (string) - Filtrar por estado
- `municipality` (string) - Filtrar por município
- `biome` (string) - Filtrar por bioma
- `datasetCode` (string) - Filtrar por código do dataset

### GET /api/soil-data/summary
Resumo dos dados de solo

### GET /api/soil-data/stats
Estatísticas detalhadas dos dados de solo

### GET /api/soil-data/filters
Valores disponíveis para filtros (estados, biomas, códigos de dataset)

### GET /api/soil-data/metadata
Metadados do arquivo de dados de solo

## PSD Platform

### GET /api/psd-platform
Lista dados de granulometria de solo (PSD Platform) com filtros e paginação

**Query Parameters:**
- `dataset_id` (string, opcional) - Filtrar por ID do dataset
- `ano` (number, opcional) - Filtrar por ano
- `limit` (number, padrão: 100, máximo: 1000) - Número de resultados por página
- `offset` (number, padrão: 0) - Número de resultados para pular

**Exemplo de Resposta:**
```json
{
  "success": true,
  "total": 41924,
  "returned": 100,
  "pagination": {
    "limit": 100,
    "offset": 0
  },
  "filters": {
    "dataset_id": null,
    "ano": null
  },
  "data": [
    {
      "dataset_id": "ctb0003",
      "observacao_id": "sm-dnos-001",
      "longitude_grau": -53.794645,
      "latitude_grau": -29.651271,
      "ano": 2009,
      "camada_id": 1,
      "profundidade_inicial_cm": 0,
      "profundidade_final_cm": 20,
      "fracao_grossa_gkg": 0,
      "fracao_argila_gkg": 44,
      "fracao_silte_gkg": 44,
      "fracao_areia_gkg": 912
    }
  ]
}
```

**Notas:**
- Paginação é obrigatória (máximo 1000 registros por request)
- Filtros podem ser combinados (dataset_id, ano, biome e estado)
- Dados são cacheados em memória por 5 minutos
- Índices pré-calculados melhoram performance de filtros
- Biomas disponíveis: Amazônia, Cerrado, Mata Atlântica, Caatinga, Pampa, Pantanal

### GET /api/psd-platform/all
Retorna todos os dados de granulometria de solo sem paginação

**Query Parameters:**
- `dataset_id` (string, opcional) - Filtrar por ID do dataset
- `ano` (number, opcional) - Filtrar por ano
- `biome` (string, opcional) - Filtrar por bioma (ex: "Amazônia", "Cerrado", "Mata Atlântica", "Caatinga", "Pampa", "Pantanal")
- `estado` (string, opcional) - Filtrar por estado (ex: "São Paulo", "Rio de Janeiro", "Minas Gerais")

**Exemplo de Resposta:**
```json
{
  "success": true,
  "total": 41924,
  "filters": {
    "dataset_id": null,
    "ano": null
  },
  "data": [
    // ... todos os 41.924 registros
  ]
}
```

**Notas:**
- Retorna todos os registros sem paginação
- Use com cuidado - resposta pode ser grande (~17MB)
- Filtros podem ser aplicados para reduzir o tamanho da resposta
- Útil para downloads completos ou processamento em lote

### GET /api/psd-platform/biome/:biome
Retorna todos os dados de um bioma específico sem paginação

**Path Parameters:**
- `biome` (string, obrigatório) - Nome do bioma (ex: "Amazônia", "Cerrado", "Mata Atlântica", "Caatinga", "Pampa", "Pantanal")

**Query Parameters:**
- `dataset_id` (string, opcional) - Filtrar por ID do dataset
- `ano` (number, opcional) - Filtrar por ano

**Exemplo de Requisição:**
```
GET /api/psd-platform/biome/Amazônia
GET /api/psd-platform/biome/Cerrado?ano=2020
```

**Exemplo de Resposta:**
```json
{
  "success": true,
  "biome": "Amazônia",
  "total": 26050,
  "filters": {
    "dataset_id": null,
    "ano": null
  },
  "data": [
    {
      "dataset_id": "ctb0001",
      "observacao_id": "sm-dnos-001",
      "longitude_grau": -60.123456,
      "latitude_grau": -3.456789,
      "ano": 2010,
      "camada_id": 1,
      "profundidade_inicial_cm": 0,
      "profundidade_final_cm": 20,
      "fracao_grossa_gkg": 0,
      "fracao_argila_gkg": 102,
      "fracao_silte_gkg": 163,
      "fracao_areia_gkg": 735,
      "biome": "Amazônia"
    }
  ]
}
```

**Notas:**
- Retorna todos os registros do bioma sem paginação
- O nome do bioma deve corresponder exatamente (case-sensitive)
- Biomas disponíveis: Amazônia, Cerrado, Mata Atlântica, Caatinga, Pampa, Pantanal
- Filtros adicionais (dataset_id, ano) podem ser combinados

### GET /api/psd-platform/biome/:biome/paginated
Retorna dados de um bioma específico com paginação

**Path Parameters:**
- `biome` (string, obrigatório) - Nome do bioma

**Query Parameters:**
- `limit` (number, opcional, padrão: 100) - Número de registros por página (máximo: 1000)
- `offset` (number, opcional, padrão: 0) - Número de registros a pular
- `dataset_id` (string, opcional) - Filtrar por ID do dataset
- `ano` (number, opcional) - Filtrar por ano
- `biome` (string, opcional) - Filtrar por bioma (ex: "Amazônia", "Cerrado", "Mata Atlântica", "Caatinga", "Pampa", "Pantanal")
- `estado` (string, opcional) - Filtrar por estado (ex: "São Paulo", "Rio de Janeiro", "Minas Gerais")

**Exemplo de Requisição:**
```
GET /api/psd-platform/biome/Mata%20Atlântica/paginated?limit=50&offset=0
GET /api/psd-platform/biome/Cerrado/paginated?ano=2020&limit=100
```

**Exemplo de Resposta:**
```json
{
  "success": true,
  "biome": "Mata Atlântica",
  "total": 7981,
  "returned": 50,
  "pagination": {
    "limit": 50,
    "offset": 0
  },
  "filters": {
    "dataset_id": null,
    "ano": null
  },
  "data": [
    // ... 50 registros
  ]
}
```

**Notas:**
- Paginação é obrigatória (máximo 1000 registros por request)
- Útil para exibição em tabelas ou listas paginadas
- Filtros podem ser combinados

### GET /api/psd-platform/biomes
Retorna lista de biomas disponíveis

**Exemplo de Resposta:**
```json
{
  "success": true,
  "biomes": [
    "Amazônia",
    "Caatinga",
    "Cerrado",
    "Mata Atlântica",
    "Pampa",
    "Pantanal"
  ],
  "total": 6
}
```

**Notas:**
- Retorna todos os biomas disponíveis no sistema
- Útil para popular dropdowns ou listas de seleção

### GET /api/psd-platform/estado/:estado
Retorna todos os dados de um estado específico sem paginação

**Path Parameters:**
- `estado` (string, obrigatório) - Nome do estado (ex: "São Paulo", "Rio de Janeiro", "Minas Gerais")

**Query Parameters:**
- `dataset_id` (string, opcional) - Filtrar por ID do dataset
- `ano` (number, opcional) - Filtrar por ano
- `biome` (string, opcional) - Filtrar por bioma

**Exemplo de Requisição:**
```
GET /api/psd-platform/estado/São%20Paulo
GET /api/psd-platform/estado/Rio%20Grande%20do%20Sul?ano=2020
```

**Exemplo de Resposta:**
```json
{
  "success": true,
  "estado": "São Paulo",
  "total": 412,
  "filters": {
    "dataset_id": null,
    "ano": null,
    "biome": null
  },
  "data": [
    {
      "dataset_id": "ctb0001",
      "observacao_id": "sm-dnos-001",
      "longitude_grau": -46.123456,
      "latitude_grau": -23.456789,
      "ano": 2010,
      "camada_id": 1,
      "profundidade_inicial_cm": 0,
      "profundidade_final_cm": 20,
      "fracao_grossa_gkg": 0,
      "fracao_argila_gkg": 102,
      "fracao_silte_gkg": 163,
      "fracao_areia_gkg": 735,
      "biome": "Mata Atlântica",
      "estado": "São Paulo"
    }
  ]
}
```

**Notas:**
- Retorna todos os registros do estado sem paginação
- O nome do estado deve corresponder exatamente (case-sensitive)
- Filtros adicionais (dataset_id, ano, biome) podem ser combinados

### GET /api/psd-platform/estado/:estado/paginated
Retorna dados de um estado específico com paginação

**Path Parameters:**
- `estado` (string, obrigatório) - Nome do estado

**Query Parameters:**
- `limit` (number, opcional, padrão: 100) - Número de registros por página (máximo: 1000)
- `offset` (number, opcional, padrão: 0) - Número de registros a pular
- `dataset_id` (string, opcional) - Filtrar por ID do dataset
- `ano` (number, opcional) - Filtrar por ano
- `biome` (string, opcional) - Filtrar por bioma

**Exemplo de Requisição:**
```
GET /api/psd-platform/estado/Minas%20Gerais/paginated?limit=50&offset=0
GET /api/psd-platform/estado/Pará/paginated?ano=2020&limit=100
```

**Exemplo de Resposta:**
```json
{
  "success": true,
  "estado": "Minas Gerais",
  "total": 2517,
  "returned": 50,
  "pagination": {
    "limit": 50,
    "offset": 0
  },
  "filters": {
    "dataset_id": null,
    "ano": null,
    "biome": null
  },
  "data": [
    // ... 50 registros
  ]
}
```

**Notas:**
- Paginação é obrigatória (máximo 1000 registros por request)
- Útil para exibição em tabelas ou listas paginadas
- Filtros podem ser combinados

### GET /api/psd-platform/estados
Retorna lista de estados disponíveis

**Exemplo de Resposta:**
```json
{
  "success": true,
  "estados": [
    "Acre",
    "Alagoas",
    "Amapá",
    "Amazonas",
    "Bahia",
    "Ceará",
    "Distrito Federal",
    "Espírito Santo",
    "Goiás",
    "Maranhão",
    "Mato Grosso",
    "Mato Grosso do Sul",
    "Minas Gerais",
    "Pará",
    "Paraíba",
    "Paraná",
    "Pernambuco",
    "Piauí",
    "Rio de Janeiro",
    "Rio Grande do Norte",
    "Rio Grande do Sul",
    "Roraima",
    "Santa Catarina",
    "São Paulo",
    "Sergipe",
    "Tocantins"
  ],
  "total": 26
}
```

**Notas:**
- Retorna todos os estados disponíveis no sistema
- Útil para popular dropdowns ou listas de seleção

## Estatísticas

### GET /api/statistics
Estatísticas gerais combinadas (dados de solo + métricas do Dataverse)

### GET /api/statistics/monthly
Estatísticas mensais combinadas

