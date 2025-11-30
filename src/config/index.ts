import { resolve } from 'path';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

const getSoilDataPath = (): string => {
  if (process.env.SOIL_DATA_PATH) {
    return process.env.SOIL_DATA_PATH.startsWith('/')
      ? process.env.SOIL_DATA_PATH
      : resolve(process.cwd(), process.env.SOIL_DATA_PATH);
  }
  return resolve(process.cwd(), '../ladingpage-soildata/src/data/enriched-soil-data.json');
};

const getPSDPlatformPath = (): string => {
  if (process.env.PSD_PLATFORM_DATA_PATH) {
    return process.env.PSD_PLATFORM_DATA_PATH.startsWith('/')
      ? process.env.PSD_PLATFORM_DATA_PATH
      : resolve(process.cwd(), process.env.PSD_PLATFORM_DATA_PATH);
  }
  return resolve(process.cwd(), 'src/data/psd-platform-data.json');
};

export const config = {
  env: {
    isProduction,
    isDevelopment,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || '0.0.0.0',
  },
  cors: {
    origins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
      : isProduction
      ? ['https://soildata.cmob.online']
      : true,
  },
  data: {
    soilDataPath: getSoilDataPath(),
    psdPlatformPath: getPSDPlatformPath(),
  },
  logger: {
    level: isProduction ? 'info' : 'debug',
    pretty: isDevelopment,
  },
} as const;

