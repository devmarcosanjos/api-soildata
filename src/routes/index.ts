import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { datasetsRoutes } from './datasets.js';
import { metricsRoutes } from './metrics.js';
import { soilDataRoutes } from './soil-data.js';
import { statisticsRoutes } from './statistics.js';
import { psdPlatformRoutes } from './psd-platform.js';

export async function routes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  fastify.get('/', async () => ({
    name: 'SoilData API',
    version: '1.0.0',
      endpoints: {
        health: '/health',
        datasets: '/api/datasets',
        metrics: '/api/metrics',
        soilData: '/api/soil-data',
        statistics: '/api/statistics',
        psdPlatform: '/api/psd-platform',
      },
  }));

        await fastify.register(datasetsRoutes, { prefix: '/api/datasets' });
        await fastify.register(metricsRoutes, { prefix: '/api/metrics' });
        await fastify.register(soilDataRoutes, { prefix: '/api/soil-data' });
        await fastify.register(statisticsRoutes, { prefix: '/api/statistics' });
        await fastify.register(psdPlatformRoutes, { prefix: '/api/psd-platform' });
}

