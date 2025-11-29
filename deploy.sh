#!/bin/bash

# Script de Deploy - API SoilData
# Uso: ./deploy.sh [usuario@servidor] [caminho-no-servidor]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações
SERVER="${1:-usuario@187.86.57.254}"
SERVER_PATH="${2:-/var/www/soildata/api-soildata}"

echo -e "${GREEN}=== Deploy API SoilData ===${NC}\n"

# 1. Build local
echo -e "${YELLOW}1. Fazendo build local...${NC}"
pnpm install
pnpm build

if [ ! -d "dist" ]; then
    echo -e "${RED}Erro: Diretório dist/ não foi criado!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build concluído${NC}\n"

# 2. Transferir para servidor
echo -e "${YELLOW}2. Transferindo arquivos para servidor...${NC}"
echo -e "   Servidor: ${SERVER}"
echo -e "   Caminho: ${SERVER_PATH}"

# Criar diretório no servidor se não existir
ssh ${SERVER} "mkdir -p ${SERVER_PATH}"

# Transferir arquivos
rsync -avz --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'src' \
  --exclude '*.md' \
  --exclude '.env*' \
  --exclude 'tsconfig.json' \
  ./ ${SERVER}:${SERVER_PATH}/

echo -e "${GREEN}✓ Arquivos transferidos${NC}\n"

# 3. Instalar dependências no servidor
echo -e "${YELLOW}3. Instalando dependências no servidor...${NC}"
ssh ${SERVER} "cd ${SERVER_PATH} && pnpm install --production || npm install --production"

echo -e "${GREEN}✓ Dependências instaladas${NC}\n"

# 4. Verificar .env.production
echo -e "${YELLOW}4. Verificando .env.production...${NC}"
if ssh ${SERVER} "test -f ${SERVER_PATH}/.env.production"; then
    echo -e "${GREEN}✓ .env.production existe${NC}"
else
    echo -e "${RED}⚠ .env.production não existe!${NC}"
    echo -e "${YELLOW}   Crie o arquivo manualmente no servidor:${NC}"
    echo -e "   ssh ${SERVER}"
    echo -e "   nano ${SERVER_PATH}/.env.production"
    echo ""
    echo -e "   Conteúdo mínimo:"
    echo -e "   PORT=3000"
    echo -e "   HOST=0.0.0.0"
    echo -e "   NODE_ENV=production"
    echo -e "   CORS_ORIGINS=https://soildata.cmob.online"
    echo -e "   SOIL_DATA_PATH=/var/www/soildata/ladingpage-soildata/src/data/enriched-soil-data.json"
fi

# 5. Reiniciar PM2
echo -e "\n${YELLOW}5. Reiniciando API no PM2...${NC}"
if ssh ${SERVER} "pm2 list | grep -q api-soildata"; then
    echo -e "${GREEN}   API já está rodando, reiniciando...${NC}"
    ssh ${SERVER} "cd ${SERVER_PATH} && pm2 restart api-soildata"
else
    echo -e "${YELLOW}   API não está rodando, iniciando...${NC}"
    ssh ${SERVER} "cd ${SERVER_PATH} && pm2 start ecosystem.config.js --env production || pm2 start dist/server.js --name api-soildata --env production"
fi

echo -e "${GREEN}✓ API reiniciada${NC}\n"

# 6. Verificar status
echo -e "${YELLOW}6. Verificando status...${NC}"
ssh ${SERVER} "pm2 list | grep api-soildata"
ssh ${SERVER} "pm2 logs api-soildata --lines 10 --nostream"

echo -e "\n${GREEN}=== Deploy concluído! ===${NC}"
echo -e "\n${YELLOW}Próximos passos:${NC}"
echo -e "1. Verificar logs: ssh ${SERVER} 'pm2 logs api-soildata'"
echo -e "2. Testar API: curl http://187.86.57.254:3000/health"
echo -e "3. Verificar firewall: ssh ${SERVER} 'sudo ufw status'"

