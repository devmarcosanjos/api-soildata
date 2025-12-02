import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { getGranulometryData, getGranulometrySummary, getGranulometryStats, getGranulometryMetadata, getGranulometryFractionAnalysis } from '../services/granulometry.js';
import { handleError } from '../utils/errorHandler.js';
import { granulometryQuerySchema } from '../schemas/granulometry.js';
import { granulometryFractionQuerySchema } from '../schemas/granulometry-fractions.js';
import type { GranulometryQuery, GranulometryFractionQuery } from '../types/index.js';

export async function granulometryRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  fastify.get<{ Querystring: GranulometryQuery }>(
    '/',
    {
      schema: {
        querystring: granulometryQuerySchema,
      },
    },
    async (request: FastifyRequest<{ Querystring: GranulometryQuery }>, reply: FastifyReply) => {
      try {
        const result = await getGranulometryData(request.query);
        return {
          success: true,
          total: result.total,
          returned: result.returned,
          pagination: {
            limit: request.query.limit || 100,
            offset: request.query.offset || 0,
          },
          filters: {
            datasetId: request.query.datasetId || null,
            biome: request.query.biome || null,
            state: request.query.state || null,
            region: request.query.region || null,
            municipality: request.query.municipality || null,
            layerId: request.query.layerId || null,
            minDepth: request.query.minDepth || null,
            maxDepth: request.query.maxDepth || null,
            minLatitude: request.query.minLatitude || null,
            maxLatitude: request.query.maxLatitude || null,
            minLongitude: request.query.minLongitude || null,
            maxLongitude: request.query.maxLongitude || null,
            minClayFraction: request.query.minClayFraction || null,
            maxClayFraction: request.query.maxClayFraction || null,
            minSiltFraction: request.query.minSiltFraction || null,
            maxSiltFraction: request.query.maxSiltFraction || null,
            minSandFraction: request.query.minSandFraction || null,
            maxSandFraction: request.query.maxSandFraction || null,
          },
          sorting: {
            sortBy: request.query.sortBy || null,
            sortOrder: request.query.sortOrder || 'asc',
          },
          data: result.data,
        };
      } catch (error) {
        return handleError(reply, error, 'Error fetching granulometry data', fastify.log);
      }
    }
  );

  fastify.get('/summary', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const summary = await getGranulometrySummary();
      return { success: true, ...summary };
    } catch (error) {
      return handleError(reply, error, 'Error fetching granulometry summary', fastify.log);
    }
  });

  fastify.get('/stats', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = await getGranulometryStats();
      return { success: true, statistics: stats };
    } catch (error) {
      return handleError(reply, error, 'Error fetching granulometry statistics', fastify.log);
    }
  });

  fastify.get('/filters', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const summary = await getGranulometrySummary();
      return { success: true, filters: summary.availableFilters };
    } catch (error) {
      return handleError(reply, error, 'Error fetching available filters', fastify.log);
    }
  });

  fastify.get('/metadata', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const metadata = await getGranulometryMetadata();
      return { success: true, metadata };
    } catch (error) {
      return handleError(reply, error, 'Error fetching granulometry metadata', fastify.log);
    }
  });

  fastify.get<{ Querystring: GranulometryFractionQuery }>(
    '/fractions',
    {
      schema: {
        querystring: granulometryFractionQuerySchema,
      },
    },
    async (request: FastifyRequest<{ Querystring: GranulometryFractionQuery }>, reply: FastifyReply) => {
      try {
        const { limit, offset, ...queryParams } = request.query;
        const result = await getGranulometryFractionAnalysis(queryParams, {
          limit: limit ? Math.min(limit, 1000) : undefined,
          offset: offset || 0,
        });
        return {
          success: true,
          ...result,
        };
      } catch (error) {
        return handleError(reply, error, 'Error fetching granulometry fraction analysis', fastify.log);
      }
    }
  );
}

