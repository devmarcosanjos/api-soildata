import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { searchDatasets, transformDatasets } from '../services/dataverse.js';
import { handleError } from '../utils/errorHandler.js';
import type { DatasetsQuery } from '../types/index.js';

export async function datasetsRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  fastify.get<{ Querystring: DatasetsQuery }>(
    '/',
    async (request: FastifyRequest<{ Querystring: DatasetsQuery }>, reply: FastifyReply) => {
      try {
        const { limit = 10, offset = 0, sort = 'date', order = 'desc', q = '*' } = request.query;

        const searchResponse = await searchDatasets({
          q,
          limit: Number(limit),
          offset: Number(offset),
          sort,
          order,
        });

        const items = searchResponse.data?.items ?? [];
        const datasets = transformDatasets(items);

        return {
          success: true,
          count: datasets.length,
          returned: datasets.length,
          pagination: {
            limit: Number(limit),
            offset: Number(offset),
          },
          data: datasets,
        };
      } catch (error) {
        return handleError(reply, error, 'Erro ao buscar datasets', fastify.log);
      }
    }
  );

  fastify.get<{ Querystring: { limit?: number } }>(
    '/latest',
    async (request: FastifyRequest<{ Querystring: { limit?: number } }>, reply: FastifyReply) => {
      try {
        const limit = request.query.limit ? Number(request.query.limit) : 6;

        const searchResponse = await searchDatasets({
          q: '*',
          limit,
          offset: 0,
          sort: 'date',
          order: 'desc',
        });

        const items = searchResponse.data?.items ?? [];
        const datasets = transformDatasets(items);

        return {
          success: true,
          count: datasets.length,
          data: datasets,
        };
      } catch (error) {
        return handleError(reply, error, 'Erro ao buscar datasets mais recentes', fastify.log);
      }
    }
  );

  fastify.get<{ Querystring: { q: string; limit?: number; offset?: number } }>(
    '/search',
    async (
      request: FastifyRequest<{ Querystring: { q: string; limit?: number; offset?: number } }>,
      reply: FastifyReply
    ) => {
      try {
        const { q, limit = 10, offset = 0 } = request.query;

        if (!q || q.trim().length === 0) {
          reply.code(400);
          return {
            success: false,
            error: 'Parâmetro de busca "q" é obrigatório',
          };
        }

        const searchResponse = await searchDatasets({
          q: q.trim(),
          limit: Number(limit),
          offset: Number(offset),
          sort: 'date',
          order: 'desc',
        });

        const items = searchResponse.data?.items ?? [];
        const datasets = transformDatasets(items);

        return {
          success: true,
          count: datasets.length,
          returned: datasets.length,
          pagination: {
            limit: Number(limit),
            offset: Number(offset),
          },
          query: q.trim(),
          data: datasets,
        };
      } catch (error) {
        return handleError(reply, error, 'Erro ao buscar datasets', fastify.log);
      }
    }
  );
}

