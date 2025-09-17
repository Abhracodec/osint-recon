import { FastifyPluginAsync } from 'fastify';
import { logger } from '../utils/logger';

const requestLogger: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', async (request) => {
    // Log when the request starts
    logger.info('Incoming request', {
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const duration = reply.getResponseTime();

    logger.info('Completed request', {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: `${duration}ms`,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      // In dev only, log more details
      ...(process.env.NODE_ENV === 'development' && {
        headers: request.headers,
        query: request.query,
      }),
    });
  });
};

export default requestLogger;
