import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient } from './redis';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import { ScanRequest, JobProgress } from '../types';

let scanQueue: Queue;
let scanWorker: Worker;

export async function setupJobQueue(): Promise<void> {
  try {
    const redisUrl = new URL(config.REDIS_URL);
    const redisConnection = {
      host: redisUrl.hostname,
      port: parseInt(redisUrl.port || '6379'),
      username: redisUrl.username || undefined,
      password: redisUrl.password || config.REDIS_PASSWORD,
      tls: redisUrl.protocol === 'rediss:' ? {} : undefined,
    } as any;

    // Create queue
    scanQueue = new Queue('osint-scan', {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    logger.info('Job queue initialized successfully');
  } catch (error) {
    logger.error('Failed to setup job queue:', error);
    throw error;
  }
}

export async function addScanJob(scanRequest: ScanRequest, jobId: string): Promise<Job> {
  if (!scanQueue) {
    throw new Error('Job queue not initialized');
  }

  const job = await scanQueue.add(
    'scan',
    {
      jobId,
      ...scanRequest,
    },
    {
      jobId,
      delay: 0,
    }
  );

  logger.info(`Added scan job ${jobId} to queue`);
  return job;
}

export async function getJobStatus(jobId: string): Promise<JobProgress | null> {
  if (!scanQueue) {
    throw new Error('Job queue not initialized');
  }

  try {
    const job = await scanQueue.getJob(jobId);
    if (!job) {
      return null;
    }

    return {
      jobId: job.id as string,
      status: await job.getState() as any,
      progress: job.progress as number || 0,
      currentModule: job.data.currentModule || 'initializing',
      completedModules: job.data.completedModules || [],
      totalModules: job.data.totalModules || job.data.modules?.length || 8,
      startedAt: new Date(job.timestamp).toISOString(),
      completedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : undefined,
      estimatedTimeRemaining: job.data.estimatedTimeRemaining,
      logs: job.data.logs || [],
    };
  } catch (error) {
    logger.error(`Failed to get job status for ${jobId}:`, error);
    return null;
  }
}

export async function cancelJob(jobId: string): Promise<boolean> {
  if (!scanQueue) {
    throw new Error('Job queue not initialized');
  }

  try {
    const job = await scanQueue.getJob(jobId);
    if (!job) {
      return false;
    }

    await job.remove();
    logger.info(`Cancelled job ${jobId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to cancel job ${jobId}:`, error);
    return false;
  }
}

export function getScanQueue(): Queue {
  if (!scanQueue) {
    throw new Error('Job queue not initialized');
  }
  return scanQueue;
}