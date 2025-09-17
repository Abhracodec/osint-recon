// Load environment variables
require('dotenv').config();

interface Config {
  NODE_ENV: string;
  PORT: number;
  DEMO_MODE: boolean;
  
  // Redis
  REDIS_URL: string;
  REDIS_PASSWORD?: string;
  
  // PostgreSQL
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_DB: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  
  // Security
  JWT_SECRET: string;
  ENCRYPTION_KEY: string;
  ADMIN_TOKEN: string;
  
  // API Keys
  SHODAN_API_KEY?: string;
  GITHUB_OAUTH_TOKEN?: string;
  WAPPALYZER_API_KEY?: string;
  WHOISXML_API_KEY?: string;
  GOOGLE_CUSTOM_SEARCH_KEY?: string;
  GOOGLE_CUSTOM_SEARCH_CX?: string;
  SECURITYTRAILS_API_KEY?: string;
  CENSYS_API_ID?: string;
  CENSYS_API_SECRET?: string;
  
  // Rate Limiting
  RATE_LIMIT_REQUESTS_PER_MINUTE: number;
  GLOBAL_RATE_LIMIT_REQUESTS_PER_MINUTE: number;
  
  // Job Processing
  MAX_CONCURRENT_JOBS: number;
  JOB_TIMEOUT_SECONDS: number;
  ACTIVE_SCAN_TIMEOUT_SECONDS: number;
  
  // Docker
  DOCKER_HOST: string;
  AMASS_DOCKER_IMAGE: string;
  SUBFINDER_DOCKER_IMAGE: string;
  
  // Logging
  LOG_LEVEL: string;
  LOG_FORMAT: string;
  
  // CORS
  CORS_ORIGIN: string;
  
  // SSL
  SSL_CERT_PATH?: string;
  SSL_KEY_PATH?: string;
}

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'ENCRYPTION_KEY',
  'ADMIN_TOKEN',
];

function validateConfig(): void {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    if (process.env.NODE_ENV !== 'development') {
      process.exit(1);
    } else {
      console.warn('Running in development mode with default values');
    }
  }
}

// Validate configuration on startup
validateConfig();

export const config: Config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  DEMO_MODE: process.env.DEMO_MODE === 'true',
  
  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  
  // PostgreSQL
  POSTGRES_HOST: process.env.POSTGRES_HOST || 'localhost',
  POSTGRES_PORT: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  POSTGRES_DB: process.env.POSTGRES_DB || 'osint_recon',
  POSTGRES_USER: process.env.POSTGRES_USER || 'osint_user',
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || 'password',
  
  // Security
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'dev_32_character_key_change_me_now',
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || 'dev_admin_token',
  
  // API Keys
  SHODAN_API_KEY: process.env.SHODAN_API_KEY,
  GITHUB_OAUTH_TOKEN: process.env.GITHUB_OAUTH_TOKEN,
  WAPPALYZER_API_KEY: process.env.WAPPALYZER_API_KEY,
  WHOISXML_API_KEY: process.env.WHOISXML_API_KEY,
  GOOGLE_CUSTOM_SEARCH_KEY: process.env.GOOGLE_CUSTOM_SEARCH_KEY,
  GOOGLE_CUSTOM_SEARCH_CX: process.env.GOOGLE_CUSTOM_SEARCH_CX,
  SECURITYTRAILS_API_KEY: process.env.SECURITYTRAILS_API_KEY,
  CENSYS_API_ID: process.env.CENSYS_API_ID,
  CENSYS_API_SECRET: process.env.CENSYS_API_SECRET,
  
  // Rate Limiting
  RATE_LIMIT_REQUESTS_PER_MINUTE: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '60', 10),
  GLOBAL_RATE_LIMIT_REQUESTS_PER_MINUTE: parseInt(process.env.GLOBAL_RATE_LIMIT_REQUESTS_PER_MINUTE || '1000', 10),
  
  // Job Processing
  MAX_CONCURRENT_JOBS: parseInt(process.env.MAX_CONCURRENT_JOBS || '5', 10),
  JOB_TIMEOUT_SECONDS: parseInt(process.env.JOB_TIMEOUT_SECONDS || '1800', 10),
  ACTIVE_SCAN_TIMEOUT_SECONDS: parseInt(process.env.ACTIVE_SCAN_TIMEOUT_SECONDS || '300', 10),
  
  // Docker
  DOCKER_HOST: process.env.DOCKER_HOST || 'unix:///var/run/docker.sock',
  AMASS_DOCKER_IMAGE: process.env.AMASS_DOCKER_IMAGE || 'caffix/amass:latest',
  SUBFINDER_DOCKER_IMAGE: process.env.SUBFINDER_DOCKER_IMAGE || 'projectdiscovery/subfinder:latest',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FORMAT: process.env.LOG_FORMAT || 'json',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // SSL
  SSL_CERT_PATH: process.env.SSL_CERT_PATH,
  SSL_KEY_PATH: process.env.SSL_KEY_PATH,
};

export default config;