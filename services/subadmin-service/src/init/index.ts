// src/init/index.ts
import { AppDataSource } from '../data-source';
import { redisClient } from '../config/redis';
import { connectKafka } from '../events/kafka';
import logger from '../config/logger';

export const init = async () => {
  try {
    logger.info('Starting infrastructure initialization...');

    // 1️⃣ Database
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connected successfully');
    }

    // 2️⃣ Redis
    const pong = await redisClient.ping();
    if (pong !== 'PONG') {
      throw new Error('Redis ping failed');
    }
    logger.info('Redis connected successfully');

    // 3️⃣ Kafka
    await connectKafka();
    logger.info('Kafka connected successfully');
  } catch (err) {
    logger.error('Error initializing infrastructure', err);
    process.exit(1);
  }
};
