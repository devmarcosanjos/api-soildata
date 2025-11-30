# API SoilData - Documentação de Endpoints

## Base URL
- **Desenvolvimento:** `http://localhost:3000`
- **Produção:** `https://api.soildata.cmob.online`

---

## Health Check

### GET /health
Verifica o status da API.

**Exemplo de Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2023-10-27T10:00:00.000Z",
  "uptime": 123.45
}
```

---

## Datasets

### GET /api/datasets
Retorna uma lista paginada de datasets.

**Query Parameters:**
- `limit` (number, opcional, padrão: 10) - Número de resultados por página
- `offset` (number, opcional, padrão: 0) - Número de resultados para pular
- `sort` (string, opcional, padrão: 'date') - Campo para ordenação (ex: 'date', 'name')
- `order` (string, opcional, padrão: 'desc') - Ordem da classificação ('asc' ou 'desc')
- `q` (string, opcional, padrão: '*') - Termo de busca (suporta curingas como '*')

**Exemplo de Requisição:**
```
GET /api/datasets?limit=5&offset=0&sort=name&order=asc&q=soil*
```

**Exemplo de Resposta:**
```json
{
  "success": true,
  "total": 100,
  "returned": 5,
  "pagination": {
    "limit": 5,
    "offset": 0
  },
  "data": [
    {
      "id": "dataset1",
      "name": "Soil Data Brazil",
      "description": "Comprehensive soil data for Brazil.",
      "date": "2023-01-15T10:00:00Z",
      "url": "https://dataverse.example.com/dataset1"
    }
  ]
}
```

### GET /api/datasets/latest
Retorna os datasets mais recentes.

**Query Parameters:**
- `limit` (number, opcional, padrão: 6) - Número máximo de datasets a retornar

**Exemplo de Requisição:**
```
GET /api/datasets/latest?limit=3
```

**Exemplo de Resposta:**
```json
{
  "success": true,
  "total": 3,
  "data": [
    {
      "id": "dataset3",
      "name": "Latest Soil Survey",
      "date": "2023-10-20T14:30:00Z"
    }
  ]
}
```

---

## Métricas

### GET /api/metrics/files
Retorna métricas de arquivos.

### GET /api/metrics/monthly/downloads
Retorna métricas de downloads mensais.

---

## Dados de Solo Enriquecidos (Legado)

### GET /api/soil-data
Retorna dados de solo enriquecidos com filtros e paginação.

**Query Parameters:**
- `limit` (number, opcional, padrão: 100) - Número de resultados por página (máximo: 1000)
- `offset` (number, opcional, padrão: 0) - Número de resultados para pular
- `datasetCode` (string, opcional) - Filtrar por código do dataset
- `year` (number, opcional) - Filtrar por ano
- `country` (string, opcional) - Filtrar por país
- `state` (string, opcional) - Filtrar por estado
- `municipality` (string, opcional) - Filtrar por município
- `biome` (string, opcional) - Filtrar por bioma

**Exemplo de Requisição:**
```
GET /api/soil-data?limit=10&offset=0&year=2020&biome=Cerrado
```

---

## PSD Platform Data (Dados de Granulometria de Solo)

### GET /api/psd-platform
Retorna dados de granulometria de solo com filtros e paginação.

**Query Parameters:**
- `limit` (number, opcional, padrão: 100) - Número de registros por página (máximo: 1000)
- `offset` (number, opcional, padrão: 0) - Número de registros para pular
- `dataset_id` (string, opcional) - Filtrar por ID do dataset
- `ano` (number, opcional) - Filtrar por ano
- `biome` (string, opcional) - Filtrar por bioma (ex: "Amazônia", "Cerrado", "Mata Atlântica", "Caatinga", "Pampa", "Pantanal")
- `estado` (string, opcional) - Filtrar por estado (nome completo ou sigla, ex: "Paraná", "PR")
- `municipio` (string, opcional) - Filtrar por município (ex: "Curitiba", "São Paulo")
- `regiao` (string, opcional) - Filtrar por região (ex: "Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul")

**Exemplo de Requisição:**
```
GET /api/psd-platform?limit=10&offset=0&ano=2010&biome=Cerrado&estado=GO&regiao=Centro-Oeste
```

**Exemplo de Resposta:**
```json
{
  "success": true,
  "total": 41924,
  "returned": 10,
  "pagination": {
    "limit": 10,
    "offset": 0
  },
  "filters": {
    "dataset_id": null,
    "ano": 2010,
    "biome": "Cerrado",
    "estado": "Goiás",
    "municipio": null,
    "regiao": "Centro-Oeste"
  },
  "data": [
    {
      "dataset_id": "ctb0003",
      "observacao_id": "sm-dnos-001",
      "longitude_grau": -53.794645,
      "latitude_grau": -29.651271,
      "ano": 2010,
      "camada_id": 1,
      "profundidade_inicial_cm": 0,
      "profundidade_final_cm": 20,
      "fracao_grossa_gkg": 0,
      "fracao_argila_gkg": 44,
      "fracao_silte_gkg": 44,
      "fracao_areia_gkg": 912,
      "biome": "Cerrado",
      "estado": "Goiás",
      "municipio": "Goiânia",
      "regiao": "Centro-Oeste"
    }
  ]
}
```

**Notas:**
- Paginação é obrigatória (máximo 1000 registros por request)
- Filtros podem ser combinados (dataset_id, ano, biome, estado, municipio, regiao)
- Dados são cacheados em memória por 5 minutos
- Índices pré-calculados melhoram performance de filtros
- Biomas disponíveis: Amazônia, Caatinga, Cerrado, Mata Atlântica, Pampa, Pantanal
- Regiões disponíveis: Norte, Nordeste, Centro-Oeste, Sudeste, Sul

---

### GET /api/psd-platform/all
Retorna todos os dados de granulometria de solo sem paginação.

**Query Parameters:**
- `dataset_id` (string, opcional) - Filtrar por ID do dataset
- `ano` (number, opcional) - Filtrar por ano
- `biome` (string, opcional) - Filtrar por bioma
- `estado` (string, opcional) - Filtrar por estado (nome completo ou sigla)
- `municipio` (string, opcional) - Filtrar por município
- `regiao` (string, opcional) - Filtrar por região

**Exemplo de Requisição:**
```
GET /api/psd-platform/all?estado=SP&biome=Mata%20Atlântica&regiao=Sudeste
```

**Exemplo de Resposta:**
```json
{
  "success": true,
  "total": 41924,
  "filters": {
    "dataset_id": null,
    "ano": null,
    "biome": "Mata Atlântica",
    "estado": "São Paulo",
    "municipio": null,
    "regiao": "Sudeste"
  },
  "data": [
    // ... todos os registros filtrados
  ]
}
```

**Notas:**
- Retorna todos os registros sem paginação
- Use com cuidado - resposta pode ser grande (~17MB)
- Filtros podem ser aplicados para reduzir o tamanho da resposta
- Útil para downloads completos ou processamento em lote

---

### GET /api/psd-platform/biome/:biome
Retorna todos os dados de um bioma específico (sem paginação).

**Path Parameters:**
- `biome` (string, obrigatório) - Nome do bioma (ex: "Amazônia", "Cerrado", "Mata Atlântica", "Caatinga", "Pampa", "Pantanal")

**Query Parameters:**
- `dataset_id` (string, opcional) - Filtrar por ID do dataset
- `ano` (number, opcional) - Filtrar por ano
- `estado` (string, opcional) - Filtrar por estado (nome completo ou sigla)
- `municipio` (string, opcional) - Filtrar por município
- `regiao` (string, opcional) - Filtrar por região

**Exemplo de Requisição:**
```
GET /api/psd-platform/biome/Amazônia
GET /api/psd-platform/biome/Cerrado?ano=2020&estado=GO&regiao=Centro-Oeste
```

**Exemplo de Resposta:**
```json
{
  "success": true,
  "biome": "Amazônia",
  "total": 26050,
  "filters": {
    "dataset_id": null,
    "ano": null,
    "estado": null,
    "municipio": null,
    "regiao": null
  },
  "data": [
    // ... todos os registros da Amazônia
  ]
}
```

**Notas:**
- Retorna todos os registros do bioma especificado sem paginação
- Filtros adicionais (dataset_id, ano, estado, municipio, regiao) podem ser combinados

---

### GET /api/psd-platform/biome/:biome/paginated
Retorna dados de um bioma específico com paginação.

**Path Parameters:**
- `biome` (string, obrigatório) - Nome do bioma

**Query Parameters:**
- `limit` (number, opcional, padrão: 100) - Número de registros por página (máximo: 1000)
- `offset` (number, opcional, padrão: 0) - Número de registros a pular
- `dataset_id` (string, opcional) - Filtrar por ID do dataset
- `ano` (number, opcional) - Filtrar por ano
- `estado` (string, opcional) - Filtrar por estado (nome completo ou sigla)
- `municipio` (string, opcional) - Filtrar por município
- `regiao` (string, opcional) - Filtrar por região

**Exemplo de Requisição:**
```
GET /api/psd-platform/biome/Mata%20Atlântica/paginated?limit=50&offset=0&estado=SP
GET /api/psd-platform/biome/Cerrado/paginated?ano=2020&limit=100&estado=GO&regiao=Centro-Oeste
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
    "ano": null,
    "estado": "São Paulo",
    "municipio": null,
    "regiao": null
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

---

### GET /api/psd-platform/biomes
Retorna lista de biomas disponíveis.

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

---

### GET /api/psd-platform/estado/:estado
Retorna todos os dados de um estado específico (sem paginação).

**Path Parameters:**
- `estado` (string, obrigatório) - Nome do estado (nome completo ou sigla, ex: "Paraná", "PR")

**Query Parameters:**
- `dataset_id` (string, opcional) - Filtrar por ID do dataset
- `ano` (number, opcional) - Filtrar por ano
- `biome` (string, opcional) - Filtrar por bioma
- `municipio` (string, opcional) - Filtrar por município
- `regiao` (string, opcional) - Filtrar por região

**Exemplo de Requisição:**
```
GET /api/psd-platform/estado/Paraná
GET /api/psd-platform/estado/PR?ano=2015&biome=Mata%20Atlântica
GET /api/psd-platform/estado/SP?municipio=São%20Paulo
```

**Exemplo de Resposta:**
```json
{
  "success": true,
  "estado": "Paraná",
  "sigla": "PR",
  "total": 1040,
  "filters": {
    "dataset_id": null,
    "ano": 2015,
    "biome": "Mata Atlântica",
    "municipio": null,
    "regiao": null
  },
  "data": [
    // ... todos os registros do Paraná
  ]
}
```

**Notas:**
- Retorna todos os registros do estado especificado sem paginação
- Aceita tanto o nome completo do estado quanto sua sigla (case-insensitive)
- Filtros adicionais (dataset_id, ano, biome, municipio, regiao) podem ser combinados
- A resposta inclui o campo `sigla` quando uma sigla é usada na requisição

---

### GET /api/psd-platform/estado/:estado/paginated
Retorna dados de um estado específico com paginação.

**Path Parameters:**
- `estado` (string, obrigatório) - Nome do estado (nome completo ou sigla, ex: "Paraná", "PR")

**Query Parameters:**
- `limit` (number, opcional, padrão: 100) - Número de registros por página (máximo: 1000)
- `offset` (number, opcional, padrão: 0) - Número de registros a pular
- `dataset_id` (string, opcional) - Filtrar por ID do dataset
- `ano` (number, opcional) - Filtrar por ano
- `biome` (string, opcional) - Filtrar por bioma
- `municipio` (string, opcional) - Filtrar por município
- `regiao` (string, opcional) - Filtrar por região

**Exemplo de Requisição:**
```
GET /api/psd-platform/estado/Rio%20Grande%20do%20Sul/paginated?limit=50
GET /api/psd-platform/estado/RS/paginated?ano=2018&limit=100
GET /api/psd-platform/estado/SP/paginated?municipio=São%20Paulo&limit=50
```

**Exemplo de Resposta:**
```json
{
  "success": true,
  "estado": "Rio Grande do Sul",
  "sigla": "RS",
  "total": 4653,
  "returned": 50,
  "pagination": {
    "limit": 50,
    "offset": 0
  },
  "filters": {
    "dataset_id": null,
    "ano": 2018,
    "biome": null,
    "municipio": null,
    "regiao": null
  },
  "data": [
    // ... 50 registros
  ]
}
```

**Notas:**
- Paginação é obrigatória (máximo 1000 registros por request)
- Aceita tanto o nome completo do estado quanto sua sigla (case-insensitive)
- Útil para exibição em tabelas ou listas paginadas
- Filtros podem ser combinados

---

### GET /api/psd-platform/estados
Retorna lista de estados disponíveis.

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
    "Rondônia",
    "Roraima",
    "Santa Catarina",
    "São Paulo",
    "Sergipe",
    "Tocantins"
  ],
  "total": 27
}
```

**Notas:**
- Retorna todos os estados disponíveis no sistema
- Útil para popular dropdowns ou listas de seleção

---

### GET /api/psd-platform/municipio/:municipio
Retorna todos os dados de um município específico (sem paginação).

**Path Parameters:**
- `municipio` (string, obrigatório) - Nome do município (ex: "Curitiba", "São Paulo", "Rio de Janeiro")

**Query Parameters:**
- `dataset_id` (string, opcional) - Filtrar por ID do dataset
- `ano` (number, opcional) - Filtrar por ano
- `biome` (string, opcional) - Filtrar por bioma
- `estado` (string, opcional) - Filtrar por estado (nome completo ou sigla)
- `regiao` (string, opcional) - Filtrar por região

**Exemplo de Requisição:**
```
GET /api/psd-platform/municipio/Curitiba
GET /api/psd-platform/municipio/São%20Paulo?ano=2015&estado=SP
GET /api/psd-platform/municipio/Rio%20de%20Janeiro?regiao=Sudeste
```

**Exemplo de Resposta:**
```json
{
  "success": true,
  "municipio": "Curitiba",
  "total": 245,
  "filters": {
    "dataset_id": null,
    "ano": 2015,
    "biome": null,
    "estado": "Paraná",
    "regiao": null
  },
  "data": [
    // ... todos os registros de Curitiba
  ]
}
```

**Notas:**
- Retorna todos os registros do município especificado sem paginação
- Filtros adicionais (dataset_id, ano, biome, estado, regiao) podem ser combinados
- O nome do município deve corresponder exatamente (case-insensitive)

---

### GET /api/psd-platform/municipio/:municipio/paginated
Retorna dados de um município específico com paginação.

**Path Parameters:**
- `municipio` (string, obrigatório) - Nome do município

**Query Parameters:**
- `limit` (number, opcional, padrão: 100) - Número de registros por página (máximo: 1000)
- `offset` (number, opcional, padrão: 0) - Número de registros a pular
- `dataset_id` (string, opcional) - Filtrar por ID do dataset
- `ano` (number, opcional) - Filtrar por ano
- `biome` (string, opcional) - Filtrar por bioma
- `estado` (string, opcional) - Filtrar por estado (nome completo ou sigla)
- `regiao` (string, opcional) - Filtrar por região

**Exemplo de Requisição:**
```
GET /api/psd-platform/municipio/Curitiba/paginated?limit=50
GET /api/psd-platform/municipio/São%20Paulo/paginated?ano=2018&limit=100&estado=SP
```

**Exemplo de Resposta:**
```json
{
  "success": true,
  "municipio": "Curitiba",
  "total": 245,
  "returned": 50,
  "pagination": {
    "limit": 50,
    "offset": 0
  },
  "filters": {
    "dataset_id": null,
    "ano": 2018,
    "biome": null,
    "estado": "Paraná",
    "regiao": null
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

---

### GET /api/psd-platform/municipios
Retorna lista de municípios disponíveis.

**Exemplo de Resposta:**
```json
{
  "success": true,
  "municipios": [
    "Acrelândia",
    "Afonso Cláudio",
    "Água Branca",
    // ... todos os municípios
  ],
  "total": 5570
}
```

**Notas:**
- Retorna todos os municípios disponíveis no sistema
- Útil para popular dropdowns ou listas de seleção
- A lista pode ser grande (milhares de municípios)

---

### GET /api/psd-platform/regiao/:regiao
Retorna todos os dados de uma região específica (sem paginação).

**Path Parameters:**
- `regiao` (string, obrigatório) - Nome da região (ex: "Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul")

**Query Parameters:**
- `dataset_id` (string, opcional) - Filtrar por ID do dataset
- `ano` (number, opcional) - Filtrar por ano
- `biome` (string, opcional) - Filtrar por bioma
- `estado` (string, opcional) - Filtrar por estado (nome completo ou sigla)
- `municipio` (string, opcional) - Filtrar por município

**Exemplo de Requisição:**
```
GET /api/psd-platform/regiao/Sul
GET /api/psd-platform/regiao/Sudeste?ano=2015&estado=SP
GET /api/psd-platform/regiao/Norte?biome=Amazônia
```

**Exemplo de Resposta:**
```json
{
  "success": true,
  "regiao": "Sul",
  "total": 12450,
  "filters": {
    "dataset_id": null,
    "ano": 2015,
    "biome": null,
    "estado": "São Paulo",
    "municipio": null
  },
  "data": [
    // ... todos os registros da região Sul
  ]
}
```

**Notas:**
- Retorna todos os registros da região especificada sem paginação
- Regiões disponíveis: Norte, Nordeste, Centro-Oeste, Sudeste, Sul
- Filtros adicionais (dataset_id, ano, biome, estado, municipio) podem ser combinados

---

### GET /api/psd-platform/regiao/:regiao/paginated
Retorna dados de uma região específica com paginação.

**Path Parameters:**
- `regiao` (string, obrigatório) - Nome da região

**Query Parameters:**
- `limit` (number, opcional, padrão: 100) - Número de registros por página (máximo: 1000)
- `offset` (number, opcional, padrão: 0) - Número de registros a pular
- `dataset_id` (string, opcional) - Filtrar por ID do dataset
- `ano` (number, opcional) - Filtrar por ano
- `biome` (string, opcional) - Filtrar por bioma
- `estado` (string, opcional) - Filtrar por estado (nome completo ou sigla)
- `municipio` (string, opcional) - Filtrar por município

**Exemplo de Requisição:**
```
GET /api/psd-platform/regiao/Sudeste/paginated?limit=50
GET /api/psd-platform/regiao/Norte/paginated?ano=2018&limit=100&biome=Amazônia
```

**Exemplo de Resposta:**
```json
{
  "success": true,
  "regiao": "Sudeste",
  "total": 15234,
  "returned": 50,
  "pagination": {
    "limit": 50,
    "offset": 0
  },
  "filters": {
    "dataset_id": null,
    "ano": 2018,
    "biome": null,
    "estado": null,
    "municipio": null
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

---

### GET /api/psd-platform/regioes
Retorna lista de regiões disponíveis.

**Exemplo de Resposta:**
```json
{
  "success": true,
  "regioes": [
    "Norte",
    "Nordeste",
    "Centro-Oeste",
    "Sudeste",
    "Sul"
  ],
  "total": 5
}
```

**Notas:**
- Retorna todas as regiões do Brasil
- Útil para popular dropdowns ou listas de seleção

---

## Estatísticas

### GET /api/statistics
Estatísticas gerais combinadas (dados de solo + métricas do Dataverse)

### GET /api/statistics/monthly
Estatísticas mensais combinadas

---

## Estrutura de Dados

### PSDRecord
Cada registro de dados PSD Platform contém:

```typescript
{
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
  biome: string | null;        // Enriquecido automaticamente
  estado: string | null;       // Enriquecido automaticamente
  municipio: string | null;    // Enriquecido automaticamente
  regiao: string | null;       // Enriquecido automaticamente
}
```

---

## Notas Importantes

### Cache
- Os dados são cacheados em memória por 5 minutos
- Após 5 minutos, os dados são recarregados do arquivo JSON

### Performance
- Índices pré-calculados melhoram significativamente a performance de filtros
- Use paginação para grandes conjuntos de dados
- Combine filtros para reduzir o tamanho das respostas

### Filtros
- Todos os filtros são case-insensitive
- Filtros podem ser combinados para refinar resultados
- Estados podem ser filtrados por nome completo ou sigla (ex: "Paraná" ou "PR")

### Limites
- Máximo de 1000 registros por página em endpoints paginados
- Use `/all` com cuidado - pode retornar arquivos grandes (~17MB)

### Enriquecimento de Dados
Os dados são automaticamente enriquecidos com:
- **Bioma**: Determinado pelas coordenadas geográficas usando GeoJSON
- **Estado**: Determinado pelas coordenadas geográficas usando GeoJSON
- **Município**: Determinado pelas coordenadas geográficas usando GeoJSON
- **Região**: Determinado automaticamente baseado no estado

---

## Códigos de Status HTTP

- `200 OK` - Requisição bem-sucedida
- `404 Not Found` - Recurso não encontrado (ex: estado, município ou região não encontrados)
- `500 Internal Server Error` - Erro interno do servidor

---

## Exemplos de Uso

### Buscar dados do Paraná em 2015
```
GET /api/psd-platform/estado/PR?ano=2015
```

### Buscar dados do Cerrado no Centro-Oeste
```
GET /api/psd-platform?biome=Cerrado&regiao=Centro-Oeste&limit=100
```

### Buscar dados de Curitiba com paginação
```
GET /api/psd-platform/municipio/Curitiba/paginated?limit=50&offset=0
```

### Buscar todos os dados da região Sul
```
GET /api/psd-platform/regiao/Sul
```

### Listar todos os biomas disponíveis
```
GET /api/psd-platform/biomes
```

### Listar todos os estados disponíveis
```
GET /api/psd-platform/estados
```

### Listar todas as regiões disponíveis
```
GET /api/psd-platform/regioes
```
