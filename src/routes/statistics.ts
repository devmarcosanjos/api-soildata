import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { getSoilDataStats, getSoilDataSummary } from '../services/soil-data.js';
import {
  getTotalDatasets,
  getTotalDownloads,
  getTotalFiles,
  getMonthlyDownloads,
  getMonthlyDatasets,
} from '../services/dataverse.js';
import { handleError } from '../utils/errorHandler.js';

export async function statisticsRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const [soilStats, soilSummary, totalDatasets, totalDownloads, totalFiles] = await Promise.all([
        getSoilDataStats(),
        getSoilDataSummary(),
        getTotalDatasets().catch(() => ({ count: 0 })),
        getTotalDownloads().catch(() => ({ count: 0 })),
        getTotalFiles().catch(() => ({ count: 0 })),
      ]);

      return {
        success: true,
        statistics: {
          soilData: {
            total: soilStats.total,
            byState: soilStats.byState,
            byBiome: soilStats.byBiome,
            byDataset: soilStats.byDataset,
            summary: {
              states: soilSummary.states,
              municipalities: soilSummary.municipalities,
              biomes: soilSummary.biomes,
              datasets: soilSummary.datasets,
            },
          },
          dataverse: {
            totalDatasets: totalDatasets.count,
            totalDownloads: totalDownloads.count,
            totalFiles: totalFiles.count,
          },
          lastUpdate: new Date().toISOString(),
        },
      };
    } catch (error) {
      return handleError(reply, error, 'Erro ao buscar estatísticas', fastify.log);
    }
  });

  fastify.get('/monthly', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const [monthlyDownloads, monthlyDatasets] = await Promise.all([
        getMonthlyDownloads().catch(() => []),
        getMonthlyDatasets().catch(() => []),
      ]);

      return {
        success: true,
        monthly: {
          downloads: monthlyDownloads,
          datasets: monthlyDatasets,
        },
      };
    } catch (error) {
      return handleError(reply, error, 'Erro ao buscar estatísticas mensais', fastify.log);
    }
  });
}
