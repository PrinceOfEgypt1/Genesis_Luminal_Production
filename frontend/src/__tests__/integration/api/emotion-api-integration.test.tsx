/**
 * @fileoverview Testes de integração frontend-API
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { EmotionAnalyzer } from '@/components/EmotionAnalyzer';

// Mock real API calls
global.fetch = vi.fn();

describe('Emotion API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful API responses', () => {
    it('should handle complete flow from input to result display', async () => {
      const user = userEvent.setup();
      
      const mockResponse = {
        intensity: 0.85,
        dominantAffect: 'joy',
        confidence: 0.92,
        timestamp: new Date().toISOString(),
        metadata: {
          model: 'claude-3-sonnet',
          processingTime: 150,
        },
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      render(<EmotionAnalyzer />);

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /analyze/i });

      await user.type(input, 'I am absolutely thrilled about this amazing day!');
      await user.click(button);

      // Should show loading state
      expect(screen.getByText(/analyzing/i)).toBeInTheDocument();

      // Should show results
      await waitFor(() => {
        expect(screen.getByText(/joy/i)).toBeInTheDocument();
        expect(screen.getByText(/85%/)).toBeInTheDocument();
        expect(screen.getByText(/92%/)).toBeInTheDocument();
      });

      // Verify API was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/analyze',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('I am absolutely thrilled'),
        })
      );
    });

    it('should handle multiple consecutive analyses', async () => {
      const user = userEvent.setup();
      
      const responses = [
        {
          intensity: 0.8,
          dominantAffect: 'joy',
          confidence: 0.9,
          timestamp: new Date().toISOString(),
        },
        {
          intensity: 0.3,
          dominantAffect: 'sadness',
          confidence: 0.7,
          timestamp: new Date().toISOString(),
        },
      ];

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(responses[0]),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(responses[1]),
        });

      render(<EmotionAnalyzer />);

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /analyze/i });

      // First analysis
      await user.clear(input);
      await user.type(input, 'I am happy!');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/joy/i)).toBeInTheDocument();
      });

      // Second analysis
      await user.clear(input);
      await user.type(input, 'I feel sad today.');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/sadness/i)).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('API error handling', () => {
    it('should handle network errors', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      render(<EmotionAnalyzer />);

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /analyze/i });

      await user.type(input, 'Test text');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
        expect(screen.getByText(/network/i)).toBeInTheDocument();
      });
    });

    it('should handle HTTP 400 errors', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: 'Missing required field: text',
        }),
      });

      render(<EmotionAnalyzer />);

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /analyze/i });

      await user.type(input, 'Test');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
        expect(screen.getByText(/required field/i)).toBeInTheDocument();
      });
    });

    it('should handle HTTP 500 errors', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          error: 'Internal server error',
        }),
      });

      render(<EmotionAnalyzer />);

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /analyze/i });

      await user.type(input, 'Test text');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });
    });

    it('should handle malformed JSON responses', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      render(<EmotionAnalyzer />);

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /analyze/i });

      await user.type(input, 'Test text');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('loading states and UX', () => {
    it('should disable input during analysis', async () => {
      const user = userEvent.setup();
      
      // Mock slow response
      (global.fetch as any).mockImplementation(() =>
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({
              intensity: 0.5,
              dominantAffect: 'neutral',
              confidence: 0.6,
              timestamp: new Date().toISOString(),
            }),
          }), 1000)
        )
      );

      render(<EmotionAnalyzer />);

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /analyze/i });

      await user.type(input, 'Test text');
      await user.click(button);

      // During loading, input and button should be disabled
      expect(input).toBeDisabled();
      expect(button).toBeDisabled();
    });

    it('should show progress indication', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 500))
      );

      render(<EmotionAnalyzer />);

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /analyze/i });

      await user.type(input, 'Test text');
      await user.click(button);

      // Should show loading indicator
      expect(screen.getByRole('status') || screen.getByText(/analyzing/i)).toBeInTheDocument();
    });
  });

  describe('data validation', () => {
    it('should send properly formatted request', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          intensity: 0.7,
          dominantAffect: 'happiness',
          confidence: 0.8,
          timestamp: new Date().toISOString(),
        }),
      });

      render(<EmotionAnalyzer />);

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /analyze/i });

      const testText = 'This is a test message for emotion analysis!';
      await user.type(input, testText);
      await user.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/analyze',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: testText,
              userId: expect.any(String),
            }),
          }
        );
      });
    });
  });
});
