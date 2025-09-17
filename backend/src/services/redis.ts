import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';
import { config } from '../utils/config';

export let redis: RedisClientType;

export async function connectRedis(): Promise<RedisClientType> {
  try {
    redis = createClient({
      url: config.REDIS_URL,
    });

    redis.on('error', (err: Error) => {
      logger.error('Redis client error:', err);
    });

    redis.on('connect', () => {
      logger.info('Connected to Redis');
    });

    redis.on('disconnect', () => {
      logger.warn('Disconnected from Redis');
    });

    await redis.connect();
    
    // Test connection
    await redis.ping();
    logger.info('Redis connection established successfully');
    
    return redis;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
}

export function getRedisClient(): RedisClientType {
  if (!redis) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redis;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    logger.info('Redis connection closed');
  }
}
