# Configuração de Produção - API SoilData

## Variáveis de Ambiente

Crie ou edite o arquivo `.env.production`:

```bash
# Porta do servidor
PORT=3000

# Host do servidor (IP ou 0.0.0.0 para todas as interfaces)
#HOST=0.0.0.0
# OU use o IP específico:
HOST=187.86.57.254

# Ambiente
NODE_ENV=production

# CORS - URLs permitidas (separadas por vírgula)
CORS_ORIGINS=https://soildata.cmob.online

# Caminho para o arquivo enriched-soil-data.json
# Use caminho absoluto em produção
SOIL_DATA_PATH=/var/www/soildata/data/enriched-soil-data.json
```

## Build e Deploy

### 1. Build da API

```bash
cd api-soildata
pnpm install --production=false
pnpm build
```

### 2. Iniciar em Produção

```bash
# Usando PM2 (recomendado)
pm2 start dist/server.js --name api-soildata --env production

# Ou diretamente
NODE_ENV=production node dist/server.js
```

### 3. Configuração PM2

Crie `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'api-soildata',
    script: './dist/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0',
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0',
      CORS_ORIGINS: 'https://soildata.cmob.online',
      SOIL_DATA_PATH: '/var/www/soildata/data/enriched-soil-data.json',
    }
  }]
};
```

Iniciar com PM2:
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## Frontend - Configuração de Produção

No diretório `ladingpage-soildata`, edite `.env.production`:

```bash
# URL da API em produção
# Se a API estiver no mesmo servidor na porta 3000:
VITE_API_BASE_URL=http://187.86.57.254:3000
# OU se a API estiver no mesmo domínio em subdiretório:
# VITE_API_BASE_URL=https://soildata.cmob.online/api
# OU se tiver subdomínio específico:
# VITE_API_BASE_URL=https://api.soildata.cmob.online

VITE_NODE_ENV=production
```

Build do frontend:
```bash
cd ladingpage-soildata
pnpm build
```

## Verificações

### 1. Testar Health Check

```bash
curl http://187.86.57.254:3000/health
```

### 2. Testar CORS

```bash
curl -H "Origin: https://soildata.cmob.online" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://187.86.57.254:3000/api/datasets/latest
```

### 3. Verificar Logs

```bash
# Se usando PM2
pm2 logs api-soildata

# Ou verificar logs do sistema
journalctl -u api-soildata -f
```

## Troubleshooting

### API não responde

1. Verifique se a porta está aberta no firewall:
```bash
sudo ufw allow 3000/tcp
```

2. Verifique se o processo está rodando:
```bash
ps aux | grep node
# ou
pm2 list
```

3. Verifique os logs de erro:
```bash
pm2 logs api-soildata --err
```

### Erros de CORS

1. Verifique se `CORS_ORIGINS` está configurado corretamente
2. Verifique se a URL do frontend está na lista de origens permitidas
3. Reinicie a API após mudanças no CORS

### Arquivo de dados não encontrado

1. Verifique se `SOIL_DATA_PATH` aponta para o arquivo correto
2. Verifique permissões do arquivo:
```bash
ls -la /var/www/soildata/data/enriched-soil-data.json
```

## Nginx (Opcional - Reverse Proxy)

Se usar Nginx como reverse proxy:

```nginx
server {
    listen 80;
    server_name api.soildata.cmob.online;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

