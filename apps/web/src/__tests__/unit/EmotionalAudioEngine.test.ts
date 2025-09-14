import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmotionalAudioEngine, EmotionalDNA } from '../../core/audio/EmotionalAudioEngine';

describe('EmotionalAudioEngine', () => {
  let audioEngine: EmotionalAudioEngine;

  beforeEach(async () => {
    audioEngine = new EmotionalAudioEngine();
    await audioEngine.initialize();
  });

  afterEach(() => {
    audioEngine.dispose();
  });

  it('should initialize successfully', async () => {
    const engine = new EmotionalAudioEngine();
    await expect(engine.initialize()).resolves.not.toThrow();
    engine.dispose();
  });

  it('should synthesize emotion successfully', () => {
    const emotionalDNA: EmotionalDNA = {
      joy: 0.8,
      nostalgia: 0.2,
      curiosity: 0.9,
      serenity: 0.1,
      ecstasy: 0.7,
      mystery: 0.3,
      power: 0.6
    };

    const result = audioEngine.synthesizeEmotion(emotionalDNA);
    
    expect(result.success).toBe(true);
    expect(result.frequency).toBeGreaterThan(0);
    expect(result.emotionalMapping).toBeDefined();
    expect(result.emotionalMapping?.dominant).toBe('curiosity'); // Maior valor
  });

  it('should map emotions to audio parameters correctly', () => {
    const highJoy: EmotionalDNA = {
      joy: 1.0, nostalgia: 0, curiosity: 0, serenity: 0,
      ecstasy: 0, mystery: 0, power: 0
    };

    const lowJoy: EmotionalDNA = {
      joy: 0.0, nostalgia: 1, curiosity: 0, serenity: 1,
      ecstasy: 0, mystery: 0, power: 0
    };

    const highJoyResult = audioEngine.synthesizeEmotion(highJoy);
    const lowJoyResult = audioEngine.synthesizeEmotion(lowJoy);

    // Joy e Ecstasy -> frequências mais altas
    expect(highJoyResult.frequency).toBeGreaterThan(lowJoyResult.frequency!);
  });

  it('should handle uninitialized engine gracefully', () => {
    const uninitializedEngine = new EmotionalAudioEngine();
    
    const result = uninitializedEngine.synthesizeEmotion({
      joy: 0.5, nostalgia: 0.5, curiosity: 0.5, serenity: 0.5,
      ecstasy: 0.5, mystery: 0.5, power: 0.5
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('not initialized');
  });

  it('should dispose resources correctly', () => {
    audioEngine.dispose();
    
    const result = audioEngine.synthesizeEmotion({
      joy: 0.5, nostalgia: 0.5, curiosity: 0.5, serenity: 0.5,
      ecstasy: 0.5, mystery: 0.5, power: 0.5
    });

    expect(result.success).toBe(false);
  });
});
