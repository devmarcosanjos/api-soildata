import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { getPSDData, getAllPSDData } from '../services/psd-platform.js';
import { handleError } from '../utils/errorHandler.js';
import { getAvailableBiomes } from '../utils/biome-classifier.js';
import { getAvailableStates, getStateNameFromSigla } from '../utils/state-classifier.js';
import type { PSDQuery } from '../types/index.js';

export async function psdPlatformRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  fastify.get<{ Querystring: PSDQuery }>(
    '/',
    async (request: FastifyRequest<{ Querystring: PSDQuery }>, reply: FastifyReply) => {
      try {
        let query = { ...request.query };
        
        // Se estado for uma sigla (2 caracteres ou menos), converte para nome
        if (query.estado && query.estado.length <= 2) {
          const stateName = getStateNameFromSigla(query.estado);
          if (stateName) {
            query.estado = stateName;
          }
        }
        
        const result = await getPSDData(query);
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
            biome: request.query.biome || null,
            estado: request.query.estado || null,
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
        let query = { ...request.query };
        
        // Se estado for uma sigla (2 caracteres ou menos), converte para nome
        if (query.estado && query.estado.length <= 2) {
          const stateName = getStateNameFromSigla(query.estado);
          if (stateName) {
            query.estado = stateName;
          }
        }
        
        const result = await getAllPSDData(query);
        return {
          success: true,
          total: result.total,
          filters: {
            dataset_id: request.query.dataset_id || null,
            ano: request.query.ano || null,
            biome: request.query.biome || null,
            estado: request.query.estado || null,
          },
          data: result.data,
        };
      } catch (error) {
        return handleError(reply, error, 'Erro ao buscar todos os dados PSD platform', fastify.log);
      }
    }
  );

  fastify.get<{ Params: { biome: string }; Querystring: Omit<PSDQuery, 'biome' | 'limit' | 'offset'> }>(
    '/biome/:biome',
    async (request: FastifyRequest<{ Params: { biome: string }; Querystring: Omit<PSDQuery, 'biome' | 'limit' | 'offset'> }>, reply: FastifyReply) => {
      try {
        const biome = decodeURIComponent(request.params.biome);
        const result = await getAllPSDData({
          ...request.query,
          biome,
        });
        return {
          success: true,
          biome,
          total: result.total,
          filters: {
            dataset_id: request.query.dataset_id || null,
            ano: request.query.ano || null,
            estado: request.query.estado || null,
          },
          data: result.data,
        };
      } catch (error) {
        return handleError(reply, error, 'Erro ao buscar dados PSD platform por bioma', fastify.log);
      }
    }
  );

  fastify.get<{ Params: { biome: string }; Querystring: Omit<PSDQuery, 'biome'> }>(
    '/biome/:biome/paginated',
    async (request: FastifyRequest<{ Params: { biome: string }; Querystring: Omit<PSDQuery, 'biome'> }>, reply: FastifyReply) => {
      try {
        const biome = decodeURIComponent(request.params.biome);
        const result = await getPSDData({
          ...request.query,
          biome,
        });
        return {
          success: true,
          biome,
          total: result.total,
          returned: result.returned,
          pagination: {
            limit: request.query.limit || 100,
            offset: request.query.offset || 0,
          },
          filters: {
            dataset_id: request.query.dataset_id || null,
            ano: request.query.ano || null,
            estado: request.query.estado || null,
          },
          data: result.data,
        };
      } catch (error) {
        return handleError(reply, error, 'Erro ao buscar dados PSD platform por bioma (paginado)', fastify.log);
      }
    }
  );

  fastify.get<{ Params: { estado: string }; Querystring: Omit<PSDQuery, 'estado' | 'limit' | 'offset'> }>(
    '/estado/:estado',
    async (request: FastifyRequest<{ Params: { estado: string }; Querystring: Omit<PSDQuery, 'estado' | 'limit' | 'offset'> }>, reply: FastifyReply) => {
      try {
        const estadoParam = decodeURIComponent(request.params.estado);
        
        // Tenta converter sigla para nome do estado (ex: PR -> Paraná)
        let estado = estadoParam;
        if (estadoParam.length <= 2) {
          const stateName = getStateNameFromSigla(estadoParam);
          if (stateName) {
            estado = stateName;
          } else {
            return reply.status(404).send({
              success: false,
              error: 'Estado não encontrado',
              message: `Sigla "${estadoParam}" não corresponde a nenhum estado brasileiro`,
            });
          }
        }
        
        const result = await getAllPSDData({
          ...request.query,
          estado,
        });
        return {
          success: true,
          estado,
          sigla: estadoParam.length <= 2 ? estadoParam.toUpperCase() : null,
          total: result.total,
          filters: {
            dataset_id: request.query.dataset_id || null,
            ano: request.query.ano || null,
            biome: request.query.biome || null,
          },
          data: result.data,
        };
      } catch (error) {
        return handleError(reply, error, 'Erro ao buscar dados PSD platform por estado', fastify.log);
      }
    }
  );

  fastify.get<{ Params: { estado: string }; Querystring: Omit<PSDQuery, 'estado'> }>(
    '/estado/:estado/paginated',
    async (request: FastifyRequest<{ Params: { estado: string }; Querystring: Omit<PSDQuery, 'estado'> }>, reply: FastifyReply) => {
      try {
        const estadoParam = decodeURIComponent(request.params.estado);
        
        // Tenta converter sigla para nome do estado (ex: PR -> Paraná)
        let estado = estadoParam;
        if (estadoParam.length <= 2) {
          const stateName = getStateNameFromSigla(estadoParam);
          if (stateName) {
            estado = stateName;
          } else {
            return reply.status(404).send({
              success: false,
              error: 'Estado não encontrado',
              message: `Sigla "${estadoParam}" não corresponde a nenhum estado brasileiro`,
            });
          }
        }
        
        const result = await getPSDData({
          ...request.query,
          estado,
        });
        return {
          success: true,
          estado,
          sigla: estadoParam.length <= 2 ? estadoParam.toUpperCase() : null,
          total: result.total,
          returned: result.returned,
          pagination: {
            limit: request.query.limit || 100,
            offset: request.query.offset || 0,
          },
          filters: {
            dataset_id: request.query.dataset_id || null,
            ano: request.query.ano || null,
            biome: request.query.biome || null,
          },
          data: result.data,
        };
      } catch (error) {
        return handleError(reply, error, 'Erro ao buscar dados PSD platform por estado (paginado)', fastify.log);
      }
    }
  );

  fastify.get('/biomes', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const biomes = getAvailableBiomes();
      return {
        success: true,
        biomes,
        total: biomes.length,
      };
    } catch (error) {
      return handleError(reply, error, 'Erro ao buscar biomas disponíveis', fastify.log);
    }
  });

  fastify.get('/estados', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const estados = getAvailableStates();
      return {
        success: true,
        estados,
        total: estados.length,
      };
    } catch (error) {
      return handleError(reply, error, 'Erro ao buscar estados disponíveis', fastify.log);
    }
  });
}

