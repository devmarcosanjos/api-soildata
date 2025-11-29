import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { routes } from './routes/index.js';

const fastify: FastifyInstance = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
              colorize: true,
            },
          }
        : undefined,
  },
});

// Registrar plugins
async function registerPlugins() {
  // CORS - Configurável via variável de ambiente
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : process.env.NODE_ENV === 'production'
    ? ['https://soildata.cmob.online'] // Default para produção
    : true; // Em desenvolvimento, permite todas as origens

  await fastify.register(cors, {
    origin: allowedOrigins,
    credentials: true,
  });
}

// Registrar rotas
async function registerRoutes() {
  await fastify.register(routes);
}

// Iniciar servidor
const start = async () => {
  try {
    await registerPlugins();
    await registerRoutes();

    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    console.log(`🚀 API SoilData rodando em http://${host}:${port}`);
    console.log(`📚 Health check: http://${host}:${port}/health`);
    console.log(`📊 Endpoints disponíveis:`);
    console.log(`   - GET /api/datasets - Últimos datasets`);
    console.log(`   - GET /api/soil-data - Dados de solo`);
    console.log(`   - GET /api/metrics - Métricas`);
    console.log(`   - GET /api/statistics - Estatísticas`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  await fastify.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await fastify.close();
  process.exit(0);
});

start();

