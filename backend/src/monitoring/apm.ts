/**
 * @fileoverview APM (Application Performance Monitoring) for Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

import { Request, Response, NextFunction } from 'express';
import correlationId from 'correlation-id';
import { sliMetrics } from '../metrics/sloSli';
import { logger } from '../logging/structuredLogger';

/**
 * Genesis Luminal APM Middleware
 * Comprehensive application performance monitoring
 */
export class GenesisLuminalAPM {
  /**
   * Correlation ID middleware
   */
  public static correlationMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const requestId = req.headers['x-request-id'] as string || 
                       `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      correlationId.withId(requestId, () => {
        req.headers['x-request-id'] = requestId;
        res.setHeader('x-request-id', requestId);
        next();
      });
    };
  }

  /**
   * Performance monitoring middleware
   */
  public static performanceMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      // Override res.end to capture metrics
      const originalEnd = res.end;
      res.end = function(...args: any[]) {
        const duration = (Date.now() - startTime) / 1000;
        
        // Record metrics
        sliMetrics.recordRequest(
          req.method,
          req.route?.path || req.path,
          res.statusCode,
          duration
        );

        // Log request
        logger.logRequest(
          req.method,
          req.originalUrl,
          res.statusCode,
          duration,
          req.headers['x-user-id'] as string
        );

        // Call original end
        originalEnd.apply(this, args);
      };

      next();
    };
  }

  /**
   * Error tracking middleware
   */
  public static errorTrackingMiddleware() {
    return (error: Error, req: Request, res: Response, next: NextFunction) => {
      // Record error metrics
      sliMetrics.recordError(
        error.name || 'UnknownError',
        req.route?.path || req.path
      );

      // Log error with context
      logger.error('Request error', {
        error: error.message,
        stack: error.stack,
        method: req.method,
        url: req.originalUrl,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });

      next(error);
    };
  }

  /**
   * Health check metrics
   */
  public static updateSystemMetrics(): void {
    setInterval(() => {
      // Monitor active connections (simplified)
      const connections = process.getActiveHandles().length;
      sliMetrics.updateActiveConnections(connections);

      // Log system health
      logger.debug('System health check', {
        activeHandles: connections,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Business metrics tracking
   */
  public static trackAnalysis(
    provider: string,
    analysisType: string,
    startTime: number,
    status: 'success' | 'error'
  ): void {
    const duration = (Date.now() - startTime) / 1000;
    
    sliMetrics.recordAnalysis(provider, analysisType, status, duration);
    
    logger.logBusinessEvent('analysis_completed', {
      provider,
      analysisType,
      duration,
      status,
    });
  }
}
