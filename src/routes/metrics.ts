import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import {
  getTotalDatasets,
  getTotalDownloads,
  getTotalFiles,
  getTotalDataverses,
  getMonthlyDownloads,
  getMonthlyDatasets,
  getMonthlyFiles,
  getDownloadsPastDays,
  getDatasetsPastDays,
  getDatasetsBySubject,
  getDataversesByCategory,
  getFileDownloads,
  getMonthlyFileDownloads,
  getDataverseTree,
} from '../services/dataverse.js';
import type { MetricsApiParams } from '../types/index.js';

export async function metricsRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // GET /api/metrics/datasets - Total de datasets
  fastify.get<{ Querystring: MetricsApiParams }>(
    '/datasets',
    async (request: FastifyRequest<{ Querystring: MetricsApiParams }>, reply: FastifyReply) => {
      try {
        const data = await getTotalDatasets(request.query);
        return {
          success: true,
          data,
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          success: false,
          error: 'Erro ao buscar total de datasets',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    }
  );

  // GET /api/metrics/downloads - Total de downloads
  fastify.get<{ Querystring: MetricsApiParams }>(
    '/downloads',
    async (request: FastifyRequest<{ Querystring: MetricsApiParams }>, reply: FastifyReply) => {
      try {
        const data = await getTotalDownloads(request.query);
        return {
          success: true,
          data,
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          success: false,
          error: 'Erro ao buscar total de downloads',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    }
  );

  // GET /api/metrics/files - Total de arquivos
  fastify.get<{ Querystring: MetricsApiParams }>(
    '/files',
    async (request: FastifyRequest<{ Querystring: MetricsApiParams }>, reply: FastifyReply) => {
      try {
        const data = await getTotalFiles(request.query);
        return {
          success: true,
          data,
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          success: false,
          error: 'Erro ao buscar total de arquivos',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    }
  );

  // GET /api/metrics/dataverses - Total de dataverses
  fastify.get<{ Querystring: MetricsApiParams }>(
    '/dataverses',
    async (request: FastifyRequest<{ Querystring: MetricsApiParams }>, reply: FastifyReply) => {
      try {
        const data = await getTotalDataverses(request.query);
        return {
          success: true,
          data,
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          success: false,
          error: 'Erro ao buscar total de dataverses',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    }
  );

  // GET /api/metrics/monthly/downloads - Downloads mensais
  fastify.get<{ Querystring: MetricsApiParams }>(
    '/monthly/downloads',
    async (request: FastifyRequest<{ Querystring: MetricsApiParams }>, reply: FastifyReply) => {
      try {
        const data = await getMonthlyDownloads(request.query);
        return {
          success: true,
          data,
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          success: false,
          error: 'Erro ao buscar downloads mensais',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    }
  );

  // GET /api/metrics/monthly/datasets - Datasets mensais
  fastify.get<{ Querystring: MetricsApiParams }>(
    '/monthly/datasets',
    async (request: FastifyRequest<{ Querystring: MetricsApiParams }>, reply: FastifyReply) => {
      try {
        const data = await getMonthlyDatasets(request.query);
        return {
          success: true,
          data,
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          success: false,
          error: 'Erro ao buscar datasets mensais',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    }
  );

  // GET /api/metrics/monthly/files - Arquivos mensais
  fastify.get<{ Querystring: MetricsApiParams }>(
    '/monthly/files',
    async (request: FastifyRequest<{ Querystring: MetricsApiParams }>, reply: FastifyReply) => {
      try {
        const data = await getMonthlyFiles(request.query);
        return {
          success: true,
          data,
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          success: false,
          error: 'Erro ao buscar arquivos mensais',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    }
  );

  // GET /api/metrics/downloads/past-days/:days - Downloads dos últimos N dias
  fastify.get<{ Params: { days: string }; Querystring: MetricsApiParams }>(
    '/downloads/past-days/:days',
    async (
      request: FastifyRequest<{ Params: { days: string }; Querystring: MetricsApiParams }>,
      reply: FastifyReply
    ) => {
      try {
        const days = parseInt(request.params.days, 10);
        if (isNaN(days) || days < 1) {
          reply.code(400);
          return {
            success: false,
            error: 'Parâmetro "days" deve ser um número positivo',
          };
        }
        const data = await getDownloadsPastDays(days, request.query);
        return {
          success: true,
          data,
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          success: false,
          error: 'Erro ao buscar downloads dos últimos dias',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    }
  );

  // GET /api/metrics/datasets/past-days/:days - Datasets dos últimos N dias
  fastify.get<{ Params: { days: string }; Querystring: MetricsApiParams }>(
    '/datasets/past-days/:days',
    async (
      request: FastifyRequest<{ Params: { days: string }; Querystring: MetricsApiParams }>,
      reply: FastifyReply
    ) => {
      try {
        const days = parseInt(request.params.days, 10);
        if (isNaN(days) || days < 1) {
          reply.code(400);
          return {
            success: false,
            error: 'Parâmetro "days" deve ser um número positivo',
          };
        }
        const data = await getDatasetsPastDays(days, request.query);
        return {
          success: true,
          data,
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          success: false,
          error: 'Erro ao buscar datasets dos últimos dias',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    }
  );

  // GET /api/metrics/datasets/by-subject - Datasets por assunto
  fastify.get<{ Querystring: MetricsApiParams }>(
    '/datasets/by-subject',
    async (request: FastifyRequest<{ Querystring: MetricsApiParams }>, reply: FastifyReply) => {
      try {
        const data = await getDatasetsBySubject(request.query);
        return {
          success: true,
          data,
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          success: false,
          error: 'Erro ao buscar datasets por assunto',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    }
  );

  // GET /api/metrics/dataverses/by-category - Dataverses por categoria
  fastify.get<{ Querystring: MetricsApiParams }>(
    '/dataverses/by-category',
    async (request: FastifyRequest<{ Querystring: MetricsApiParams }>, reply: FastifyReply) => {
      try {
        const data = await getDataversesByCategory(request.query);
        return {
          success: true,
          data,
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          success: false,
          error: 'Erro ao buscar dataverses por categoria',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    }
  );

  // GET /api/metrics/file-downloads - Downloads por arquivo
  fastify.get<{ Querystring: MetricsApiParams }>(
    '/file-downloads',
    async (request: FastifyRequest<{ Querystring: MetricsApiParams }>, reply: FastifyReply) => {
      try {
        const data = await getFileDownloads(request.query);
        return {
          success: true,
          data,
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          success: false,
          error: 'Erro ao buscar downloads por arquivo',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    }
  );

  // GET /api/metrics/monthly/file-downloads - Downloads mensais por arquivo
  fastify.get<{ Querystring: MetricsApiParams }>(
    '/monthly/file-downloads',
    async (request: FastifyRequest<{ Querystring: MetricsApiParams }>, reply: FastifyReply) => {
      try {
        const data = await getMonthlyFileDownloads(request.query);
        return {
          success: true,
          data,
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          success: false,
          error: 'Erro ao buscar downloads mensais por arquivo',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    }
  );

  // GET /api/metrics/tree - Árvore de dataverses
  fastify.get<{ Querystring: MetricsApiParams }>(
    '/tree',
    async (request: FastifyRequest<{ Querystring: MetricsApiParams }>, reply: FastifyReply) => {
      try {
        const data = await getDataverseTree(request.query);
        return {
          success: true,
          data,
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          success: false,
          error: 'Erro ao buscar árvore de dataverses',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    }
  );
}

