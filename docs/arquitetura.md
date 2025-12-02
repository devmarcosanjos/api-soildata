# Arquitetura - API SoilData

## Visão Geral

A API SoilData é uma aplicação REST construída com **Fastify** e **TypeScript**, projetada para fornecer acesso a dados de granulometria e solo do Brasil.

## Gerenciador de Pacotes

### pnpm

Este projeto utiliza **pnpm** como gerenciador de pacotes.

#### Por que pnpm?

- **Performance**: Mais rápido que npm/yarn devido ao sistema de links simbólicos
- **Eficiência de espaço**: Compartilha dependências entre projetos, economizando espaço em disco
- **Segurança**: Estrutura de node_modules mais segura, evitando dependências fantasmas
- **Compatibilidade**: Totalmente compatível com npm e package.json

#### Instalação do pnpm

```bash
# Via npm
npm install -g pnpm

# Via Homebrew (macOS)
brew install pnpm

# Via curl
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

#### Comandos Principais

```bash
# Instalar dependências
pnpm install

# Adicionar dependência
pnpm add <pacote>

# Adicionar dependência de desenvolvimento
pnpm add -D <pacote>

# Remover dependência
pnpm remove <pacote>

# Atualizar dependências
pnpm update

# Executar scripts
pnpm run <script>
```

## Estrutura do Projeto

```
api-soildata/
├── src/                    # Código fonte TypeScript
│   ├── config/            # Configurações da aplicação
│   ├── routes/            # Rotas da API
│   ├── services/          # Lógica de negócio
│   ├── schemas/           # Schemas de validação JSON
│   ├── types/             # Definições TypeScript
│   ├── utils/             # Utilitários
│   ├── data/              # Dados JSON
│   └── server.ts          # Ponto de entrada
├── dist/                  # Código compilado (JavaScript)
├── scripts/               # Scripts auxiliares
├── docs/                  # Documentação
├── node_modules/          # Dependências (gerenciado pelo pnpm)
├── package.json           # Manifesto do projeto
├── pnpm-lock.yaml         # Lock file do pnpm
├── tsconfig.json          # Configuração TypeScript
└── .env.local             # Variáveis de ambiente (local)
```

## Dependências Principais

### Produção

- **fastify**: Framework web rápido e eficiente
- **@fastify/cors**: Plugin CORS para Fastify
- **csv-parse**: Parser de arquivos CSV
- **@turf/boolean-point-in-polygon**: Operações geoespaciais
- **@turf/helpers**: Helpers para operações geoespaciais
- **dotenv**: Carregamento de variáveis de ambiente

### Desenvolvimento

- **typescript**: Compilador TypeScript
- **tsx**: Executor TypeScript para desenvolvimento
- **eslint**: Linter de código
- **prettier**: Formatador de código
- **pino-pretty**: Formatação de logs
- **@types/node**: Tipos TypeScript para Node.js

## Arquitetura de Camadas

### 1. Camada de Configuração (`src/config/`)

- Carrega variáveis de ambiente
- Centraliza configurações da aplicação
- Valida variáveis obrigatórias

### 2. Camada de Rotas (`src/routes/`)

- Define endpoints da API
- Validação de entrada (JSON Schema)
- Tratamento de erros

### 3. Camada de Serviços (`src/services/`)

- Lógica de negócio
- Acesso a dados
- Cache e otimizações

### 4. Camada de Utilitários (`src/utils/`)

- Funções auxiliares
- Classificadores geoespaciais
- Filtros e transformações

### 5. Camada de Tipos (`src/types/`)

- Definições TypeScript
- Interfaces e tipos compartilhados

## Fluxo de Dados

```
Cliente HTTP
    ↓
Fastify Server (server.ts)
    ↓
Routes (routes/*.ts)
    ↓
Schemas (validação)
    ↓
Services (services/*.ts)
    ↓
Data (JSON files ou APIs externas)
    ↓
Response (JSON)
```

## Cache Strategy

- **Cache em memória**: TTL de 5 minutos para dados carregados
- **Cache de resultados**: TTL de 2-3 minutos para queries filtradas
- **Índices pré-calculados**: Para filtros comuns (biome, state, region, etc.)

## Variáveis de Ambiente

Todas as configurações são feitas via variáveis de ambiente:

- `.env.local` - Desenvolvimento
- `.env.production` - Produção

## Build e Deploy

### Desenvolvimento

```bash
pnpm dev  # Usa tsx watch para hot reload
```

### Produção

```bash
pnpm build  # Compila TypeScript para JavaScript
pnpm start  # Executa código compilado
```

## Performance

- **Índices em memória**: Para acesso rápido a dados filtrados
- **Cache de resultados**: Reduz processamento repetitivo
- **Paginação**: Limita tamanho das respostas
- **Lazy loading**: Carrega dados apenas quando necessário

## Segurança

- **Validação de entrada**: JSON Schema em todas as rotas
- **CORS configurável**: Por ambiente
- **Variáveis sensíveis**: Nunca commitadas no git
- **Sanitização**: Parâmetros validados e sanitizados

## Monitoramento

- **Logs estruturados**: Usando Pino
- **Health check**: Endpoint `/health`
- **Error handling**: Centralizado e consistente

