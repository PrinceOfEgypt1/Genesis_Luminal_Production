/**
 * @fileoverview Mocks para API frontend
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

import { vi } from 'vitest';

export const mockEmotionAnalysisResponse = {
  intensity: 0.8,
  dominantAffect: 'joy',
  confidence: 0.9,
  timestamp: new Date().toISOString(),
  metadata: {
    model: 'claude-3-sonnet',
    processingTime: 120,
    version: '1.0.0',
  },
};

export const mockApiService = {
  analyzeEmotion: vi.fn().mockResolvedValue(mockEmotionAnalysisResponse),
  healthCheck: vi.fn().mockResolvedValue({ status: 'ok' }),
};

export const createMockFetchResponse = (data: any, ok = true, status = 200) => ({
  ok,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
});

export const mockEmotionResults = {
  joy: {
    intensity: 0.85,
    dominantAffect: 'joy',
    confidence: 0.92,
    timestamp: new Date().toISOString(),
  },
  sadness: {
    intensity: 0.7,
    dominantAffect: 'sadness',
    confidence: 0.8,
    timestamp: new Date().toISOString(),
  },
  anger: {
    intensity: 0.9,
    dominantAffect: 'anger',
    confidence: 0.95,
    timestamp: new Date().toISOString(),
  },
  neutral: {
    intensity: 0.3,
    dominantAffect: 'neutral',
    confidence: 0.6,
    timestamp: new Date().toISOString(),
  },
};

export const mockErrorResponses = {
  networkError: new Error('Network request failed'),
  validationError: {
    ok: false,
    status: 400,
    json: () => Promise.resolve({
      error: 'Validation failed: text is required',
    }),
  },
  serverError: {
    ok: false,
    status: 500,
    json: () => Promise.resolve({
      error: 'Internal server error',
    }),
  },
};
