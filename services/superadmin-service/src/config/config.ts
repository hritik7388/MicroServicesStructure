
interface Config {
  SERVICE_NAME: string;
  PORT: number;
  DATABASE_URL: string;
  REDIS_URL: string;
  KAFKA_BROKER: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  LOG_LEVEL: string;
  ALLOWED_ORIGINS: string;
}

export const config: Config = {
  SERVICE_NAME: require('../../package.json').name,
  PORT: Number(process.env.PORT) || 3001,
  DATABASE_URL:process.env.DATABASE_URL || "mysql://root:root123@127.0.0.1:3306/MICRO_SERVICES_STRUCTURE",
  REDIS_URL: process.env.REDIS_URL || 'redis://:cantremember@127.0.0.1:6380',
  KAFKA_BROKER: process.env.KAFKA_BROKER || 'localhost:9092',
  JWT_SECRET: process.env.JWT_SECRET || '01aee198bd1475f54ba9fbc7663430a8e659d8755b550fcb322008f0f66d3719',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'ttp://localhost:3000',
};