import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { config } from './config/index.js';
import { routes } from './routes/index.js';

const fastify: FastifyInstance = Fastify({
  logger: {
    level: config.logger.level,
    transport: config.logger.pretty
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

async function registerPlugins() {
  await fastify.register(cors, {
    origin: config.cors.origins,
    credentials: true,
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
  });
}

async function registerRoutes() {
  await fastify.register(routes);
}

async function start() {
  try {
    await registerPlugins();
    await registerRoutes();

    await fastify.listen({
      port: config.server.port,
      host: config.server.host,
    });

    console.log(`API SoilData running on http://${config.server.host}:${config.server.port}`);
    console.log(`Environment: ${config.env.nodeEnv}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

const shutdown = async () => {
  await fastify.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();

