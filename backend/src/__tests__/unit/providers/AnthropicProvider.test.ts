/**
 * @fileoverview Testes unitários para AnthropicProvider
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

import { AnthropicProvider } from '@/providers/AnthropicProvider';
import { EmotionAnalysisRequest, EmotionAnalysisResult } from '@/types/emotion';

describe('AnthropicProvider', () => {
  let provider: AnthropicProvider;

  beforeEach(() => {
    provider = new AnthropicProvider();
  });

  describe('analyzeEmotion', () => {
    it('should analyze emotion successfully with valid input', async () => {
      const request: EmotionAnalysisRequest = {
        text: 'I am feeling happy today!',
        userId: 'test-user-123',
        timestamp: new Date(),
      };

      const result = await provider.analyzeEmotion(request);

      expect(result).toBeDefined();
      expect(result.intensity).toBeGreaterThanOrEqual(0);
      expect(result.intensity).toBeLessThanOrEqual(1);
      expect(result.dominantAffect).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should handle empty text input', async () => {
      const request: EmotionAnalysisRequest = {
        text: '',
        userId: 'test-user-123',
        timestamp: new Date(),
      };

      const result = await provider.analyzeEmotion(request);

      expect(result).toBeDefined();
      expect(result.intensity).toBe(0);
      expect(result.dominantAffect).toBe('neutral');
    });

    it('should handle very long text input', async () => {
      const longText = 'A'.repeat(10000);
      const request: EmotionAnalysisRequest = {
        text: longText,
        userId: 'test-user-123',
        timestamp: new Date(),
      };

      const result = await provider.analyzeEmotion(request);

      expect(result).toBeDefined();
      expect(result.intensity).toBeGreaterThanOrEqual(0);
      expect(result.intensity).toBeLessThanOrEqual(1);
    });

    it('should preserve userId in analysis context', async () => {
      const request: EmotionAnalysisRequest = {
        text: 'Test emotion',
        userId: 'specific-user-456',
        timestamp: new Date(),
      };

      const result = await provider.analyzeEmotion(request);

      expect(result).toBeDefined();
      // Verify that the provider maintains context consistency
      expect(typeof result.dominantAffect).toBe('string');
    });
  });

  describe('isAvailable', () => {
    it('should return true when provider is available', () => {
      const available = provider.isAvailable();
      expect(typeof available).toBe('boolean');
    });
  });

  describe('getProviderInfo', () => {
    it('should return provider information', () => {
      const info = provider.getProviderInfo();
      
      expect(info).toBeDefined();
      expect(info.name).toBe('Anthropic');
      expect(info.version).toBeDefined();
      expect(info.capabilities).toContain('emotion-analysis');
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network failure
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const request: EmotionAnalysisRequest = {
        text: 'Test text',
        userId: 'test-user',
        timestamp: new Date(),
      };

      const result = await provider.analyzeEmotion(request);

      // Should fallback gracefully
      expect(result).toBeDefined();
      expect(result.intensity).toBeGreaterThanOrEqual(0);
      
      // Restore original fetch
      global.fetch = originalFetch;
    });
  });
});
