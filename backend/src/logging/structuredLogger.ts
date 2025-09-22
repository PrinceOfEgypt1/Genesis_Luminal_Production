/**
 * @fileoverview Logger estruturado para Genesis Luminal
 * @version 1.0.0
 */

import winston from 'winston';
import correlationId from 'correlation-id';

class GenesisLuminalLogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    });
  }

  public info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, { 
      correlationId: correlationId.getId(),
      ...meta 
    });
  }

  public error(message: string, meta?: Record<string, any>): void {
    this.logger.error(message, { 
      correlationId: correlationId.getId(),
      ...meta 
    });
  }
}

export const logger = new GenesisLuminalLogger();
