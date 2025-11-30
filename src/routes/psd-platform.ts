import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { getPSDData, getAllPSDData } from '../services/psd-platform.js';
import { handleError } from '../utils/errorHandler.js';
import { getAvailableBiomes } from '../utils/biome-classifier.js';
import { getAvailableStates, getStateNameFromSigla } from '../utils/state-classifier.js';
import { getAvailableMunicipalities } from '../utils/municipality-classifier.js';
import { getAvailableRegions } from '../utils/region-classifier.js';
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
            municipio: request.query.municipio || null,
            regiao: request.query.regiao || null,
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
            municipio: request.query.municipio || null,
            regiao: request.query.regiao || null,
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
        
        // Mapa de siglas para nomes (fallback caso GeoJSON não esteja disponível)
        const siglaToName: Record<string, string> = {
          'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas',
          'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo',
          'GO': 'Goiás', 'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul',
          'MG': 'Minas Gerais', 'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná',
          'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
          'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina',
          'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins'
        };
        
        // Tenta converter sigla para nome do estado (ex: PR -> Paraná)
        let estado = estadoParam;
        let sigla: string | null = null;
        
        if (estadoParam.length <= 2) {
          sigla = estadoParam.toUpperCase();
          // Primeiro tenta usar o GeoJSON
          const stateName = getStateNameFromSigla(estadoParam);
          if (stateName) {
            estado = stateName;
          } else if (siglaToName[sigla]) {
            // Fallback para o mapa hardcoded
            estado = siglaToName[sigla];
            fastify.log.warn(`[PSD Platform] GeoJSON não disponível, usando mapa hardcoded para "${sigla}" -> "${estado}"`);
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
        
        if (result.total === 0) {
          return reply.status(404).send({
            success: false,
            error: 'Estado não encontrado',
            message: `Nenhum registro encontrado para o estado "${estado}"`,
          });
        }
        
        return {
          success: true,
          estado,
          sigla: sigla,
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
        
        // Mapa de siglas para nomes (fallback caso GeoJSON não esteja disponível)
        const siglaToName: Record<string, string> = {
          'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas',
          'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo',
          'GO': 'Goiás', 'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul',
          'MG': 'Minas Gerais', 'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná',
          'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
          'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina',
          'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins'
        };
        
        // Tenta converter sigla para nome do estado (ex: PR -> Paraná)
        let estado = estadoParam;
        let sigla: string | null = null;
        
        if (estadoParam.length <= 2) {
          sigla = estadoParam.toUpperCase();
          // Primeiro tenta usar o GeoJSON
          const stateName = getStateNameFromSigla(estadoParam);
          if (stateName) {
            estado = stateName;
          } else if (siglaToName[sigla]) {
            // Fallback para o mapa hardcoded
            estado = siglaToName[sigla];
            fastify.log.warn(`[PSD Platform] GeoJSON não disponível, usando mapa hardcoded para "${sigla}" -> "${estado}"`);
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
        
        if (result.total === 0) {
          return reply.status(404).send({
            success: false,
            error: 'Estado não encontrado',
            message: `Nenhum registro encontrado para o estado "${estado}"`,
          });
        }
        
        return {
          success: true,
          estado,
          sigla: sigla,
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

  fastify.get<{ Params: { municipio: string }; Querystring: Omit<PSDQuery, 'municipio' | 'limit' | 'offset'> }>(
    '/municipio/:municipio',
    async (request: FastifyRequest<{ Params: { municipio: string }; Querystring: Omit<PSDQuery, 'municipio' | 'limit' | 'offset'> }>, reply: FastifyReply) => {
      try {
        const municipioParam = decodeURIComponent(request.params.municipio);
        
        let query = { ...request.query };
        
        // Se estado for uma sigla (2 caracteres ou menos), converte para nome
        if (query.estado && query.estado.length <= 2) {
          const stateName = getStateNameFromSigla(query.estado);
          if (stateName) {
            query.estado = stateName;
          }
        }
        
        const result = await getAllPSDData({
          ...query,
          municipio: municipioParam,
        });
        
        if (result.total === 0) {
          return reply.status(404).send({
            success: false,
            error: 'Município não encontrado',
            message: `Nenhum registro encontrado para o município "${municipioParam}"`,
          });
        }
        
        return {
          success: true,
          municipio: municipioParam,
          total: result.total,
          filters: {
            dataset_id: request.query.dataset_id || null,
            ano: request.query.ano || null,
            biome: request.query.biome || null,
            estado: query.estado || null,
          },
          data: result.data,
        };
      } catch (error) {
        return handleError(reply, error, 'Erro ao buscar dados PSD platform por município', fastify.log);
      }
    }
  );

  fastify.get<{ Params: { municipio: string }; Querystring: Omit<PSDQuery, 'municipio'> }>(
    '/municipio/:municipio/paginated',
    async (request: FastifyRequest<{ Params: { municipio: string }; Querystring: Omit<PSDQuery, 'municipio'> }>, reply: FastifyReply) => {
      try {
        const municipioParam = decodeURIComponent(request.params.municipio);
        
        let query = { ...request.query };
        
        // Se estado for uma sigla (2 caracteres ou menos), converte para nome
        if (query.estado && query.estado.length <= 2) {
          const stateName = getStateNameFromSigla(query.estado);
          if (stateName) {
            query.estado = stateName;
          }
        }
        
        const result = await getPSDData({
          ...query,
          municipio: municipioParam,
        });
        
        if (result.total === 0) {
          return reply.status(404).send({
            success: false,
            error: 'Município não encontrado',
            message: `Nenhum registro encontrado para o município "${municipioParam}"`,
          });
        }
        
        return {
          success: true,
          municipio: municipioParam,
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
            estado: query.estado || null,
          },
          data: result.data,
        };
      } catch (error) {
        return handleError(reply, error, 'Erro ao buscar dados PSD platform por município (paginado)', fastify.log);
      }
    }
  );

  fastify.get('/municipios', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const municipios = getAvailableMunicipalities();
      return {
        success: true,
        municipios,
        total: municipios.length,
      };
    } catch (error) {
      return handleError(reply, error, 'Erro ao buscar municípios disponíveis', fastify.log);
    }
  });

  fastify.get<{ Params: { regiao: string }; Querystring: Omit<PSDQuery, 'regiao' | 'limit' | 'offset'> }>(
    '/regiao/:regiao',
    async (request: FastifyRequest<{ Params: { regiao: string }; Querystring: Omit<PSDQuery, 'regiao' | 'limit' | 'offset'> }>, reply: FastifyReply) => {
      try {
        const regiaoParam = decodeURIComponent(request.params.regiao);
        
        let query = { ...request.query };
        
        // Se estado for uma sigla (2 caracteres ou menos), converte para nome
        if (query.estado && query.estado.length <= 2) {
          const stateName = getStateNameFromSigla(query.estado);
          if (stateName) {
            query.estado = stateName;
          }
        }
        
        const result = await getAllPSDData({
          ...query,
          regiao: regiaoParam,
        });
        
        if (result.total === 0) {
          return reply.status(404).send({
            success: false,
            error: 'Região não encontrada',
            message: `Nenhum registro encontrado para a região "${regiaoParam}"`,
          });
        }
        
        return {
          success: true,
          regiao: regiaoParam,
          total: result.total,
          filters: {
            dataset_id: request.query.dataset_id || null,
            ano: request.query.ano || null,
            biome: request.query.biome || null,
            estado: query.estado || null,
            municipio: request.query.municipio || null,
          },
          data: result.data,
        };
      } catch (error) {
        return handleError(reply, error, 'Erro ao buscar dados PSD platform por região', fastify.log);
      }
    }
  );

  fastify.get<{ Params: { regiao: string }; Querystring: Omit<PSDQuery, 'regiao'> }>(
    '/regiao/:regiao/paginated',
    async (request: FastifyRequest<{ Params: { regiao: string }; Querystring: Omit<PSDQuery, 'regiao'> }>, reply: FastifyReply) => {
      try {
        const regiaoParam = decodeURIComponent(request.params.regiao);
        
        let query = { ...request.query };
        
        // Se estado for uma sigla (2 caracteres ou menos), converte para nome
        if (query.estado && query.estado.length <= 2) {
          const stateName = getStateNameFromSigla(query.estado);
          if (stateName) {
            query.estado = stateName;
          }
        }
        
        const result = await getPSDData({
          ...query,
          regiao: regiaoParam,
        });
        
        if (result.total === 0) {
          return reply.status(404).send({
            success: false,
            error: 'Região não encontrada',
            message: `Nenhum registro encontrado para a região "${regiaoParam}"`,
          });
        }
        
        return {
          success: true,
          regiao: regiaoParam,
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
            estado: query.estado || null,
            municipio: request.query.municipio || null,
          },
          data: result.data,
        };
      } catch (error) {
        return handleError(reply, error, 'Erro ao buscar dados PSD platform por região (paginado)', fastify.log);
      }
    }
  );

  fastify.get('/regioes', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const regioes = getAvailableRegions();
      return {
        success: true,
        regioes,
        total: regioes.length,
      };
    } catch (error) {
      return handleError(reply, error, 'Erro ao buscar regiões disponíveis', fastify.log);
    }
  });
}

