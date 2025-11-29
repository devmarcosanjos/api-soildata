import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { getSoilData, getSoilDataSummary, getSoilDataStats, getSoilDataMetadata } from '../services/soil-data.js';
import type { SoilDataQuery } from '../types/index.js';

export async function soilDataRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // GET /api/soil-data - Lista todos os pontos de solo
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
        fastify.log.error(error);
        reply.code(500);
        return {
          success: false,
          error: 'Erro ao buscar dados de solo',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    }
  );

  // GET /api/soil-data/summary - Resumo dos dados
  fastify.get('/summary', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const summary = await getSoilDataSummary();
      return {
        success: true,
        ...summary,
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        success: false,
        error: 'Erro ao buscar resumo dos dados',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  });

  // GET /api/soil-data/stats - Estatísticas detalhadas
  fastify.get('/stats', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = await getSoilDataStats();
      return {
        success: true,
        statistics: stats,
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        success: false,
        error: 'Erro ao buscar estatísticas',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  });

  // GET /api/soil-data/filters - Valores disponíveis para filtros
  fastify.get('/filters', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const summary = await getSoilDataSummary();
      return {
        success: true,
        filters: summary.availableFilters,
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        success: false,
        error: 'Erro ao buscar filtros disponíveis',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  });

  // GET /api/soil-data/metadata - Metadados do arquivo
  fastify.get('/metadata', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const metadata = await getSoilDataMetadata();
      return {
        success: true,
        metadata,
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        success: false,
        error: 'Erro ao buscar metadados',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  });
}

