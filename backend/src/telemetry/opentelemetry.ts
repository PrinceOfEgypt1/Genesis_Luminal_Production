/**
 * @fileoverview OpenTelemetry básico para Genesis Luminal
 * @version 1.0.0
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';

export class GenesisLuminalTelemetry {
  private sdk: NodeSDK;

  constructor() {
    this.sdk = new NodeSDK({
      instrumentations: [
        new HttpInstrumentation(),
        new ExpressInstrumentation(),
      ],
    });
  }

  public initialize(): void {
    try {
      this.sdk.start();
      console.log('✅ OpenTelemetry initialized');
    } catch (error) {
      console.error('❌ OpenTelemetry failed:', error);
    }
  }

  public async shutdown(): Promise<void> {
    try {
      await this.sdk.shutdown();
      console.log('✅ OpenTelemetry shutdown');
    } catch (error) {
      console.error('❌ Shutdown error:', error);
    }
  }
}

export const telemetry = new GenesisLuminalTelemetry();
