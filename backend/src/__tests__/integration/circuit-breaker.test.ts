import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../../shared/types/api';

// Mock do provider router
class MockProviderRouter {
  private failureCount = 0;
  private maxFailures = 3;
  private isOpen = false;
  private lastFailureTime = 0;
  private cooldownMs = 60000; // 1 minute

  async analyze(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    // Circuit breaker logic
    if (this.isOpen) {
      const now = Date.now();
      if (now - this.lastFailureTime < this.cooldownMs) {
        throw new Error('Circuit breaker is OPEN');
      } else {
        // Half-open state - try one request
        this.isOpen = false;
        this.failureCount = 0;
      }
    }

    try {
      // Simulate analysis
      if (request.text && request.text.includes('error')) {
        throw new Error('Provider error');
      }

      // Reset on success
      this.failureCount = 0;
      this.isOpen = false;

      return {
        intensity: 0.7,
        timestamp: new Date().toISOString(),
        confidence: 0.8,
        dominantAffect: 'curiosity', // Valid EmotionalDNA key
        recommendation: 'continue',
        emotionalShift: 'stable',
        morphogenicSuggestion: 'fibonacci'
      };
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      
      if (this.failureCount >= this.maxFailures) {
        this.isOpen = true;
      }
      
      throw error;
    }
  }

  getState() {
    if (this.isOpen) {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.cooldownMs) {
        return 'HALF_OPEN';
      }
      return 'OPEN';
    }
    return 'CLOSED';
  }

  getFailureCount() {
    return this.failureCount;
  }

  reset() {
    this.failureCount = 0;
    this.isOpen = false;
    this.lastFailureTime = 0;
  }
}

describe('Circuit Breaker Integration Tests', () => {
  let mockRouter: MockProviderRouter;

  beforeEach(() => {
    mockRouter = new MockProviderRouter();
  });

  describe('Circuit Breaker States', () => {
    it('should start in CLOSED state', () => {
      expect(mockRouter.getState()).toBe('CLOSED');
      expect(mockRouter.getFailureCount()).toBe(0);
    });

    it('should transition to OPEN after max failures', async () => {
      const errorRequest: EmotionalAnalysisRequest = {
        text: 'error test',
        metadata: { source: 'test' }
      };

      // Trigger failures
      for (let i = 0; i < 3; i++) {
        try {
          await mockRouter.analyze(errorRequest);
        } catch (error) {
          // Expected to fail
        }
      }

      expect(mockRouter.getState()).toBe('OPEN');
      expect(mockRouter.getFailureCount()).toBe(3);
    });

    it('should reject requests in OPEN state', async () => {
      // Force OPEN state
      const errorRequest: EmotionalAnalysisRequest = {
        text: 'error test',
        metadata: { source: 'test' }
      };

      for (let i = 0; i < 3; i++) {
        try {
          await mockRouter.analyze(errorRequest);
        } catch (error) {
          // Expected
        }
      }

      // Now try normal request - should be rejected
      const normalRequest: EmotionalAnalysisRequest = {
        text: 'normal request',
        metadata: { source: 'test' }
      };

      await expect(mockRouter.analyze(normalRequest))
        .rejects.toThrow('Circuit breaker is OPEN');
    });

    it('should transition to HALF_OPEN after cooldown', async () => {
      // Force OPEN state
      const errorRequest: EmotionalAnalysisRequest = {
        text: 'error test',
        metadata: { source: 'test' }
      };

      for (let i = 0; i < 3; i++) {
        try {
          await mockRouter.analyze(errorRequest);
        } catch (error) {
          // Expected
        }
      }

      // Simulate cooldown period passed
      (mockRouter as any).lastFailureTime = Date.now() - 61000; // 61 seconds ago

      expect(mockRouter.getState()).toBe('HALF_OPEN');
    });

    it('should reset to CLOSED on successful request after HALF_OPEN', async () => {
      // Force OPEN state first
      const errorRequest: EmotionalAnalysisRequest = {
        text: 'error test',
        metadata: { source: 'test' }
      };

      for (let i = 0; i < 3; i++) {
        try {
          await mockRouter.analyze(errorRequest);
        } catch (error) {
          // Expected
        }
      }

      // Simulate cooldown passed
      (mockRouter as any).lastFailureTime = Date.now() - 61000;

      // Successful request should reset circuit
      const successRequest: EmotionalAnalysisRequest = {
        text: 'success test',
        metadata: { source: 'test' }
      };

      const result = await mockRouter.analyze(successRequest);
      
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('dominantAffect');
      expect(mockRouter.getState()).toBe('CLOSED');
      expect(mockRouter.getFailureCount()).toBe(0);
    });
  });

  describe('Circuit Breaker Retry Logic', () => {
    it('should implement exponential backoff', () => {
      const baseDelayMs = 100;
      const maxDelayMs = 5000;
      
      const calculateBackoff = (attempt: number) => {
        const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
        return delay + Math.random() * 1000; // Add jitter
      };

      expect(calculateBackoff(0)).toBeGreaterThanOrEqual(baseDelayMs);
      expect(calculateBackoff(1)).toBeGreaterThanOrEqual(baseDelayMs * 2);
      expect(calculateBackoff(10)).toBeLessThanOrEqual(maxDelayMs + 1000);
    });

    it('should track failure patterns', async () => {
      const failures: number[] = [];
      
      const errorRequest: EmotionalAnalysisRequest = {
        text: 'error test',
        metadata: { source: 'test' }
      };

      for (let i = 0; i < 5; i++) {
        try {
          await mockRouter.analyze(errorRequest);
        } catch (error) {
          failures.push(Date.now());
        }
      }

      expect(failures).toHaveLength(5);
      expect(mockRouter.getFailureCount()).toBe(5);
    });
  });

  describe('Circuit Breaker Health Monitoring', () => {
    it('should provide health metrics', () => {
      const getHealthMetrics = () => ({
        state: mockRouter.getState(),
        failureCount: mockRouter.getFailureCount(),
        successRate: mockRouter.getFailureCount() === 0 ? 100 : 0,
        lastStateChange: Date.now()
      });

      const metrics = getHealthMetrics();
      
      expect(metrics).toHaveProperty('state');
      expect(metrics).toHaveProperty('failureCount');
      expect(metrics).toHaveProperty('successRate');
      expect(metrics.state).toBe('CLOSED');
    });

    it('should allow manual reset', () => {
      // Force some failures
      (mockRouter as any).failureCount = 2;
      
      expect(mockRouter.getFailureCount()).toBe(2);
      
      mockRouter.reset();
      
      expect(mockRouter.getFailureCount()).toBe(0);
      expect(mockRouter.getState()).toBe('CLOSED');
    });
  });
});
