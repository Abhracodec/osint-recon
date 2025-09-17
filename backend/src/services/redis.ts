import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';
import { config } from '../utils/config';

let redisClient: RedisClientType;

export async function connectRedis(): Promise<RedisClientType> {
  try {
    redisClient = createClient({
      url: config.REDIS_URL,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Connected to Redis');
    });

    redisClient.on('disconnect', () => {
      logger.warn('Disconnected from Redis');
    });

    await redisClient.connect();
    
    // Test connection
    await redisClient.ping();
    logger.info('Redis connection established successfully');
    
    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
}

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
}
