import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { addScanJob, getJobStatus, cancelJob } from '../services/queue';
import { ScanRequest } from '../types';
import { config } from '../utils/config';

export default async function setupRoutes(server: FastifyInstance, _options: unknown, done: () => void): Promise<void> {
  try {
    /**
     * ✅ Start new reconnaissance scan
     */
  server.post<{ Body: ScanRequest }>('/scan/start', async (request, reply) => {
    try {
      const scanRequest: ScanRequest = request.body;
      if (!scanRequest.target || !scanRequest.targetType) {
        return reply.code(400).send({ error: 'Target and targetType are required' });
      }

      const jobId = uuidv4();
      await addScanJob(scanRequest, jobId);

      return { jobId }; // ✅ frontend expects { jobId }
    } catch (error) {
      logger.error('Failed to start scan:', error);
      return reply.code(500).send({ error: 'Failed to start scan' });
    }
  });

  /**
   * ✅ Get job status
   */
  server.get<{ Params: { jobId: string } }>('/scan/:jobId/status', async (request, reply) => {
    try {
      const { jobId } = request.params;
      const status = await getJobStatus(jobId);

      if (!status) return reply.code(404).send({ error: 'Job not found' });

      return { status }; // ✅ frontend expects { status }
    } catch (error) {
      logger.error('Failed to get job status:', error);
      return reply.code(500).send({ error: 'Failed to get job status' });
    }
  });

  /**
   * ✅ Get scan results
   */
  server.get<{ Params: { jobId: string } }>('/scan/:jobId/results', async (request, reply) => {
    try {
      const { jobId } = request.params;

      // Placeholder mock data
      const results = {
        jobId,
        target: 'example.com',
        modulesCovered: ['subdomains', 'certificates', 'techstack'],
        findings: [],
      };

      return results; // ✅ frontend expects raw results
    } catch (error) {
      logger.error('Failed to get scan results:', error);
      return reply.code(500).send({ error: 'Failed to get scan results' });
    }
  });

  /**
   * ✅ Cancel scan
   */
  server.post<{ Params: { jobId: string } }>('/scan/:jobId/cancel', async (request, reply) => {
    try {
      const { jobId } = request.params;
      const cancelled = await cancelJob(jobId);

      if (!cancelled) return reply.code(404).send({ error: 'Job not found or already completed' });

      return { cancelled: true };
    } catch (error) {
      logger.error('Failed to cancel job:', error);
      return reply.code(500).send({ error: 'Failed to cancel job' });
    }
  });

  /**
   * ✅ Admin approve active scan
   */
  server.post<{ Body: { jobId: string; adminToken: string } }>('/admin/approve-active-scan', async (request, reply) => {
    try {
      const { jobId, adminToken } = request.body;

      if (adminToken !== config.ADMIN_TOKEN) {
        return reply.code(401).send({ error: 'Invalid admin token' });
      }

      logger.info(`Admin approved active scan for job ${jobId}`);
      return { approved: true };
    } catch (error) {
      logger.error('Failed to approve active scan:', error);
      return reply.code(500).send({ error: 'Failed to approve active scan' });
    }
  });

      logger.info('API routes registered successfully');
    done();
  } catch (error) {
    logger.error('Failed to register routes:', error);
    throw error;
  }
}

