import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply, FastifyLoggerInstance } from 'fastify';
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
import { handleError } from '../utils/errorHandler.js';
import type { MetricsApiParams } from '../types/index.js';

function createMetricsHandler(
  serviceFn: (params?: MetricsApiParams) => Promise<unknown>,
  errorMessage: string,
  logger: FastifyLoggerInstance
) {
  return async (request: FastifyRequest<{ Querystring: MetricsApiParams }>, reply: FastifyReply) => {
    try {
      const data = await serviceFn(request.query);
      return { success: true, data };
    } catch (error) {
      return handleError(reply, error, errorMessage, logger);
    }
  };
}

export async function metricsRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  fastify.get<{ Querystring: MetricsApiParams }>(
    '/datasets',
    createMetricsHandler(getTotalDatasets, 'Erro ao buscar total de datasets', fastify.log)
  );

  fastify.get<{ Querystring: MetricsApiParams }>(
    '/downloads',
    createMetricsHandler(getTotalDownloads, 'Erro ao buscar total de downloads', fastify.log)
  );

  fastify.get<{ Querystring: MetricsApiParams }>(
    '/files',
    createMetricsHandler(getTotalFiles, 'Erro ao buscar total de arquivos', fastify.log)
  );

  fastify.get<{ Querystring: MetricsApiParams }>(
    '/dataverses',
    createMetricsHandler(getTotalDataverses, 'Erro ao buscar total de dataverses', fastify.log)
  );

  fastify.get<{ Querystring: MetricsApiParams }>(
    '/monthly/downloads',
    createMetricsHandler(getMonthlyDownloads, 'Erro ao buscar downloads mensais', fastify.log)
  );

  fastify.get<{ Querystring: MetricsApiParams }>(
    '/monthly/datasets',
    createMetricsHandler(getMonthlyDatasets, 'Erro ao buscar datasets mensais', fastify.log)
  );

  fastify.get<{ Querystring: MetricsApiParams }>(
    '/monthly/files',
    createMetricsHandler(getMonthlyFiles, 'Erro ao buscar arquivos mensais', fastify.log)
  );

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
        return { success: true, data };
      } catch (error) {
        return handleError(reply, error, 'Erro ao buscar downloads dos últimos dias', fastify.log);
      }
    }
  );

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
        return { success: true, data };
      } catch (error) {
        return handleError(reply, error, 'Erro ao buscar datasets dos últimos dias', fastify.log);
      }
    }
  );

  fastify.get<{ Querystring: MetricsApiParams }>(
    '/datasets/by-subject',
    createMetricsHandler(getDatasetsBySubject, 'Erro ao buscar datasets por assunto', fastify.log)
  );

  fastify.get<{ Querystring: MetricsApiParams }>(
    '/dataverses/by-category',
    createMetricsHandler(getDataversesByCategory, 'Erro ao buscar dataverses por categoria', fastify.log)
  );

  fastify.get<{ Querystring: MetricsApiParams }>(
    '/file-downloads',
    createMetricsHandler(getFileDownloads, 'Erro ao buscar downloads por arquivo', fastify.log)
  );

  fastify.get<{ Querystring: MetricsApiParams }>(
    '/monthly/file-downloads',
    createMetricsHandler(getMonthlyFileDownloads, 'Erro ao buscar downloads mensais por arquivo', fastify.log)
  );

  fastify.get<{ Querystring: MetricsApiParams }>(
    '/tree',
    createMetricsHandler(getDataverseTree, 'Erro ao buscar árvore de dataverses', fastify.log)
  );
}
