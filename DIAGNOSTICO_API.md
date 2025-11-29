# Diagnóstico - API não está acessível

## Problema Identificado

A API não está respondendo em `http://187.86.57.254:3000`

## Possíveis Causas e Soluções

### 1. API não está rodando no servidor

**Verificar no servidor:**
```bash
# SSH no servidor 187.86.57.254
ssh usuario@187.86.57.254

# Verificar se há processo Node rodando
ps aux | grep node
pm2 list

# Se não estiver rodando, iniciar:
cd /caminho/para/api-soildata
pm2 start ecosystem.config.js --env production
# OU
NODE_ENV=production node dist/server.js
```

### 2. Firewall bloqueando a porta 3000

**No servidor, abrir a porta:**
```bash
# Ubuntu/Debian
sudo ufw allow 3000/tcp
sudo ufw status

# Ou se usar iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

### 3. API rodando em outra porta

**Verificar qual porta está sendo usada:**
```bash
# No servidor
netstat -tulpn | grep node
# OU
ss -tulpn | grep node
```

### 4. Nginx/Proxy Reverso

Se você usa Nginx como proxy reverso, a API pode estar acessível apenas através do Nginx, não diretamente na porta 3000.

**Verificar configuração do Nginx:**
```bash
# Verificar se há configuração do Nginx
sudo nginx -t
cat /etc/nginx/sites-available/soildata
```

**Se usar Nginx, a URL da API seria:**
- `https://soildata.cmob.online/api` (se configurado como subdiretório)
- `https://api.soildata.cmob.online` (se configurado como subdomínio)

### 5. API rodando apenas em localhost

**Verificar se HOST está configurado corretamente:**
```bash
# No .env.production do backend
HOST=0.0.0.0  # Aceita conexões de qualquer interface
# OU
HOST=187.86.57.254  # IP específico
```

## Checklist de Verificação no Servidor

Execute estes comandos **no servidor de produção** (187.86.57.254):

```bash
# 1. Verificar se API está rodando
pm2 list
# ou
ps aux | grep "node.*server"

# 2. Verificar se porta 3000 está em uso
sudo netstat -tulpn | grep 3000
# ou
sudo ss -tulpn | grep 3000

# 3. Verificar firewall
sudo ufw status
# ou
sudo iptables -L -n | grep 3000

# 4. Testar localmente no servidor
curl http://localhost:3000/health

# 5. Verificar logs da API
pm2 logs api-soildata
# ou
journalctl -u api-soildata -n 50
```

## Configuração Recomendada

### Opção A: API acessível diretamente na porta 3000

**Backend `.env.production`:**
```bash
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
CORS_ORIGINS=https://soildata.cmob.online
```

**Frontend `.env.production`:**
```bash
VITE_API_BASE_URL=http://187.86.57.254:3000
```

**Firewall:**
```bash
sudo ufw allow 3000/tcp
```

### Opção B: API através de Nginx (Recomendado para produção)

**Nginx config (`/etc/nginx/sites-available/soildata`):**
```nginx
server {
    listen 80;
    server_name soildata.cmob.online;

    # Frontend
    location / {
        root /var/www/soildata/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
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

**Backend `.env.production`:**
```bash
PORT=3000
HOST=127.0.0.1  # Apenas localhost, Nginx faz proxy
NODE_ENV=production
CORS_ORIGINS=https://soildata.cmob.online
```

**Frontend `.env.production`:**
```bash
VITE_API_BASE_URL=https://soildata.cmob.online/api
```

## Próximos Passos

1. **SSH no servidor** e verifique se a API está rodando
2. **Verifique os logs** para ver se há erros
3. **Configure o firewall** se necessário
4. **Configure Nginx** se quiser servir API e frontend no mesmo domínio
5. **Teste localmente no servidor** antes de testar externamente

