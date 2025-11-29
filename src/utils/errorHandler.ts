import { FastifyReply, FastifyLoggerInstance } from 'fastify';

export function handleError(
  reply: FastifyReply,
  error: unknown,
  defaultMessage: string,
  logger?: FastifyLoggerInstance,
  statusCode: number = 500
) {
  if (logger) {
    logger.error(error);
  }
  const message = error instanceof Error ? error.message : defaultMessage;
  reply.code(statusCode);
  return {
    success: false,
    error: defaultMessage,
    message,
  };
}

