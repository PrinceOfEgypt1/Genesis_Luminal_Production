import { ProviderRouter } from '../../../providers/ProviderRouter';
import { AnthropicProvider } from '../../../providers/AnthropicProvider';
import { FallbackProvider } from '../../../providers/FallbackProvider';

// Mock dos providers
jest.mock('../../../providers/AnthropicProvider');
jest.mock('../../../providers/FallbackProvider');

describe('ProviderRouter', () => {
  let router: ProviderRouter;
  let mockAnthropicProvider: jest.Mocked<AnthropicProvider>;
  let mockFallbackProvider: jest.Mocked<FallbackProvider>;

  beforeEach(() => {
    mockAnthropicProvider = new AnthropicProvider() as jest.Mocked<AnthropicProvider>;
    mockFallbackProvider = new FallbackProvider() as jest.Mocked<FallbackProvider>;
    
    router = new ProviderRouter();
    
    // Setup mocks
    mockAnthropicProvider.isHealthy = jest.fn();
    mockAnthropicProvider.analyzeEmotional = jest.fn();
    mockFallbackProvider.analyzeEmotional = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('route', () => {
    it('should use primary provider when healthy', async () => {
      mockAnthropicProvider.isHealthy.mockResolvedValue(true);
      mockAnthropicProvider.analyzeEmotional.mockResolvedValue({
        emotional_state: { energy: 0.8, valence: 0.7, arousal: 0.6 },
        confidence: 0.9,
        timestamp: new Date().toISOString()
      });

      const request = {
        text: 'test',
        currentState: { energy: 0.5, valence: 0.5, arousal: 0.5 }
      };

      const result = await router.route(request);

      expect(mockAnthropicProvider.isHealthy).toHaveBeenCalled();
      expect(mockAnthropicProvider.analyzeEmotional).toHaveBeenCalledWith(request);
      expect(mockFallbackProvider.analyzeEmotional).not.toHaveBeenCalled();
      expect(result.confidence).toBe(0.9);
    });

    it('should fallback when primary provider is unhealthy', async () => {
      mockAnthropicProvider.isHealthy.mockResolvedValue(false);
      mockFallbackProvider.analyzeEmotional.mockResolvedValue({
        emotional_state: { energy: 0.6, valence: 0.5, arousal: 0.4 },
        confidence: 0.7,
        timestamp: new Date().toISOString()
      });

      const request = {
        text: 'test',
        currentState: { energy: 0.5, valence: 0.5, arousal: 0.5 }
      };

      const result = await router.route(request);

      expect(mockAnthropicProvider.isHealthy).toHaveBeenCalled();
      expect(mockAnthropicProvider.analyzeEmotional).not.toHaveBeenCalled();
      expect(mockFallbackProvider.analyzeEmotional).toHaveBeenCalledWith(request);
      expect(result.confidence).toBe(0.7);
    });

    it('should handle errors in health check', async () => {
      mockAnthropicProvider.isHealthy.mockRejectedValue(new Error('Health check failed'));
      mockFallbackProvider.analyzeEmotional.mockResolvedValue({
        emotional_state: { energy: 0.5, valence: 0.5, arousal: 0.5 },
        confidence: 0.5,
        timestamp: new Date().toISOString()
      });

      const request = {
        text: 'test',
        currentState: { energy: 0.5, valence: 0.5, arousal: 0.5 }
      };

      const result = await router.route(request);

      expect(mockFallbackProvider.analyzeEmotional).toHaveBeenCalled();
      expect(result.confidence).toBe(0.5);
    });
  });

  describe('health status', () => {
    it('should aggregate health from all providers', async () => {
      mockAnthropicProvider.isHealthy.mockResolvedValue(true);

      const health = await router.getOverallHealth();

      expect(health).toHaveProperty('primary');
      expect(health).toHaveProperty('fallback');
      expect(health).toHaveProperty('overall');
    });
  });
});
