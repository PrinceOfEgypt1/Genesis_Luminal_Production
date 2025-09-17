import { AnthropicProvider } from '../../../providers/AnthropicProvider';
import type { EmotionalAnalysisRequest } from '../../../../../shared/types/api';

describe('AnthropicProvider', () => {
  let provider: AnthropicProvider;
  
  beforeEach(() => {
    provider = new AnthropicProvider();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create provider instance', () => {
      expect(provider).toBeInstanceOf(AnthropicProvider);
    });

    it('should have required methods based on real interface', () => {
      expect(typeof provider.analyze).toBe('function');
      expect(typeof provider.getStatus).toBe('function');
    });
  });

  describe('analyze', () => {
    it('should return valid emotional analysis structure', async () => {
      const mockRequest: EmotionalAnalysisRequest = {
        text: 'I am feeling happy today',
        currentState: {
          energy: 0.8,
          valence: 0.7,
          arousal: 0.6
        }
      };

      const result = await provider.analyze(mockRequest);

      expect(result).toHaveProperty('intensity');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle empty text input gracefully', async () => {
      const mockRequest: EmotionalAnalysisRequest = {
        text: '',
        currentState: {
          energy: 0.5,
          valence: 0.5,
          arousal: 0.5
        }
      };

      const result = await provider.analyze(mockRequest);
      
      expect(result).toHaveProperty('intensity');
      expect(typeof result.confidence).toBe('number');
    });

    it('should validate input parameters', async () => {
      await expect(provider.analyze(null as any))
        .rejects.toThrow();

      await expect(provider.analyze({} as any))
        .rejects.toThrow();
    });
  });

  describe('getStatus', () => {
    it('should return status object', () => {
      const status = provider.getStatus();
      
      expect(status).toHaveProperty('ok');
      expect(status).toHaveProperty('provider');
      expect(typeof status.ok).toBe('boolean');
      expect(status.provider).toBe('anthropic');
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockRequest: EmotionalAnalysisRequest = {
        text: 'test',
        currentState: { energy: 0.5, valence: 0.5, arousal: 0.5 }
      };

      // Mock fetch to simulate API error
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Rate Limited'
      });

      await expect(provider.analyze(mockRequest))
        .rejects.toThrow();

      global.fetch = originalFetch;
    });
  });
});
