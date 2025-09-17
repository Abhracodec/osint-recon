import { Worker, Job } from 'bullmq';
import { config } from './utils/config';
import { ScanProcessor } from './services/scanProcessor';

// Simple console logger
type LogLevel = 'info' | 'error' | 'warn' | 'debug';

const format = (level: LogLevel, message: any, ...args: any[]) => {
  const timestamp = new Date().toISOString();
  if (args.length) {
    console[level](`[${timestamp}] [${level.toUpperCase()}] ${message}`, ...args);
  } else {
    console[level](`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }
};

export const logger = {
  info: (msg: any, ...args: any[]) => format('info', msg, ...args),
  error: (msg: any, ...args: any[]) => format('error', msg, ...args),
  warn: (msg: any, ...args: any[]) => format('warn', msg, ...args),
  debug: (msg: any, ...args: any[]) => format('debug', msg, ...args),
};

async function main() {
  try {
    logger.info('Starting OSINT Recon Worker...');

    // Redis connection from env
    const redisConnection = {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      password: config.REDIS_PASSWORD,
    };

    const scanProcessor = new ScanProcessor();

    const worker = new Worker(
      'osint-scan',
      async (job: Job) => {
        logger.info(`Processing job ${job.id}`);
        return await scanProcessor.processJob(job.data);
      },
      {
        connection: redisConnection,
        concurrency: config.MAX_CONCURRENT_JOBS || 5,
      }
    );

    worker.on('completed', (job) => {
      logger.info(`Job ${job.id} completed successfully`);
    });

    worker.on('failed', (job, err) => {
      logger.error(`Job ${job?.id} failed:`, err);
    });

    worker.on('error', (err) => {
      logger.error('Worker error:', err);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down worker gracefully...`);
      await worker.close();
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    logger.info('🔧 OSINT Recon Worker started successfully');
  } catch (error) {
    logger.error('Failed to start worker:', error);
    process.exit(1);
  }
}

// Start worker only if this file is run directly
if (require.main === module) {
  main();
}

export { main };
