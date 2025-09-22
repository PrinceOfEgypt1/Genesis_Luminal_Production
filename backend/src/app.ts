/**
 * @fileoverview Genesis Luminal Express Application with Enterprise Observability
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { register } from 'prom-client';

// Import observability modules
import { telemetry } from './telemetry/opentelemetry';
import { GenesisLuminalAPM } from './monitoring/apm';
import { logger } from './logging/structuredLogger';

// Import existing modules
import { router as analysisRouter } from './routes/analysis';
import { router as healthRouter } from './routes/health';
import { router as metricsRouter } from './routes/metrics';
import { securityHeaders } from './middleware/security/securityHeaders';

/**
 * Genesis Luminal Express Application
 * Enterprise-grade AI analysis platform with comprehensive observability
 */
class GenesisLuminalApp {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeObservability();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize observability and monitoring
   */
  private initializeObservability(): void {
    // Initialize OpenTelemetry
    telemetry.initialize();

    // Start system metrics monitoring
    GenesisLuminalAPM.updateSystemMetrics();

    logger.info('Observability initialized', {
      service: 'genesis-luminal-api',
      version: '1.0.0',
      environment: process.env.NODE_ENV,
    });
  }

  /**
   * Initialize middleware stack
   */
  private initializeMiddleware(): void {
    // Security headers (enterprise-grade)
    this.app.use(securityHeaders);

    // APM middleware (correlation and performance)
    this.app.use(GenesisLuminalAPM.correlationMiddleware());
    this.app.use(GenesisLuminalAPM.performanceMiddleware());

    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    }));

    // Rate limiting
    this.app.use(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Increased for production load
      message: { error: 'Too many requests, please try again later' },
      standardHeaders: true,
      legacyHeaders: false,
    }));

    // Body parsing
    this.app.use(express.json({ limit: '1mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    logger.info('Middleware stack initialized');
  }

  /**
   * Initialize API routes
   */
  private initializeRoutes(): void {
    // Health check endpoints (no rate limiting)
    this.app.use('/api/health', healthRouter);

    // Prometheus metrics endpoint
    this.app.get('/metrics', async (req, res) => {
      try {
        res.set('Content-Type', register.contentType);
        const metrics = await register.metrics();
        res.end(metrics);
      } catch (error) {
        logger.error('Failed to generate metrics', { error });
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Business logic routes
    this.app.use('/api/analysis', analysisRouter);
    this.app.use('/api/metrics', metricsRouter);

    // API documentation
    this.app.get('/api/docs', (req, res) => {
      res.json({
        service: 'Genesis Luminal API',
        version: '1.0.0',
        documentation: 'https://docs.genesis-luminal.com',
        endpoints: {
          health: '/api/health',
          analysis: '/api/analysis',
          metrics: '/metrics',
        },
      });
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Genesis Luminal API - Enterprise AI Analysis Platform',
        status: 'operational',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    });

    logger.info('API routes initialized');
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    // APM error tracking
    this.app.use(GenesisLuminalAPM.errorTrackingMiddleware());

    // Global error handler
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Unhandled application error', {
        error: error.message,
        stack: error.stack,
        method: req.method,
        url: req.originalUrl,
      });

      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        requestId: req.headers['x-request-id'],
      });
    });

    // 404 handler
    this.app.use((req: express.Request, res: express.Response) => {
      logger.warn('Route not found', {
        method: req.method,
        url: req.originalUrl,
      });

      res.status(404).json({
        error: 'Route not found',
        message: `${req.method} ${req.originalUrl} not found`,
        requestId: req.headers['x-request-id'],
      });
    });

    logger.info('Error handling initialized');
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    logger.info('Initiating graceful shutdown');
    await telemetry.shutdown();
    logger.info('Application shutdown completed');
  }
}

// Create and export app instance
const genesisApp = new GenesisLuminalApp();
export const app = genesisApp.app;

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  await genesisApp.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await genesisApp.shutdown();
  process.exit(0);
});
