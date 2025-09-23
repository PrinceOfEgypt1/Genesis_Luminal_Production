/**
 * @fileoverview Testes unitários para EmotionalProcessor
 * @description Testa processamento de emoções e IA emocional
 */

import { EmotionalProcessor } from '../../core/usecases/EmotionalProcessor';
import { EmotionalDNA, EmotionalState } from '../../core/entities/EmotionalDNA';

describe('EmotionalProcessor', () => {
  let processor: EmotionalProcessor;

  beforeEach(() => {
    processor = new EmotionalProcessor();
  });

  describe('processEmotionalInput', () => {
    it('should process basic emotional input correctly', () => {
      const input = {
        intensity: 0.8,
        valence: 0.6,
        arousal: 0.7,
        timestamp: Date.now()
      };

      const result = processor.processEmotionalInput(input);

      expect(result).toBeDefined();
      expect(result.intensity).toBeCloseTo(0.8, 1);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle edge case: zero intensity', () => {
      const input = {
        intensity: 0,
        valence: 0.5,
        arousal: 0.5,
        timestamp: Date.now()
      };

      const result = processor.processEmotionalInput(input);

      expect(result.intensity).toBe(0);
      expect(result.dominantAffect).toBe('neutral');
    });

    it('should handle edge case: maximum intensity', () => {
      const input = {
        intensity: 1.0,
        valence: 1.0,
        arousal: 1.0,
        timestamp: Date.now()
      };

      const result = processor.processEmotionalInput(input);

      expect(result.intensity).toBe(1.0);
      expect(result.dominantAffect).toBe('ecstasy');
    });

    it('should validate input parameters', () => {
      const invalidInput = {
        intensity: -0.5, // Invalid
        valence: 0.5,
        arousal: 0.5,
        timestamp: Date.now()
      };

      expect(() => processor.processEmotionalInput(invalidInput))
        .toThrow('Invalid emotional input: intensity must be between 0 and 1');
    });

    it('should calculate emotional vector correctly', () => {
      const input = {
        intensity: 0.8,
        valence: 0.6,
        arousal: 0.7,
        timestamp: Date.now()
      };

      const result = processor.processEmotionalInput(input);
      const vector = processor.calculateEmotionalVector(result);

      expect(vector).toHaveLength(7); // 7 dimensional emotional space
      expect(vector.every(v => v >= 0 && v <= 1)).toBe(true);
    });
  });

  describe('emotional pattern recognition', () => {
    it('should detect emotional patterns over time', () => {
      const patterns = [
        { intensity: 0.2, valence: 0.3, arousal: 0.2, timestamp: Date.now() - 3000 },
        { intensity: 0.5, valence: 0.6, arousal: 0.5, timestamp: Date.now() - 2000 },
        { intensity: 0.8, valence: 0.8, arousal: 0.7, timestamp: Date.now() - 1000 },
        { intensity: 0.9, valence: 0.9, arousal: 0.8, timestamp: Date.now() }
      ];

      patterns.forEach(pattern => processor.processEmotionalInput(pattern));
      const detectedPattern = processor.detectEmotionalPattern();

      expect(detectedPattern.trend).toBe('ascending');
      expect(detectedPattern.confidence).toBeGreaterThan(0.7);
    });
  });
});
