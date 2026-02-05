import winston from 'winston';
import { config } from './config';

// 1️⃣ Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }), // stack trace for errors
  winston.format.splat(), // support printf-style messages
  winston.format.json() // JSON logs (production-ready)
);

// 2️⃣ Create Winston logger
const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: config.SERVICE_NAME },
  transports: [
    // Console output
    new winston.transports.Console(),
    // Future: file logging
    // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// 3️⃣ Optional: stream for morgan HTTP logging
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export default logger;
