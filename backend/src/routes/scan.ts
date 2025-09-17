import { FastifyInstance } from 'fastify';
import { getJobStatus, getJobResults, createScanJob } from '../services/scanService';

interface ScanRequestBody {
  target: string;
}

export async function scanRoutes(server: FastifyInstance) {
  /**
   * ✅ Start a new scan
   */
  server.post<{ Body: ScanRequestBody }>('/api/scan', async (request, reply) => {
    try {
      const { target } = request.body;

      if (!target) {
        return reply.code(400).send({ error: 'Target is required' });
      }

      const jobId = await createScanJob(target);

      return { jobId }; // Frontend expects { jobId }
    } catch (err) {
      request.log.error('Failed to create scan:', err);
      return reply.code(500).send({ error: 'Failed to create scan' });
    }
  });

  /**
   * ✅ Get scan status
   */
  server.get<{ Params: { jobId: string } }>('/api/scan/:jobId/status', async (request, reply) => {
    try {
      const { jobId } = request.params;

      const status = await getJobStatus(jobId);
      if (!status) return reply.code(404).send({ error: 'Job not found' });

      return { jobId, status }; // Frontend expects { jobId, status }
    } catch (err) {
      request.log.error('Failed to fetch scan status:', err);
      return reply.code(500).send({ error: 'Failed to fetch status' });
    }
  });

  /**
   * ✅ Get scan results
   */
  server.get<{ Params: { jobId: string } }>('/api/scan/:jobId/results', async (request, reply) => {
    try {
      const { jobId } = request.params;

      const results = await getJobResults(jobId);
      if (!results) return reply.code(404).send({ error: 'No results found' });

      return { jobId, results }; // Frontend expects { jobId, results }
    } catch (err) {
      request.log.error('Failed to fetch scan results:', err);
      return reply.code(500).send({ error: 'Failed to fetch results' });
    }
  });
}
