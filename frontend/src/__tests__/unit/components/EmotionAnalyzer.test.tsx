/**
 * @fileoverview Testes unitários para EmotionAnalyzer
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { EmotionAnalyzer } from '@/components/EmotionAnalyzer';

// Mock da API
const mockAnalyzeEmotion = vi.fn();
vi.mock('@/services/api', () => ({
  analyzeEmotion: mockAnalyzeEmotion,
}));

describe('EmotionAnalyzer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render input field and analyze button', () => {
      render(<EmotionAnalyzer />);
      
      expect(screen.getByPlaceholderText(/enter your text/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /analyze emotion/i })).toBeInTheDocument();
    });

    it('should render with proper accessibility attributes', () => {
      render(<EmotionAnalyzer />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label');
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby');
    });

    it('should have proper focus management', () => {
      render(<EmotionAnalyzer />);
      
      const input = screen.getByRole('textbox');
      input.focus();
      
      expect(input).toHaveFocus();
    });
  });

  describe('user interactions', () => {
    it('should update input value when user types', async () => {
      const user = userEvent.setup();
      render(<EmotionAnalyzer />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'I am feeling happy today!');
      
      expect(input).toHaveValue('I am feeling happy today!');
    });

    it('should disable button when input is empty', () => {
      render(<EmotionAnalyzer />);
      
      const button = screen.getByRole('button', { name: /analyze emotion/i });
      expect(button).toBeDisabled();
    });

    it('should enable button when input has text', async () => {
      const user = userEvent.setup();
      render(<EmotionAnalyzer />);
      
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /analyze emotion/i });
      
      await user.type(input, 'Test text');
      
      expect(button).toBeEnabled();
    });

    it('should call API when analyze button is clicked', async () => {
      const user = userEvent.setup();
      const mockResult = {
        intensity: 0.8,
        dominantAffect: 'joy',
        confidence: 0.9,
        timestamp: new Date().toISOString(),
      };
      
      mockAnalyzeEmotion.mockResolvedValue(mockResult);
      
      render(<EmotionAnalyzer />);
      
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /analyze emotion/i });
      
      await user.type(input, 'I am happy!');
      await user.click(button);
      
      expect(mockAnalyzeEmotion).toHaveBeenCalledWith({
        text: 'I am happy!',
        userId: expect.any(String),
      });
    });
  });

  describe('emotion analysis results', () => {
    it('should display results after successful analysis', async () => {
      const user = userEvent.setup();
      const mockResult = {
        intensity: 0.8,
        dominantAffect: 'joy',
        confidence: 0.9,
        timestamp: new Date().toISOString(),
      };
      
      mockAnalyzeEmotion.mockResolvedValue(mockResult);
      
      render(<EmotionAnalyzer />);
      
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /analyze emotion/i });
      
      await user.type(input, 'I am feeling great!');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/joy/i)).toBeInTheDocument();
        expect(screen.getByText(/80%/)).toBeInTheDocument(); // intensity
        expect(screen.getByText(/90%/)).toBeInTheDocument(); // confidence
      });
    });

    it('should show loading state during analysis', async () => {
      const user = userEvent.setup();
      
      // Mock a slow API response
      mockAnalyzeEmotion.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      );
      
      render(<EmotionAnalyzer />);
      
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /analyze emotion/i });
      
      await user.type(input, 'Test text');
      await user.click(button);
      
      expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup();
      
      mockAnalyzeEmotion.mockRejectedValue(new Error('API Error'));
      
      render(<EmotionAnalyzer />);
      
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /analyze emotion/i });
      
      await user.type(input, 'Test text');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('visual feedback', () => {
    it('should display emotion intensity with visual indicators', async () => {
      const user = userEvent.setup();
      const mockResult = {
        intensity: 0.7,
        dominantAffect: 'happiness',
        confidence: 0.8,
        timestamp: new Date().toISOString(),
      };
      
      mockAnalyzeEmotion.mockResolvedValue(mockResult);
      
      render(<EmotionAnalyzer />);
      
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /analyze emotion/i });
      
      await user.type(input, 'I feel good');
      await user.click(button);
      
      await waitFor(() => {
        // Should have visual intensity indicator (progress bar, etc.)
        const intensityElement = screen.getByRole('progressbar') || screen.getByTestId('intensity-indicator');
        expect(intensityElement).toBeInTheDocument();
      });
    });

    it('should use appropriate colors for different emotions', async () => {
      const user = userEvent.setup();
      const mockResult = {
        intensity: 0.9,
        dominantAffect: 'joy',
        confidence: 0.95,
        timestamp: new Date().toISOString(),
      };
      
      mockAnalyzeEmotion.mockResolvedValue(mockResult);
      
      render(<EmotionAnalyzer />);
      
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /analyze emotion/i });
      
      await user.type(input, 'Amazing day!');
      await user.click(button);
      
      await waitFor(() => {
        const resultContainer = screen.getByTestId('emotion-result');
        expect(resultContainer).toHaveClass(expect.stringMatching(/(joy|happy|positive)/));
      });
    });
  });

  describe('keyboard navigation', () => {
    it('should support Enter key to trigger analysis', async () => {
      const user = userEvent.setup();
      const mockResult = {
        intensity: 0.6,
        dominantAffect: 'neutral',
        confidence: 0.7,
        timestamp: new Date().toISOString(),
      };
      
      mockAnalyzeEmotion.mockResolvedValue(mockResult);
      
      render(<EmotionAnalyzer />);
      
      const input = screen.getByRole('textbox');
      
      await user.type(input, 'Test text{enter}');
      
      expect(mockAnalyzeEmotion).toHaveBeenCalled();
    });

    it('should maintain focus management after analysis', async () => {
      const user = userEvent.setup();
      const mockResult = {
        intensity: 0.5,
        dominantAffect: 'neutral',
        confidence: 0.6,
        timestamp: new Date().toISOString(),
      };
      
      mockAnalyzeEmotion.mockResolvedValue(mockResult);
      
      render(<EmotionAnalyzer />);
      
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /analyze emotion/i });
      
      await user.type(input, 'Test');
      await user.click(button);
      
      await waitFor(() => {
        expect(input).toHaveFocus();
      });
    });
  });
});
