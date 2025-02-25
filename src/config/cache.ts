import { env } from '@config/env';
import { logger } from '@config/logger';
import Redis from 'ioredis';

const redis = new Redis(env.REDIS_URL);

export const cache = {
  connect: async () => {
    try {
      await redis.ping();
      logger.info('Redis connected successfully.');
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      process.exit(1);
    }
  },

  disconnect: async () => {
    await redis.quit();
    logger.info('Redis disconnected.');
  },

  flush: async () => {
    await redis.flushdb();
    logger.info('Redis cache flushed.');
  },

  get: async <T>(key: string): Promise<T | null> => {
    const data = await redis.get(key);
    return data ? (JSON.parse(data) as T) : null;
  },

  set: async <T>(
    key: string,
    value: T,
    ttl: number = env.CACHE_TTL,
  ): Promise<void> => {
    const data = JSON.stringify(value);
    await redis.setex(key, ttl, data);
  },

  invalidate: async (pattern: string): Promise<void> => {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(keys);
  },
};
