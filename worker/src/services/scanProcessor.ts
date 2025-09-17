// worker/src/services/scanProcessor.ts
import { logger } from '../utils/logger';
import { config } from '../utils/config';
import { tavilySearch } from './tavily';

export class ScanProcessor {
  async processJob(jobData: any): Promise<any> {
    try {
      logger.info(`Starting scan for target: ${jobData.target}`);

      const baseResults: any = {
        jobId: jobData.jobId,
        target: jobData.target,
        targetType: jobData.targetType,
        startedAt: new Date().toISOString(),
        completedAt: null,
        findings: [],
        metadata: {
          consentHash: this.hashConsent(jobData.consent),
          rateProfile: jobData.rateProfile || 'low',
          activeModulesUsed: jobData.enableActiveModules || false,
          totalApiCalls: 0,
        },
      };

      // Demo mode
      if (config.DEMO_MODE) {
        logger.info('Running in demo mode - returning mock results');
        return this.getMockResults(baseResults);
      }

      // Tavily API
      if (!config.TAVILY_API_KEY) {
        logger.warn('No Tavily API key found; skipping Tavily.');
        baseResults.metadata.note = 'No Tavily key configured; no live data retrieved.';
        baseResults.completedAt = new Date().toISOString();
        return baseResults;
      }

      // Run Tavily query
      try {
        const query = `site:${jobData.target}`;
        logger.info(`Running Tavily query: ${query}`);
        const tavilyResp = await tavilySearch(query, 20, 'basic');
        baseResults.metadata.totalApiCalls += 1;

        if (tavilyResp && Array.isArray(tavilyResp.results)) {
          tavilyResp.results.forEach((r: any) => {
            baseResults.findings.push({
              type: 'web-result',
              title: r.title || r.url || 'tavily-result',
              description: r.excerpt || r.content || '',
              url: r.url || null,
              source: 'tavily',
              timestamp: r.timestamp || new Date().toISOString(),
            });
          });
        } else if (tavilyResp && typeof tavilyResp === 'object') {
          baseResults.metadata.tavilyRaw = tavilyResp;
        } else {
          logger.info(`Tavily returned no results for query: ${query}`);
        }
      } catch (err: any) {
        logger.error('Error while calling Tavily:', err);
        baseResults.metadata.tavilyError = err?.message || String(err);
      }

      baseResults.completedAt = new Date().toISOString();
      return baseResults;

    } catch (error) {
      logger.error('ScanProcessor failed:', error);
      throw error;
    }
  }

  hashConsent(consent: any) {
    if (!consent) return null;
    try {
      const str = JSON.stringify(consent);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
      }
      return 'h' + Math.abs(hash).toString();
    } catch {
      return null;
    }
  }

  getMockResults(baseResults: any) {
    return {
      ...baseResults,
      findings: baseResults.findings.length
        ? baseResults.findings
        : [{
            type: 'mock',
            title: 'Demo result',
            description: 'No real results available (demo fallback)',
            source: 'mock',
            timestamp: new Date().toISOString(),
          }],
      metadata: {
        ...baseResults.metadata,
        totalApiCalls: baseResults.metadata.totalApiCalls || 0,
      },
      completedAt: new Date().toISOString(),
    };
  }
}
