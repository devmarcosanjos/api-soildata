# API SoilData

API REST para dados e métricas do SoilData, construída com Fastify + TypeScript.

## Instalação

```bash
pnpm install
```

## Desenvolvimento

```bash
pnpm dev
```

A API estará rodando em `http://localhost:3000`

## Build

```bash
pnpm build
pnpm start
```

## Endpoints

### Health Check
- `GET /health` - Verifica se a API está funcionando

### Datasets
- `GET /api/datasets` - Lista datasets com paginação
- `GET /api/datasets/latest` - Últimos N datasets
- `GET /api/datasets/search` - Busca datasets

### Métricas
- `GET /api/metrics/datasets` - Total de datasets
- `GET /api/metrics/downloads` - Total de downloads
- `GET /api/metrics/files` - Total de arquivos
- `GET /api/metrics/monthly/*` - Métricas mensais

### Dados de Solo
- `GET /api/soil-data` - Lista pontos de solo
- `GET /api/soil-data/summary` - Resumo dos dados
- `GET /api/soil-data/stats` - Estatísticas detalhadas
- `GET /api/soil-data/filters` - Valores para filtros

## Estrutura

```
src/
├── server.ts           # Servidor Fastify
├── routes/            # Rotas da API
├── services/           # Serviços de integração
├── types/             # Tipos TypeScript
└── utils/             # Utilitários
```

