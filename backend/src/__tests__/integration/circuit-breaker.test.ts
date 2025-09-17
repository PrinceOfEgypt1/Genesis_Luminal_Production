/**
 * Testes de Integração - Circuit Breaker
 * Testa comportamento do ProviderRouter e sistema de fallback
 */

import { ProviderRouter } from '../../providers/ProviderRouter';
import { AnthropicProvider } from '../../providers/AnthropicProvider';
import { FallbackProvider } from '../../providers/FallbackProvider';
import type { AIProvider } from '../../providers/AIProvider';
import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../../shared/types/api';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  process.env = {
    ...originalEnv,
    CB_FAILURE_THRESHOLD: '3',
    CB_COOLDOWN_SECONDS: '5',
    RETRY_BASE_MS: '100',
    RETRY_MAX_MS: '1000',
    CLAUDE_OFFLINE_MODE: 'false',
    SUPPRESS_CLAUDE_QUOTA_LOGS: 'true'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

// Mock providers for testing
class MockSuccessProvider implements AIProvider {
  name = 'mock-success';
  
  async analyze(input: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    return {
      intensity: 0.8,
      dominantAffect: 'joy',
      timestamp: new Date().toISOString(),
      confidence: 0.9,
      recommendation: 'continue',
      emotionalShift: 'positive',
      morphogenicSuggestion: 'spiral'
    };
  }

  getStatus() {
    return { ok: true, provider: 'mock-success' };
  }
}

class MockFailureProvider implements AIProvider {
  name = 'mock-failure';
  private callCount = 0;
  
  async analyze(input: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    this.callCount++;
    
    if (this.callCount <= 2) {
      // First 2 calls succeed
      return {
        intensity: 0.5,
        dominantAffect: 'neutral',
        timestamp: new Date().toISOString(),
        confidence: 0.5,
        recommendation: 'continue',
        emotionalShift: 'stable',
        morphogenicSuggestion: 'linear'
      };
    } else {
      // Subsequent calls fail
      const error: any = new Error('Service unavailable');
      error.code = 'SERVICE_UNAVAILABLE';
      throw error;
    }
  }

  getStatus() {
    return { ok: false, provider: 'mock-failure' };
  }

  reset() {
    this.callCount = 0;
  }
}

class MockQuotaProvider implements AIProvider {
  name = 'mock-quota';
  
  async analyze(input: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    const error: any = new Error('Usage limit exceeded');
    error.code = 'usage_limit_exceeded';
    error.details = {
      error: {
        message: 'Usage limits exceeded for this model'
      }
    };
    throw error;
  }

  getStatus() {
    return { ok: false, provider: 'mock-quota' };
  }
}

describe('Circuit Breaker Integration Tests', () => {
  let router: ProviderRouter;
  let mockRequest: EmotionalAnalysisRequest;

  beforeEach(() => {
    mockRequest = {
      emotionalState: {
        joy: 0.7,
        curiosity: 0.8,
        serenity: 0.5,
        nostalgia: 0.3,
        ecstasy: 0.2,
        mystery: 0.6,
        power: 0.4
      },
      mousePosition: { x: 100, y: 200 },
      sessionDuration: 60000
    };
  });

  describe('Circuit Breaker States', () => {
    it('should start in CLOSED state', () => {
      const mockPrimary = new MockSuccessProvider();
      const mockFallback = new FallbackProvider();
      router = new ProviderRouter(mockPrimary, mockFallback);

      const status = router.getStatus();
      expect(status.state).toBe('CLOSED');
      expect(status.failures).toBe(0);
    });

    it('should transition to OPEN on quota exceeded', async () => {
      const mockPrimary = new MockQuotaProvider();
      const mockFallback = new FallbackProvider();
      router = new ProviderRouter(mockPrimary, mockFallback);

      // First request should trigger quota error and open circuit
      const result = await router.analyze(mockRequest);
      
      // Should get fallback response
      expect(result).toBeDefined();
      expect(result.confidence).toBeLessThanOrEqual(1);

      const status = router.getStatus();
      expect(status.state).toBe('OPEN');
      expect(status.lastErrorCode).toBe('usage_limit_exceeded');
    });

    it('should transition to HALF_OPEN after cooldown period', async () => {
      // Set short cooldown for testing
      process.env.CB_COOLDOWN_SECONDS = '0.1'; // 100ms
      
      const mockPrimary = new MockQuotaProvider();
      const mockFallback = new FallbackProvider();
      router = new ProviderRouter(mockPrimary, mockFallback);

      // Trigger circuit open
      await router.analyze(mockRequest);
      expect(router.getStatus().state).toBe('OPEN');

      // Wait for cooldown
      await new Promise(resolve => setTimeout(resolve, 150));

      // Next request should transition to HALF_OPEN (but still fail)
      await router.analyze(mockRequest);
      
      // Should remain OPEN after failed half-open attempt
      const status = router.getStatus();
      expect(status.state).toBe('OPEN');
    });

    it('should close circuit on successful recovery', async () => {
      const mockFailure = new MockFailureProvider();
      const mockFallback = new FallbackProvider();
      router = new ProviderRouter(mockFailure, mockFallback);

      // Make successful requests first
      await router.analyze(mockRequest);
      await router.analyze(mockRequest);
      expect(router.getStatus().state).toBe('CLOSED');

      // Now trigger failures to reach threshold
      try { await router.analyze(mockRequest); } catch {}
      try { await router.analyze(mockRequest); } catch {}
      try { await router.analyze(mockRequest); } catch {}

      expect(router.getStatus().state).toBe('OPEN');

      // Reset provider and simulate recovery
      mockFailure.reset();
      process.env.CB_COOLDOWN_SECONDS = '0.1';
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // This should succeed and close the circuit
      const result = await router.analyze(mockRequest);
      expect(result).toBeDefined();
      expect(router.getStatus().state).toBe('CLOSED');
    });
  });

  describe('Fallback Behavior', () => {
    it('should use fallback when circuit is OPEN', async () => {
      const mockPrimary = new MockQuotaProvider();
      const mockFallback = new FallbackProvider();
      router = new ProviderRouter(mockPrimary, mockFallback);

      // Trigger circuit open
      const result = await router.analyze(mockRequest);
      
      // Should get fallback response characteristics
      expect(result).toBeDefined();
      expect(result.intensity).toBeGreaterThanOrEqual(0);
      expect(result.intensity).toBeLessThanOrEqual(1);
      expect(result.dominantAffect).toBeDefined();
      
      expect(router.getStatus().state).toBe('OPEN');
    });

    it('should handle offline mode', async () => {
      process.env.CLAUDE_OFFLINE_MODE = 'true';
      
      const mockPrimary = new MockSuccessProvider();
      const mockFallback = new FallbackProvider();
      router = new ProviderRouter(mockPrimary, mockFallback);

      const result = await router.analyze(mockRequest);
      
      // Should always use fallback in offline mode
      expect(result).toBeDefined();
      expect(router.getStatus().offlineMode).toBe(true);
    });

    it('should provide consistent fallback responses', async () => {
      const mockPrimary = new MockQuotaProvider();
      const mockFallback = new FallbackProvider();
      router = new ProviderRouter(mockPrimary, mockFallback);

      // Trigger multiple fallback responses
      const results = await Promise.all([
        router.analyze(mockRequest),
        router.analyze(mockRequest),
        router.analyze(mockRequest)
      ]);

      // All results should have valid structure
      results.forEach(result => {
        expect(result).toHaveProperty('intensity');
        expect(result).toHaveProperty('dominantAffect');
        expect(result).toHaveProperty('confidence');
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('recommendation');
        expect(result).toHaveProperty('emotionalShift');
        expect(result).toHaveProperty('morphogenicSuggestion');
        
        expect(typeof result.intensity).toBe('number');
        expect(result.intensity).toBeGreaterThanOrEqual(0);
        expect(result.intensity).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Retry Logic', () => {
    it('should retry on transient failures', async () => {
      let attemptCount = 0;
      
      class MockRetryProvider implements AIProvider {
        name = 'mock-retry';
        
        async analyze(input: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
          attemptCount++;
          
          if (attemptCount === 1) {
            // First attempt fails with transient error
            const error: any = new Error('Temporary service error');
            error.code = 'TEMPORARY_ERROR';
            throw error;
          } else {
            // Second attempt succeeds
            return {
              intensity: 0.6,
              dominantAffect: 'curiosity',
              timestamp: new Date().toISOString(),
              confidence: 0.8,
              recommendation: 'continue',
              emotionalShift: 'stable',
              morphogenicSuggestion: 'fractal'
            };
          }
        }

        getStatus() {
          return { ok: true, provider: 'mock-retry' };
        }
      }

      const mockPrimary = new MockRetryProvider();
      const mockFallback = new FallbackProvider();
      router = new ProviderRouter(mockPrimary, mockFallback);

      const result = await router.analyze(mockRequest);
      
      // Should succeed after retry
      expect(result).toBeDefined();
      expect(result.dominantAffect).toBe('curiosity');
      expect(attemptCount).toBe(2); // Confirms retry happened
    });

    it('should respect max retry attempts', async () => {
      let attemptCount = 0;
      
      class MockMaxRetryProvider implements AIProvider {
        name = 'mock-max-retry';
        
        async analyze(input: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
          attemptCount++;
          const error: any = new Error('Persistent failure');
          error.code = 'PERSISTENT_ERROR';
          throw error;
        }

        getStatus() {
          return { ok: false, provider: 'mock-max-retry' };
        }
      }

      const mockPrimary = new MockMaxRetryProvider();
      const mockFallback = new FallbackProvider();
      router = new ProviderRouter(mockPrimary, mockFallback);

      const result = await router.analyze(mockRequest);
      
      // Should fallback after max retries
      expect(result).toBeDefined(); // Fallback response
      expect(attemptCount).toBe(2); // Max retry attempts
    });
  });

  describe('Performance and Monitoring', () => {
    it('should provide detailed status information', () => {
      const mockPrimary = new AnthropicProvider();
      const mockFallback = new FallbackProvider();
      router = new ProviderRouter(mockPrimary, mockFallback);

      const status = router.getStatus();
      
      expect(status).toHaveProperty('state');
      expect(status).toHaveProperty('failures');
      expect(status).toHaveProperty('nextRetryAt');
      expect(status).toHaveProperty('lastErrorCode');
      expect(status).toHaveProperty('offlineMode');
      expect(status).toHaveProperty('primary');
      expect(status).toHaveProperty('fallback');
      
      expect(['CLOSED', 'OPEN', 'HALF_OPEN']).toContain(status.state);
      expect(typeof status.failures).toBe('number');
      expect(typeof status.offlineMode).toBe('boolean');
    });

    it('should handle high concurrency', async () => {
      const mockPrimary = new MockSuccessProvider();
      const mockFallback = new FallbackProvider();
      router = new ProviderRouter(mockPrimary, mockFallback);

      // Create 20 concurrent requests
      const requests = Array(20).fill(null).map((_, index) => ({
        ...mockRequest,
        sessionDuration: mockRequest.sessionDuration + index
      }));

      const startTime = Date.now();
      const results = await Promise.all(
        requests.map(req => router.analyze(req))
      );
      const endTime = Date.now();

      // All requests should complete
      expect(results).toHaveLength(20);
      results.forEach(result => {
        expect(result).toHaveProperty('intensity');
        expect(result).toHaveProperty('dominantAffect');
      });

      // Should complete in reasonable time (under 5 seconds for 20 requests)
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });
});
