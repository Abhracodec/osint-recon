import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';
import { config } from './utils/config';
import { logger } from './utils/logger';
import { connectRedis } from './services/redis';
import { connectDatabase } from './services/database';
import { setupRoutes } from './routes';
import { setupJobQueue } from './services/queue';
import { errorHandler } from './middleware/errorHandler';
import requestLogger from './middleware/requestLogger';

const server = fastify({ logger: false }); // Using Winston

async function buildServer() {
  try {
    // --- Plugins ---
    await server.register(cors, {
      origin: config.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    });

    await server.register(helmet, { contentSecurityPolicy: false });

    await server.register(rateLimit, {
      max: config.RATE_LIMIT_REQUESTS_PER_MINUTE || 60,
      timeWindow: '1 minute',
      global: true,
    });

    await server.register(websocket);

    await server.register(multipart, {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    });

    // --- Swagger ---
    await server.register(swagger, {
      swagger: {
        info: {
          title: 'OSINT Recon API',
          description: 'Ethical OSINT Reconnaissance Platform API',
          version: '1.0.0',
        },
        host: `localhost:${config.PORT}`,
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
          { name: 'scan', description: 'Reconnaissance scan endpoints' },
          { name: 'proxy', description: 'Third-party API proxy endpoints' },
          { name: 'admin', description: 'Administrative endpoints' },
          { name: 'health', description: 'Health check endpoints' },
        ],
      },
    });

    await server.register(swaggerUi, { routePrefix: '/docs' });

    // --- Middleware ---
    await server.register(requestLogger);
    server.setErrorHandler(errorHandler);

    // --- External Services ---
    await connectRedis();
    await connectDatabase();
    await setupJobQueue();

    // --- Routes ---
    // This will prefix all routes with `/api`
    server.register(setupRoutes, { prefix: '/api' });

    // --- Health Check ---
    server.get('/api/health', async () => ({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        redis: 'connected',
        database: 'connected',
      },
    }));

    return server;
  } catch (err) {
    logger.error('Failed to build server:', err);
    process.exit(1);
  }
}

async function start() {
  try {
    const server = await buildServer();
    await server.listen({ port: config.PORT || 3001, host: '0.0.0.0' });
    logger.info(`🚀 Backend running at http://0.0.0.0:${config.PORT}`);
    logger.info(`📚 Swagger docs: http://localhost:${config.PORT}/docs`);

    // --- Graceful shutdown ---
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) start();

export { buildServer, start };
