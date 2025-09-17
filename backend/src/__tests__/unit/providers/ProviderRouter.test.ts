import { ProviderRouter } from '../../../providers/ProviderRouter';
import type { EmotionalAnalysisRequest } from '../../../../../shared/types/api';

// Mock dos providers
jest.mock('../../../providers/AnthropicProvider');
jest.mock('../../../providers/FallbackProvider');

describe('ProviderRouter', () => {
  let router: ProviderRouter;

  beforeEach(() => {
    router = new ProviderRouter();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('analyze', () => {
    it('should analyze emotional request', async () => {
      const request: EmotionalAnalysisRequest = {
        text: 'I am feeling great today!',
        currentState: { energy: 0.8, valence: 0.7, arousal: 0.6 }
      };

      const result = await router.analyze(request);

      expect(result).toHaveProperty('intensity');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.confidence).toBe('number');
    });

    it('should handle empty text input', async () => {
      const request: EmotionalAnalysisRequest = {
        text: '',
        currentState: { energy: 0.5, valence: 0.5, arousal: 0.5 }
      };

      const result = await router.analyze(request);
      
      expect(result).toHaveProperty('intensity');
      expect(typeof result.confidence).toBe('number');
    });

    it('should validate request structure', async () => {
      await expect(router.analyze(null as any))
        .rejects.toThrow();

      await expect(router.analyze({} as any))
        .rejects.toThrow();
    });
  });

  describe('getStatus', () => {
    it('should return router status', () => {
      const status = router.getStatus();
      
      expect(status).toHaveProperty('state');
      expect(status).toHaveProperty('failures');
      expect(status).toHaveProperty('primary');
      expect(status).toHaveProperty('fallback');
    });

    it('should track circuit breaker state', () => {
      const status = router.getStatus();
      
      expect(['CLOSED', 'OPEN', 'HALF_OPEN']).toContain(status.state);
      expect(typeof status.failures).toBe('number');
    });
  });

  describe('circuit breaker functionality', () => {
    it('should handle provider failures', async () => {
      const request: EmotionalAnalysisRequest = {
        text: 'test failure scenario',
        currentState: { energy: 0.5, valence: 0.5, arousal: 0.5 }
      };

      // Should not throw and should return fallback response
      const result = await router.analyze(request);
      
      expect(result).toHaveProperty('intensity');
      expect(result).toHaveProperty('confidence');
    });
  });
});
