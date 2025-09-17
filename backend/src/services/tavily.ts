import axios from 'axios';
import { config } from '../utils/config';

export interface TavilySearchResponse {
  results: Array<{
    url: string;
    title: string;
    content: string;
  }>;
}

export class TavilyService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.tavily.com/v1';

  constructor() {
    const apiKey = config.TAVILY_API_KEY;
    if (!apiKey) {
      throw new Error('TAVILY_API_KEY is not configured');
    }
    this.apiKey = apiKey;
  }

  async search(target: string): Promise<TavilySearchResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/search`,
        {
          query: `Search for information about ${target}`,
          search_depth: "advanced",
          include_domains: [target],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.apiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Tavily API error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }
}

export const tavilyService = new TavilyService();