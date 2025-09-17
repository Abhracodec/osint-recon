import winston from 'winston';
import { config } from './config';

const logLevel = config.LOG_LEVEL || 'info';
const logFormat = config.LOG_FORMAT || 'json';

// Custom format for development
const developmentFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// Production format (JSON)
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat === 'json' ? productionFormat : developmentFormat,
  defaultMeta: { service: 'osint-recon-backend' },
  transports: [
    new winston.transports.Console(),
  ],
});

// Add file transport for production
if (config.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error'
  }));
  
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log'
  }));
}

export default logger;