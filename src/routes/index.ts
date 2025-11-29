import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { datasetsRoutes } from './datasets.js';
import { metricsRoutes } from './metrics.js';
import { soilDataRoutes } from './soil-data.js';
import { statisticsRoutes } from './statistics.js';

export async function routes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Health check
  fastify.get('/health', async (_request, _reply) => {
    return {
      status: 'ok',
      message: 'API SoilData está funcionando!',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
    };
  });

  // Root endpoint
  fastify.get('/', async (_request, _reply) => {
    return {
      name: 'SoilData API',
      version: '1.0.0',
      description: 'API REST para dados e métricas do SoilData',
      endpoints: {
        health: '/health',
        datasets: {
          list: '/api/datasets',
          latest: '/api/datasets/latest',
          search: '/api/datasets/search?q=query',
        },
        metrics: {
          datasets: '/api/metrics/datasets',
          downloads: '/api/metrics/downloads',
          files: '/api/metrics/files',
          monthly: {
            downloads: '/api/metrics/monthly/downloads',
            datasets: '/api/metrics/monthly/datasets',
            files: '/api/metrics/monthly/files',
          },
        },
        soilData: {
          list: '/api/soil-data',
          summary: '/api/soil-data/summary',
          stats: '/api/soil-data/stats',
          filters: '/api/soil-data/filters',
          metadata: '/api/soil-data/metadata',
        },
        statistics: {
          general: '/api/statistics',
          monthly: '/api/statistics/monthly',
        },
      },
    };
  });

  // Registrar sub-rotas
  await fastify.register(datasetsRoutes, { prefix: '/api/datasets' });
  await fastify.register(metricsRoutes, { prefix: '/api/metrics' });
  await fastify.register(soilDataRoutes, { prefix: '/api/soil-data' });
  await fastify.register(statisticsRoutes, { prefix: '/api/statistics' });
}

