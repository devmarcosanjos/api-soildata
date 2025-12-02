# API SoilData

## Endpoints Disponíveis

### Health Check
- `GET /health` - Status da API

### Datasets
- `GET /api/datasets` - Lista datasets
- `GET /api/datasets/latest` - Últimos datasets
- `GET /api/datasets/search` - Busca datasets

### Métricas
- `GET /api/metrics/datasets` - Total de datasets
- `GET /api/metrics/downloads` - Total de downloads
- `GET /api/metrics/files` - Total de arquivos
- `GET /api/metrics/dataverses` - Total de dataverses
- `GET /api/metrics/monthly/downloads` - Downloads mensais
- `GET /api/metrics/monthly/datasets` - Datasets mensais
- `GET /api/metrics/monthly/files` - Arquivos mensais
- `GET /api/metrics/downloads/past-days/:days` - Downloads dos últimos N dias
- `GET /api/metrics/datasets/past-days/:days` - Datasets dos últimos N dias
- `GET /api/metrics/datasets/by-subject` - Datasets por assunto
- `GET /api/metrics/dataverses/by-category` - Dataverses por categoria
- `GET /api/metrics/file-downloads` - Downloads por arquivo
- `GET /api/metrics/monthly/file-downloads` - Downloads mensais por arquivo
- `GET /api/metrics/tree` - Árvore de dataverses

### Dados de Solo
- `GET /api/soil-data` - Lista pontos de solo
- `GET /api/soil-data/summary` - Resumo dos dados
- `GET /api/soil-data/stats` - Estatísticas
- `GET /api/soil-data/filters` - Filtros disponíveis
- `GET /api/soil-data/metadata` - Metadados

### Estatísticas
- `GET /api/statistics` - Estatísticas gerais
- `GET /api/statistics/monthly` - Estatísticas mensais

### Granulometria
- `GET /api/granulometry` - Dados de granulometria
- `GET /api/granulometry/summary` - Resumo
- `GET /api/granulometry/stats` - Estatísticas
- `GET /api/granulometry/filters` - Filtros disponíveis
- `GET /api/granulometry/metadata` - Metadados
- `GET /api/granulometry/fractions` - Análise de frações

