export const config = {
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379'),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
  MAX_CONCURRENT_JOBS: parseInt(process.env.MAX_CONCURRENT_JOBS || '5'),
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
  DEMO_MODE: process.env.DEMO_MODE === 'true',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  TAVILY_API_KEY: process.env.TAVILY_API_KEY || '',
};
