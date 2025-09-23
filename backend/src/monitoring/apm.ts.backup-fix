/**
 * @fileoverview APM básico para Genesis Luminal
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import correlationId from 'correlation-id';
import { sliMetrics } from '../metrics/sloSli';
import { logger } from '../logging/structuredLogger';

export class GenesisLuminalAPM {
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

  public static performanceMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      const originalEnd = res.end;
      res.end = function(...args: any[]) {
        const duration = (Date.now() - startTime) / 1000;
        
        sliMetrics.recordRequest(
          req.method,
          req.route?.path || req.path,
          res.statusCode,
          duration
        );

        logger.info('Request processed', {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          duration,
        });

        originalEnd.apply(this, args);
      };

      next();
    };
  }
}
