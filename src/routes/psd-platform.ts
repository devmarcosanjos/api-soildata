import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { getPSDData, getAllPSDData } from '../services/psd-platform.js';
import { handleError } from '../utils/errorHandler.js';
import type { PSDQuery } from '../types/index.js';

export async function psdPlatformRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  fastify.get<{ Querystring: PSDQuery }>(
    '/',
    async (request: FastifyRequest<{ Querystring: PSDQuery }>, reply: FastifyReply) => {
      try {
        const result = await getPSDData(request.query);
        return {
          success: true,
          total: result.total,
          returned: result.returned,
          pagination: {
            limit: request.query.limit || 100,
            offset: request.query.offset || 0,
          },
          filters: {
            dataset_id: request.query.dataset_id || null,
            ano: request.query.ano || null,
          },
          data: result.data,
        };
      } catch (error) {
        return handleError(reply, error, 'Erro ao buscar dados PSD platform', fastify.log);
      }
    }
  );

  fastify.get<{ Querystring: Omit<PSDQuery, 'limit' | 'offset'> }>(
    '/all',
    async (request: FastifyRequest<{ Querystring: Omit<PSDQuery, 'limit' | 'offset'> }>, reply: FastifyReply) => {
      try {
        const result = await getAllPSDData(request.query);
        return {
          success: true,
          total: result.total,
          filters: {
            dataset_id: request.query.dataset_id || null,
            ano: request.query.ano || null,
          },
          data: result.data,
        };
      } catch (error) {
        return handleError(reply, error, 'Erro ao buscar todos os dados PSD platform', fastify.log);
      }
    }
  );
}

