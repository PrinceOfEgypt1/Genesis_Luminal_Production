/**
 * @fileoverview Structured logging with correlation IDs for Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

import winston from 'winston';
import correlationId from 'correlation-id';

/**
 * Genesis Luminal Structured Logger
 * Production-ready logging with correlation tracking
 */
class GenesisLuminalLogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf((info) => {
          return JSON.stringify({
            timestamp: info.timestamp,
            level: info.level,
            message: info.message,
            correlationId: correlationId.getId() || 'unknown',
            ...info.meta,
            ...(info.stack && { stack: info.stack }),
          });
        })
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ],
    });
  }

  /**
   * Log info with structured metadata
   */
  public info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, { meta });
  }

  /**
   * Log error with structured metadata
   */
  public error(message: string, meta?: Record<string, any>): void {
    this.logger.error(message, { meta });
  }

  /**
   * Log warning with structured metadata
   */
  public warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(message, { meta });
  }

  /**
   * Log debug with structured metadata
   */
  public debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(message, { meta });
  }

  /**
   * Log request with comprehensive context
   */
  public logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId?: string
  ): void {
    this.info('Request processed', {
      method,
      url,
      statusCode,
      duration,
      userId,
      requestId: correlationId.getId(),
    });
  }

  /**
   * Log business event
   */
  public logBusinessEvent(
    event: string,
    context: Record<string, any>
  ): void {
    this.info(`Business event: ${event}`, {
      event,
      ...context,
    });
  }
}

// Export singleton instance
export const logger = new GenesisLuminalLogger();
