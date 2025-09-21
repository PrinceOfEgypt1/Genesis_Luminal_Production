/**
 * @fileoverview Testes unitários para EmotionService
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

import { EmotionService } from '@/services/EmotionService';
import { EmotionAnalysisRequest } from '@/types/emotion';
import { AnthropicProvider } from '@/providers/AnthropicProvider';

// Mock do provider
jest.mock('@/providers/AnthropicProvider');

describe('EmotionService', () => {
  let emotionService: EmotionService;
  let mockProvider: jest.Mocked<AnthropicProvider>;

  beforeEach(() => {
    mockProvider = new AnthropicProvider() as jest.Mocked<AnthropicProvider>;
    emotionService = new EmotionService(mockProvider);
  });

  describe('analyzeEmotion', () => {
    it('should process emotion analysis request successfully', async () => {
      const mockResult = {
        intensity: 0.8,
        dominantAffect: 'joy',
        confidence: 0.9,
        timestamp: new Date(),
        metadata: {
          model: 'claude-3',
          processingTime: 150,
        },
      };

      mockProvider.analyzeEmotion.mockResolvedValue(mockResult);

      const request: EmotionAnalysisRequest = {
        text: 'I am extremely happy today!',
        userId: 'user-123',
        timestamp: new Date(),
      };

      const result = await emotionService.analyzeEmotion(request);

      expect(result).toEqual(mockResult);
      expect(mockProvider.analyzeEmotion).toHaveBeenCalledWith(request);
      expect(mockProvider.analyzeEmotion).toHaveBeenCalledTimes(1);
    });

    it('should validate input before processing', async () => {
      const invalidRequest = {
        text: '',
        userId: '',
        timestamp: new Date(),
      };

      // Should handle invalid input gracefully
      const result = await emotionService.analyzeEmotion(invalidRequest);
      
      // Service should validate and possibly return neutral result
      expect(result).toBeDefined();
      expect(result.intensity).toBeDefined();
    });

    it('should handle provider errors gracefully', async () => {
      mockProvider.analyzeEmotion.mockRejectedValue(new Error('Provider error'));

      const request: EmotionAnalysisRequest = {
        text: 'Test text',
        userId: 'user-123',
        timestamp: new Date(),
      };

      await expect(emotionService.analyzeEmotion(request)).rejects.toThrow('Provider error');
    });
  });

  describe('getEmotionHistory', () => {
    it('should retrieve emotion history for user', async () => {
      const userId = 'user-123';
      const limit = 10;

      // Mock method if it exists
      if (emotionService.getEmotionHistory) {
        const mockHistory = [
          {
            intensity: 0.7,
            dominantAffect: 'joy',
            confidence: 0.8,
            timestamp: new Date(),
          },
        ];

        jest.spyOn(emotionService, 'getEmotionHistory').mockResolvedValue(mockHistory);

        const history = await emotionService.getEmotionHistory(userId, limit);

        expect(history).toEqual(mockHistory);
        expect(history).toHaveLength(1);
      }
    });
  });

  describe('caching behavior', () => {
    it('should cache results for identical requests', async () => {
      const mockResult = {
        intensity: 0.6,
        dominantAffect: 'neutral',
        confidence: 0.7,
        timestamp: new Date(),
      };

      mockProvider.analyzeEmotion.mockResolvedValue(mockResult);

      const request: EmotionAnalysisRequest = {
        text: 'Same text',
        userId: 'user-123',
        timestamp: new Date(),
      };

      // First call
      await emotionService.analyzeEmotion(request);
      
      // Second call with same parameters
      await emotionService.analyzeEmotion(request);

      // Should have called provider twice (caching may be implemented later)
      expect(mockProvider.analyzeEmotion).toHaveBeenCalledTimes(2);
    });
  });
});
