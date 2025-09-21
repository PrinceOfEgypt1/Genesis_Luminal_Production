/**
 * @fileoverview Testes unitários para useEmotionAnalysis hook
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useEmotionAnalysis } from '@/hooks/useEmotionAnalysis';

// Mock da API
const mockAnalyzeEmotion = vi.fn();
vi.mock('@/services/api', () => ({
  analyzeEmotion: mockAnalyzeEmotion,
}));

describe('useEmotionAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useEmotionAnalysis());
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.result).toBe(null);
      expect(typeof result.current.analyze).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('analyze function', () => {
    it('should handle successful analysis', async () => {
      const mockResult = {
        intensity: 0.8,
        dominantAffect: 'joy',
        confidence: 0.9,
        timestamp: new Date().toISOString(),
      };
      
      mockAnalyzeEmotion.mockResolvedValue(mockResult);
      
      const { result } = renderHook(() => useEmotionAnalysis());
      
      act(() => {
        result.current.analyze('I am happy!', 'user-123');
      });
      
      // Should be loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe(null);
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.result).toEqual(mockResult);
        expect(result.current.error).toBe(null);
      });
      
      expect(mockAnalyzeEmotion).toHaveBeenCalledWith({
        text: 'I am happy!',
        userId: 'user-123',
      });
    });

    it('should handle API errors', async () => {
      const errorMessage = 'API Error';
      mockAnalyzeEmotion.mockRejectedValue(new Error(errorMessage));
      
      const { result } = renderHook(() => useEmotionAnalysis());
      
      act(() => {
        result.current.analyze('Test text', 'user-123');
      });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.result).toBe(null);
      });
    });

    it('should handle network errors', async () => {
      mockAnalyzeEmotion.mockRejectedValue(new Error('Network Error'));
      
      const { result } = renderHook(() => useEmotionAnalysis());
      
      act(() => {
        result.current.analyze('Test', 'user-123');
      });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe('Network Error');
      });
    });

    it('should validate input parameters', async () => {
      const { result } = renderHook(() => useEmotionAnalysis());
      
      act(() => {
        result.current.analyze('', 'user-123');
      });
      
      await waitFor(() => {
        expect(result.current.error).toContain('text');
        expect(mockAnalyzeEmotion).not.toHaveBeenCalled();
      });
    });

    it('should prevent concurrent requests', async () => {
      mockAnalyzeEmotion.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      );
      
      const { result } = renderHook(() => useEmotionAnalysis());
      
      // Start first request
      act(() => {
        result.current.analyze('First request', 'user-123');
      });
      
      expect(result.current.isLoading).toBe(true);
      
      // Try to start second request while first is pending
      act(() => {
        result.current.analyze('Second request', 'user-123');
      });
      
      // Should still be the first request
      expect(mockAnalyzeEmotion).toHaveBeenCalledTimes(1);
      expect(mockAnalyzeEmotion).toHaveBeenCalledWith({
        text: 'First request',
        userId: 'user-123',
      });
    });
  });

  describe('reset function', () => {
    it('should reset state to initial values', async () => {
      const mockResult = {
        intensity: 0.7,
        dominantAffect: 'happiness',
        confidence: 0.8,
        timestamp: new Date().toISOString(),
      };
      
      mockAnalyzeEmotion.mockResolvedValue(mockResult);
      
      const { result } = renderHook(() => useEmotionAnalysis());
      
      // Perform analysis
      act(() => {
        result.current.analyze('Happy text', 'user-123');
      });
      
      await waitFor(() => {
        expect(result.current.result).toEqual(mockResult);
      });
      
      // Reset
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.result).toBe(null);
    });

    it('should reset error state', async () => {
      mockAnalyzeEmotion.mockRejectedValue(new Error('Test error'));
      
      const { result } = renderHook(() => useEmotionAnalysis());
      
      // Trigger error
      act(() => {
        result.current.analyze('Test', 'user-123');
      });
      
      await waitFor(() => {
        expect(result.current.error).toBe('Test error');
      });
      
      // Reset
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.error).toBe(null);
    });
  });

  describe('edge cases', () => {
    it('should handle very long text', async () => {
      const longText = 'A'.repeat(10000);
      const mockResult = {
        intensity: 0.5,
        dominantAffect: 'neutral',
        confidence: 0.6,
        timestamp: new Date().toISOString(),
      };
      
      mockAnalyzeEmotion.mockResolvedValue(mockResult);
      
      const { result } = renderHook(() => useEmotionAnalysis());
      
      act(() => {
        result.current.analyze(longText, 'user-123');
      });
      
      await waitFor(() => {
        expect(result.current.result).toEqual(mockResult);
      });
      
      expect(mockAnalyzeEmotion).toHaveBeenCalledWith({
        text: longText,
        userId: 'user-123',
      });
    });

    it('should handle special characters in text', async () => {
      const specialText = '🚀 Amazing! @#$%^&*() 你好 👋';
      const mockResult = {
        intensity: 0.8,
        dominantAffect: 'excitement',
        confidence: 0.9,
        timestamp: new Date().toISOString(),
      };
      
      mockAnalyzeEmotion.mockResolvedValue(mockResult);
      
      const { result } = renderHook(() => useEmotionAnalysis());
      
      act(() => {
        result.current.analyze(specialText, 'user-123');
      });
      
      await waitFor(() => {
        expect(result.current.result).toEqual(mockResult);
      });
    });
  });
});
