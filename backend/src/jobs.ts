// backend/src/jobs.ts
import { Worker, Job, QueueScheduler, Queue } from 'bullmq';
import { config } from './utils/config';
import { logger } from './utils/logger';
import { ScanRequest, JobProgress } from './types';
import { createClient } from 'redis';

const QUEUE_NAME = 'scan';

function redisConnectionOptions() {
  // Prefer explicit host/port environment vars (container-friendly)
  const host = process.env.REDIS_HOST || 'redis';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;

  return {
    host,
    port,
    password,
  };
}

/**
 * Simulated module runner.
 * Replace the internals of each module block below with real calls to Tavily
 * or other providers when you have the provider client and API contract.
 */
async function runModulesSimulated(jobData: any, updateProgress: (p: number, meta?: any) => Promise<void>) {
  // modules order example
  const modules = [
    { name: 'subdomains', seconds: 2 },
    { name: 'techFingerprint', seconds: 2 },
    { name: 'sslScan', seconds: 1 },
    { name: 'whois', seconds: 1 },
    { name: 'portScan', seconds: 2 },
  ];

  const findings: any[] = [];
  let completed = 0;

  for (const mod of modules) {
    // progress before module
    const beforeProgress = Math.round((completed / modules.length) * 100);
    await updateProgress(beforeProgress, { currentModule: mod.name });

    // simulate doing work (replace this with real provider call)
    await new Promise((r) => setTimeout(r, mod.seconds * 1000));

    // create fake/simulated output. Replace with real provider result structure.
    if (mod.name === 'subdomains') {
      findings.push({
        type: 'subdomains',
        data: [
          { host: `www.${jobData.target}`, ip: '93.184.216.34', source: 'crt.sh' },
          { host: `mail.${jobData.target}`, ip: '93.184.216.34', source: 'certificate-transparency' },
        ],
      });
    } else if (mod.name === 'techFingerprint') {
      findings.push({
        type: 'technology',
        data: [
          { name: 'Apache', category: 'Web Server', confidence: 90 },
          { name: 'PHP', category: 'Language', confidence: 85 },
        ],
      });
    } else if (mod.name === 'sslScan') {
      findings.push({
        type: 'ssl',
        data: {
          issuer: 'DigiCert Inc',
          validFrom: '2023-01-01',
          validTo: '2024-01-01',
          sans: [jobData.target, `www.${jobData.target}`],
        },
      });
    } else if (mod.name === 'whois') {
      findings.push({
        type: 'whois',
        data: { registrar: 'Example Registrar', created: '2010-01-01' },
      });
    } else if (mod.name === 'portScan') {
      findings.push({
        type: 'ports',
        data: [
          { port: 80, proto: 'tcp', service: 'http' },
          { port: 443, proto: 'tcp', service: 'https' },
        ],
      });
    }

    completed++;
    const afterProgress = Math.round((completed / modules.length) * 100);
    await updateProgress(afterProgress, { completedModules: completed, currentModule: '' });
  }

  return findings;
}

/**
 * Build a BullMQ Worker that listens to the `scan` queue.
 * The handler updates progress and returns a result object that mirror what
 * the frontend expects.
 */
export function startWorker(): Worker {
  // queue scheduler helps with stalled jobs, retries, etc.
  const connectionOptions = redisConnectionOptions();
  const scheduler = new QueueScheduler(QUEUE_NAME, { connection: connectionOptions });

  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      const startTs = Date.now();
      logger.info(`Worker picked up job ${job.id}`, { jobData: job.data });

      // helper to update progress (percent and optional metadata)
      const updateProgress = async (percent: number, meta: any = {}) => {
        try {
          await job.updateProgress({ percent, ...meta });
          logger.info(`Job ${job.id} progress ${percent}%`, meta);
        } catch (err) {
          logger.warn('Failed to update job progress', { err, jobId: job.id });
        }
      };

      // ensure job.data has target
      const payload = job.data || {};
      const target = payload.target || payload.domain || payload.jobId || 'example.com';

      // mark starting
      await updateProgress(0, { currentModule: 'start' });

      // RUN modules (simulated) - replace with provider integration where indicated
      const findings = await runModulesSimulated({ target }, updateProgress);

      // prepare final result object (adjust fields to match frontend expectations)
      const durationMs = Date.now() - startTs;
      const result = {
        jobId: job.id,
        target,
        completedAt: new Date().toISOString(),
        startedAt: new Date(job.timestamp).toISOString(),
        durationMs,
        findings,
        summary: {
          totalFindings: findings.flatMap((f:any) => (f.data || [])).length,
          high: 1,
          medium: 3,
          low: 5,
        },
      };

      // final progress
      await updateProgress(100, { currentModule: 'done', completedAt: result.completedAt });

      logger.info(`Job ${job.id} completed`, { result });

      // return result as job return value
      return result;
    },
    {
      connection: connectionOptions,
      concurrency: config.MAX_CONCURRENT_JOBS || 2,
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Worker completed job ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Worker job ${job?.id} failed`, err);
  });

  worker.on('error', (err) => {
    logger.error('Worker error', err);
  });

  logger.info('Worker started and listening for jobs on queue:', QUEUE_NAME);
  return worker;
}

/**
 * Convenience: create the queue instance for ad-hoc usage (not strictly needed by the worker)
 * If your code elsewhere expects to import getScanQueue(), you can add one here.
 */
export function createScanQueue(): Queue {
  const connectionOptions = redisConnectionOptions();
  const q = new Queue(QUEUE_NAME, { connection: connectionOptions });
  return q;
}
