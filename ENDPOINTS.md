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
- Filtros podem ser combinados (dataset_id e ano)
- Dados são cacheados em memória por 5 minutos
- Índices pré-calculados melhoram performance de filtros

## Estatísticas

### GET /api/statistics
Estatísticas gerais combinadas (dados de solo + métricas do Dataverse)

### GET /api/statistics/monthly
Estatísticas mensais combinadas

