import { FastifyReply } from 'fastify';

export function handleError(
  reply: FastifyReply,
  error: unknown,
  message: string,
  logger?: { error: (msg: unknown) => void }
): FastifyReply {
  if (logger) {
    logger.error(error);
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  const statusCode = 500;

  return reply.status(statusCode).send({
    success: false,
    error: message,
    message: errorMessage,
    status: statusCode,
  });
}

