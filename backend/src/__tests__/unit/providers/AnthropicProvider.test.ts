import { AnthropicProvider } from '../../../providers/AnthropicProvider';

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

    it('should have required methods', () => {
      expect(typeof provider.analyzeEmotional).toBe('function');
      expect(typeof provider.isHealthy).toBe('function');
    });
  });

  describe('analyzeEmotional', () => {
    it('should return valid emotional analysis structure', async () => {
      const mockRequest = {
        text: 'I am feeling happy today',
        currentState: {
          energy: 0.8,
          valence: 0.7,
          arousal: 0.6
        }
      };

      const result = await provider.analyzeEmotional(mockRequest);

      expect(result).toHaveProperty('emotional_state');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle empty text input gracefully', async () => {
      const mockRequest = {
        text: '',
        currentState: {
          energy: 0.5,
          valence: 0.5,
          arousal: 0.5
        }
      };

      const result = await provider.analyzeEmotional(mockRequest);
      
      expect(result).toHaveProperty('emotional_state');
      expect(result.confidence).toBeLessThan(0.5); // Lower confidence for empty input
    });

    it('should validate input parameters', async () => {
      await expect(provider.analyzeEmotional(null as any))
        .rejects.toThrow('Invalid request');

      await expect(provider.analyzeEmotional({} as any))
        .rejects.toThrow('Invalid request');
    });
  });

  describe('isHealthy', () => {
    it('should return health status', async () => {
      const health = await provider.isHealthy();
      
      expect(typeof health).toBe('boolean');
    });

    it('should handle connection errors', async () => {
      // Mock network error
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const health = await provider.isHealthy();
      expect(health).toBe(false);

      global.fetch = originalFetch;
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockRequest = {
        text: 'test',
        currentState: { energy: 0.5, valence: 0.5, arousal: 0.5 }
      };

      // Mock API error
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Rate Limited'
      });

      await expect(provider.analyzeEmotional(mockRequest))
        .rejects.toThrow('API Error');

      global.fetch = originalFetch;
    });
  });
});
