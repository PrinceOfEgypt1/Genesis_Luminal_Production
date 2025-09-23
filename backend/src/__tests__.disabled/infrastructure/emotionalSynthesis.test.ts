/**
 * @fileoverview Testes unitários para EmotionalSynthesis
 * @description Testa síntese de áudio emocional em tempo real
 */

import { EmotionalSynthesis } from '../../infrastructure/audio/EmotionalSynthesis';
import { EmotionalDNA } from '../../core/entities/EmotionalDNA';

// Mock do Tone.js para testes
jest.mock('tone', () => ({
  Synth: jest.fn().mockImplementation(() => ({
    triggerAttackRelease: jest.fn(),
    dispose: jest.fn()
  })),
  now: jest.fn(() => 0),
  start: jest.fn()
}));

describe('EmotionalSynthesis', () => {
  let synthesis: EmotionalSynthesis;

  beforeEach(() => {
    synthesis = new EmotionalSynthesis();
  });

  afterEach(() => {
    synthesis.dispose();
  });

  describe('audio generation', () => {
    it('should generate audio context for emotional state', () => {
      const emotionalDNA = {
        joy: 0.8,
        sadness: 0.1,
        anger: 0.1,
        fear: 0.1,
        surprise: 0.3,
        disgust: 0.1,
        trust: 0.7
      };

      const audioContext = synthesis.generateAudioContext(emotionalDNA);

      expect(audioContext).toBeDefined();
      expect(audioContext.frequency).toBeGreaterThan(200);
      expect(audioContext.harmonics).toBeInstanceOf(Array);
    });

    it('should create different timbres for different emotions', () => {
      const joyDNA = { joy: 0.9, sadness: 0.1, anger: 0.1, fear: 0.1, surprise: 0.1, disgust: 0.1, trust: 0.8 };
      const fearDNA = { joy: 0.1, sadness: 0.1, anger: 0.1, fear: 0.9, surprise: 0.1, disgust: 0.1, trust: 0.1 };

      const joyTimbre = synthesis.generateTimbre(joyDNA);
      const fearTimbre = synthesis.generateTimbre(fearDNA);

      expect(joyTimbre.brightness).toBeGreaterThan(fearTimbre.brightness);
      expect(fearTimbre.dissonance).toBeGreaterThan(joyTimbre.dissonance);
    });

    it('should maintain audio sync with visual (< 20ms latency)', () => {
      const emotionalDNA = {
        joy: 0.5,
        sadness: 0.3,
        anger: 0.2,
        fear: 0.1,
        surprise: 0.4,
        disgust: 0.1,
        trust: 0.6
      };

      const startTime = performance.now();
      synthesis.triggerEmotionalSound(emotionalDNA);
      const endTime = performance.now();

      const latency = endTime - startTime;
      expect(latency).toBeLessThan(20); // < 20ms sync requirement
    });
  });

  describe('adaptive synthesis', () => {
    it('should adapt synthesis to user preferences over time', () => {
      const userPreference = {
        preferredFrequencyRange: [200, 800],
        dislikedHarmonics: [3, 7],
        preferredTimbre: 'warm'
      };

      synthesis.adaptToUser(userPreference);
      
      const emotionalDNA = {
        joy: 0.6,
        sadness: 0.2,
        anger: 0.1,
        fear: 0.1,
        surprise: 0.3,
        disgust: 0.1,
        trust: 0.5
      };

      const adaptedAudio = synthesis.generateAudioContext(emotionalDNA);

      expect(adaptedAudio.frequency).toBeGreaterThanOrEqual(200);
      expect(adaptedAudio.frequency).toBeLessThanOrEqual(800);
    });
  });

  describe('procedural composition', () => {
    it('should generate unique compositions for each session', () => {
      const emotionalDNA = {
        joy: 0.7,
        sadness: 0.2,
        anger: 0.1,
        fear: 0.1,
        surprise: 0.3,
        disgust: 0.1,
        trust: 0.6
      };

      const composition1 = synthesis.generateComposition(emotionalDNA, 5000);
      const composition2 = synthesis.generateComposition(emotionalDNA, 5000);

      expect(composition1.notes).not.toEqual(composition2.notes);
      expect(composition1.uniquenessHash).not.toBe(composition2.uniquenessHash);
    });
  });
});
