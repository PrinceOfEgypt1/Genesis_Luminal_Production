/**
 * @fileoverview OpenTelemetry configuration for Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

/**
 * Genesis Luminal OpenTelemetry Configuration
 * Comprehensive observability with traces, metrics, and logs
 */
export class GenesisLuminalTelemetry {
  private sdk: NodeSDK;
  private prometheusExporter: PrometheusExporter;

  constructor() {
    // Configure resource identification
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'genesis-luminal-api',
      [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    });

    // Configure Prometheus metrics exporter
    this.prometheusExporter = new PrometheusExporter({
      port: 9090,
      endpoint: '/metrics',
    });

    // Configure Jaeger tracing exporter
    const jaegerExporter = new JaegerExporter({
      endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
    });

    // Initialize SDK with comprehensive instrumentations
    this.sdk = new NodeSDK({
      resource,
      traceExporter: jaegerExporter,
      metricReader: this.prometheusExporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': {
            enabled: false, // Disable noisy fs instrumentation
          },
        }),
        new HttpInstrumentation({
          requestHook: (span, request) => {
            span.setAttributes({
              'http.request.id': request.headers['x-request-id'] || 'unknown',
              'user.id': request.headers['x-user-id'] || 'anonymous',
            });
          },
        }),
        new ExpressInstrumentation({
          routeParameterNames: ['userId', 'analysisId'],
        }),
      ],
    });
  }

  /**
   * Initialize OpenTelemetry instrumentation
   */
  public initialize(): void {
    try {
      this.sdk.start();
      console.log('✅ OpenTelemetry initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize OpenTelemetry:', error);
      throw error;
    }
  }

  /**
   * Graceful shutdown of telemetry
   */
  public async shutdown(): Promise<void> {
    try {
      await this.sdk.shutdown();
      console.log('✅ OpenTelemetry shutdown completed');
    } catch (error) {
      console.error('❌ Error during OpenTelemetry shutdown:', error);
    }
  }

  /**
   * Get Prometheus metrics endpoint handler
   */
  public getMetricsHandler() {
    return this.prometheusExporter.getMetricsRequestHandler();
  }
}

// Global telemetry instance
export const telemetry = new GenesisLuminalTelemetry();
