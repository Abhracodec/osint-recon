// worker/src/services/tavily.ts
import axios from 'axios';
import configDefault from '../utils/config';

// compatibility in case config is exported as default or named
const cfg: any = (configDefault && (configDefault as any).default) ? (configDefault as any).default : configDefault;

const TAVILY_API_BASE = 'https://api.tavily.com';
const DEFAULT_TIMEOUT = 60_000;

export async function tavilySearch(query: string, max_results = 10, search_depth: 'basic' | 'advanced' = 'basic') {
  if (!cfg || !cfg.TAVILY_API_KEY) {
    throw new Error('Tavily API key missing (TAVILY_API_KEY). Set it in .env');
  }

  const payload = {
    query,
    max_results,
    search_depth,
  };

  try {
    const resp = await axios.post(`${TAVILY_API_BASE}/v1/search`, payload, {
      headers: {
        Authorization: `Bearer ${cfg.TAVILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: DEFAULT_TIMEOUT,
    });

    // return raw body to caller to decide how to map it
    return resp.data;
  } catch (err: any) {
    // surface useful error
    const errData = err?.response?.data ?? err?.message ?? err;
    throw new Error(`Tavily API error: ${JSON.stringify(errData)}`);
  }
}
