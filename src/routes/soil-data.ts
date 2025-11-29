import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { getSoilData, getSoilDataSummary, getSoilDataStats, getSoilDataMetadata } from '../services/soil-data.js';
import { handleError } from '../utils/errorHandler.js';
import type { SoilDataQuery } from '../types/index.js';

export async function soilDataRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  fastify.get<{ Querystring: SoilDataQuery }>(
    '/',
    async (request: FastifyRequest<{ Querystring: SoilDataQuery }>, reply: FastifyReply) => {
      try {
        const result = await getSoilData(request.query);
        return {
          success: true,
          total: result.total,
          returned: result.returned,
          pagination: {
            limit: request.query.limit || null,
            offset: request.query.offset || 0,
          },
          filters: {
            state: request.query.state || null,
            municipality: request.query.municipality || null,
            biome: request.query.biome || null,
            datasetCode: request.query.datasetCode || null,
          },
          data: result.data,
        };
      } catch (error) {
        return handleError(reply, error, 'Erro ao buscar dados de solo', fastify.log);
      }
    }
  );

  fastify.get('/summary', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const summary = await getSoilDataSummary();
      return { success: true, ...summary };
    } catch (error) {
      return handleError(reply, error, 'Erro ao buscar resumo dos dados', fastify.log);
    }
  });

  fastify.get('/stats', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = await getSoilDataStats();
      return { success: true, statistics: stats };
    } catch (error) {
      return handleError(reply, error, 'Erro ao buscar estatísticas', fastify.log);
    }
  });

  fastify.get('/filters', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const summary = await getSoilDataSummary();
      return { success: true, filters: summary.availableFilters };
    } catch (error) {
      return handleError(reply, error, 'Erro ao buscar filtros disponíveis', fastify.log);
    }
  });

  fastify.get('/metadata', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const metadata = await getSoilDataMetadata();
      return { success: true, metadata };
    } catch (error) {
      return handleError(reply, error, 'Erro ao buscar metadados', fastify.log);
    }
  });
}
