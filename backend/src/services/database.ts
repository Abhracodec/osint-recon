import { Pool } from 'pg';
import { config } from '../utils/config';
import { logger } from '../utils/logger';

let pool: Pool;

export async function connectDatabase(): Promise<Pool> {
  try {
    const useUrl = Boolean(config.DATABASE_URL && config.DATABASE_URL.length > 0);

    pool = useUrl
      ? new Pool({
          connectionString: config.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        })
      : new Pool({
          host: config.POSTGRES_HOST,
          port: config.POSTGRES_PORT,
          database: config.POSTGRES_DB,
          user: config.POSTGRES_USER,
          password: config.POSTGRES_PASSWORD,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        });

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    logger.info('Database connection established successfully');
    return pool;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

export function getDatabasePool(): Pool {
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectDatabase() first.');
  }
  return pool;
}

export async function disconnectDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    logger.info('Database connection closed');
  }
}