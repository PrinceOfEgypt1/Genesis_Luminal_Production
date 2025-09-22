/**
 * @fileoverview Fixtures para testes de emoção
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

import { EmotionalAnalysisRequest } from '@/types/emotion';

export const validEmotionRequests: EmotionalAnalysisRequest[] = [
  {
    text: 'I am feeling absolutely wonderful today!',
    userId: 'happy-user-1',
    timestamp: new Date('2024-01-15T10:00:00Z'),
  },
  {
    text: 'This is a terrible day and everything is going wrong.',
    userId: 'sad-user-1',
    timestamp: new Date('2024-01-15T11:00:00Z'),
  },
  {
    text: 'The weather is okay, I guess.',
    userId: 'neutral-user-1',
    timestamp: new Date('2024-01-15T12:00:00Z'),
  },
  {
    text: 'I am so excited about this new opportunity! This is amazing!',
    userId: 'excited-user-1',
    timestamp: new Date('2024-01-15T13:00:00Z'),
  },
];

export const invalidEmotionRequests = [
  {
    text: '',
    userId: 'empty-text-user',
    timestamp: new Date(),
  },
  {
    text: 'Valid text',
    userId: '',
    timestamp: new Date(),
  },
  {
    text: 'A'.repeat(50000), // Too long
    userId: 'long-text-user',
    timestamp: new Date(),
  },
];

export const expectedEmotionResults = {
  joy: {
    intensity: 0.8,
    dominantAffect: 'joy',
    confidence: 0.9,
  },
  sadness: {
    intensity: 0.7,
    dominantAffect: 'sadness',
    confidence: 0.8,
  },
  neutral: {
    intensity: 0.3,
    dominantAffect: 'neutral',
    confidence: 0.6,
  },
  excitement: {
    intensity: 0.9,
    dominantAffect: 'excitement',
    confidence: 0.95,
  },
};
