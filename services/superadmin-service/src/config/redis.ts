import Redis from 'ioredis';
import { config } from './config';
import logger  from './logger';

export const redisClient = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});

redisClient.on('connect', () => {
  logger.info('Redis connection established');
});

redisClient.on('ready', () => {
  logger.info('Redis ready to use');
});

redisClient.on('error', (error) => {
  logger.error('Redis connection error', error);
});

redisClient.on('close', () => {
  logger.warn('Redis connection closed');
});
