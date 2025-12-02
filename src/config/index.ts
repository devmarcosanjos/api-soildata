import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

const nodeEnvFromProcess = process.env.NODE_ENV || 'development';
const envFile = nodeEnvFromProcess === 'production' ? '.env.production' : '.env.local';
const envPath = resolve(process.cwd(), envFile);

if (existsSync(envPath)) {
  dotenvConfig({ path: envPath });
} else if (nodeEnvFromProcess !== 'production') {
  const fallbackPath = resolve(process.cwd(), '.env');
  if (existsSync(fallbackPath)) {
    dotenvConfig({ path: fallbackPath });
  }
}

const getEnv = (key: string, required = true): string | undefined => {
  const value = process.env[key];
  if (!value && required) throw new Error(`Variável de ambiente obrigatória: ${key}`);
  return value;
};

const getDataPath = (envKey: string): string => {
  const path = getEnv(envKey)!;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (path.startsWith('/')) {
    return path;
  }
  return resolve(process.cwd(), path);
};

const nodeEnv = getEnv('NODE_ENV') || 'development';
const isProduction = nodeEnv === 'production';
const isDevelopment = !isProduction;

export const config = {
  env: {
    isProduction,
    isDevelopment,
    nodeEnv,
  },
  server: {
    port: Number(getEnv('PORT')!),
    host: getEnv('HOST')!,
  },
  cors: {
    origins: (() => {
      const cors = getEnv('CORS_ORIGINS', isProduction);
      if (!cors) {
        if (isDevelopment) return true;
        throw new Error('CORS_ORIGINS é obrigatório em produção');
      }
      const origins = cors.split(',').map(o => o.trim()).filter(Boolean);
      if (origins.length === 0 && isProduction) {
        throw new Error('CORS_ORIGINS deve conter pelo menos uma URL válida');
      }
      return origins;
    })(),
  },
  data: {
    soilDataPath: getDataPath('SOIL_DATA_PATH'),
    granulometryDataPath: getDataPath('GRANULOMETRY_DATA_PATH'),
  },
  logger: {
    level: (getEnv('LOG_LEVEL', false) || 'info') as 'info' | 'debug',
    pretty: isDevelopment,
  },
} as const;
