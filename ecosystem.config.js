module.exports = {
  apps: [
    {
      name: 'api-soildata',
      script: './dist/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOST: '0.0.0.0',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
        CORS_ORIGINS: 'https://soildata.cmob.online',
        SOIL_DATA_PATH: '/var/www/soildata/data/enriched-soil-data.json',
      },
    },
  ],
};

