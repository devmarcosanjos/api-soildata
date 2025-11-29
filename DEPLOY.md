# Guia de Deploy - API SoilData no Servidor

## Pré-requisitos

- Acesso SSH ao servidor (187.86.57.254)
- Node.js 18+ instalado no servidor
- PM2 instalado (gerenciador de processos)
- Firewall configurado

## Passo 1: Preparar o Código Localmente

### 1.1 Build da API

```bash
cd api-soildata
pnpm install
pnpm build
```

### 1.2 Verificar se o build foi bem-sucedido

```bash
ls -la dist/
# Deve conter: server.js e outras pastas
```

## Passo 2: Transferir Código para o Servidor

### Opção A: Usando Git (Recomendado)

```bash
# No servidor
cd /var/www/soildata  # ou onde você mantém os projetos
git clone <seu-repositorio> api-soildata
cd api-soildata
git checkout main  # ou branch de produção
```

### Opção B: Usando SCP

```bash
# No seu computador local
cd api-soildata
scp -r dist/ usuario@187.86.57.254:/var/www/soildata/api-soildata/
scp package.json usuario@187.86.57.254:/var/www/soildata/api-soildata/
scp ecosystem.config.js usuario@187.86.57.254:/var/www/soildata/api-soildata/
```

### Opção C: Usando rsync

```bash
# No seu computador local
cd api-soildata
rsync -avz --exclude 'node_modules' --exclude '.git' \
  ./ usuario@187.86.57.254:/var/www/soildata/api-soildata/
```

## Passo 3: Configurar no Servidor

### 3.1 Conectar ao servidor

```bash
ssh usuario@187.86.57.254
```

### 3.2 Instalar dependências

```bash
cd /var/www/soildata/api-soildata
pnpm install --production
# OU se não tiver pnpm:
npm install --production
```

### 3.3 Criar arquivo .env.production

```bash
nano .env.production
```

Conteúdo:
```bash
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
CORS_ORIGINS=https://soildata.cmob.online
SOIL_DATA_PATH=/var/www/soildata/ladingpage-soildata/src/data/enriched-soil-data.json
```

**Ajuste o caminho do `SOIL_DATA_PATH` conforme necessário!**

### 3.4 Verificar se o arquivo de dados existe

```bash
ls -la /var/www/soildata/ladingpage-soildata/src/data/enriched-soil-data.json
# Se não existir, copie ou ajuste o caminho
```

## Passo 4: Instalar e Configurar PM2

### 4.1 Instalar PM2 globalmente (se não tiver)

```bash
npm install -g pm2
```

### 4.2 Iniciar a API com PM2

```bash
cd /var/www/soildata/api-soildata
pm2 start ecosystem.config.js --env production
```

### 4.3 Salvar configuração do PM2

```bash
pm2 save
pm2 startup
# Execute o comando que aparecer (geralmente algo como: sudo env PATH=...)
```

## Passo 5: Configurar Firewall

### 5.1 Abrir porta 3000

```bash
sudo ufw allow 3000/tcp
sudo ufw reload
sudo ufw status
```

## Passo 6: Verificar se está funcionando

### 6.1 Testar localmente no servidor

```bash
curl http://localhost:3000/health
```

### 6.2 Testar externamente

```bash
# Do seu computador local
curl http://187.86.57.254:3000/health
```

### 6.3 Verificar logs

```bash
pm2 logs api-soildata
```

## Passo 7: Configurar Frontend

### 7.1 Atualizar .env.production do frontend

No arquivo `ladingpage-soildata/.env.production`:

```bash
VITE_API_BASE_URL=http://187.86.57.254:3000
VITE_NODE_ENV=production
```

### 7.2 Rebuild do frontend

```bash
cd ladingpage-soildata
pnpm build
```

## Comandos Úteis do PM2

```bash
# Ver status
pm2 list

# Ver logs
pm2 logs api-soildata

# Ver logs em tempo real
pm2 logs api-soildata --lines 50

# Reiniciar
pm2 restart api-soildata

# Parar
pm2 stop api-soildata

# Deletar
pm2 delete api-soildata

# Monitorar
pm2 monit
```

## Atualização da API

Quando precisar atualizar:

```bash
# 1. No servidor
cd /var/www/soildata/api-soildata

# 2. Atualizar código (Git)
git pull origin main

# 3. Reinstalar dependências se necessário
pnpm install --production

# 4. Rebuild (se necessário)
pnpm build

# 5. Reiniciar PM2
pm2 restart api-soildata
```

## Troubleshooting

### API não inicia

```bash
# Verificar logs
pm2 logs api-soildata --err

# Verificar se porta está em uso
sudo netstat -tulpn | grep 3000

# Verificar permissões
ls -la dist/server.js
```

### Erro de arquivo não encontrado

```bash
# Verificar caminho do SOIL_DATA_PATH
cat .env.production | grep SOIL_DATA_PATH
ls -la $(cat .env.production | grep SOIL_DATA_PATH | cut -d '=' -f2)
```

### Erro de CORS

```bash
# Verificar CORS_ORIGINS
cat .env.production | grep CORS_ORIGINS

# Reiniciar após mudanças
pm2 restart api-soildata
```

## Estrutura de Diretórios Recomendada

```
/var/www/soildata/
├── api-soildata/
│   ├── dist/
│   ├── node_modules/
│   ├── .env.production
│   ├── ecosystem.config.js
│   └── package.json
└── ladingpage-soildata/
    ├── dist/
    └── src/
        └── data/
            └── enriched-soil-data.json
```

## Checklist Final

- [ ] Código transferido para o servidor
- [ ] Dependências instaladas (`pnpm install --production`)
- [ ] Arquivo `.env.production` criado e configurado
- [ ] Arquivo `enriched-soil-data.json` existe no caminho especificado
- [ ] PM2 instalado e API iniciada
- [ ] Porta 3000 aberta no firewall
- [ ] Health check funcionando (`curl http://localhost:3000/health`)
- [ ] Frontend configurado com `VITE_API_BASE_URL` correto
- [ ] Frontend rebuildado

