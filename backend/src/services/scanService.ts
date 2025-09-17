import { redis } from './redis';
import { TavilySearchResponse } from './tavily';

const SCAN_PREFIX = 'scan:';
const RESULT_PREFIX = 'result:';
const JOB_EXPIRY = 60 * 60 * 24; // 24 hours

export async function createScanJob(target: string): Promise<string> {
  const jobId = Math.random().toString(36).substring(2);
  await redis.set(`${SCAN_PREFIX}${jobId}`, JSON.stringify({
    target,
    status: 'pending',
    createdAt: new Date().toISOString()
  }), 'EX', JOB_EXPIRY);
  return jobId;
}

export async function getJobStatus(jobId: string): Promise<string | null> {
  const job = await redis.get(`${SCAN_PREFIX}${jobId}`);
  if (!job) return null;
  return JSON.parse(job).status;
}

export async function setJobStatus(jobId: string, status: string): Promise<void> {
  const job = await redis.get(`${SCAN_PREFIX}${jobId}`);
  if (!job) throw new Error('Job not found');
  const jobData = JSON.parse(job);
  jobData.status = status;
  await redis.set(`${SCAN_PREFIX}${jobId}`, JSON.stringify(jobData), 'EX', JOB_EXPIRY);
}

export async function storeJobResults(jobId: string, results: TavilySearchResponse): Promise<void> {
  await redis.set(`${RESULT_PREFIX}${jobId}`, JSON.stringify(results), 'EX', JOB_EXPIRY);
  await setJobStatus(jobId, 'completed');
}

export async function getJobResults(jobId: string): Promise<TavilySearchResponse | null> {
  const results = await redis.get(`${RESULT_PREFIX}${jobId}`);
  if (!results) return null;
  return JSON.parse(results);
}