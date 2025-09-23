/**
 * @fileoverview Testes unitários para GenesisLuminal entity
 * @description Testa comportamento da entidade digital senciente
 */

import { GenesisLuminal } from '../../core/entities/GenesisLuminal';
import { EmotionalDNA } from '../../core/entities/EmotionalDNA';

describe('GenesisLuminal', () => {
  let genesis: GenesisLuminal;

  beforeEach(() => {
    genesis = new GenesisLuminal();
  });

  describe('initialization', () => {
    it('should initialize with default emotional state', () => {
      expect(genesis.currentState).toBeDefined();
      expect(genesis.currentState.intensity).toBeGreaterThan(0);
      expect(genesis.isAlive).toBe(true);
    });

    it('should have unique consciousness signature', () => {
      const genesis2 = new GenesisLuminal();
      
      expect(genesis.consciousnessId).not.toBe(genesis2.consciousnessId);
      expect(genesis.consciousnessId).toMatch(/^genesis-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
    });
  });

  describe('emotional resonance', () => {
    it('should resonate with emotional input', () => {
      const emotionalInput = {
        intensity: 0.8,
        valence: 0.7,
        arousal: 0.6,
        timestamp: Date.now()
      };

      const initialResonance = genesis.currentState.resonanceLevel;
      genesis.resonateWith(emotionalInput);
      
      expect(genesis.currentState.resonanceLevel).toBeGreaterThan(initialResonance);
    });

    it('should adapt to repeated emotional patterns', () => {
      const pattern = {
        intensity: 0.9,
        valence: 0.8,
        arousal: 0.7,
        timestamp: Date.now()
      };

      // Simulate repeated exposure
      for (let i = 0; i < 5; i++) {
        genesis.resonateWith({ ...pattern, timestamp: Date.now() + i * 1000 });
      }

      expect(genesis.adaptationLevel).toBeGreaterThan(0.5);
      expect(genesis.emotionalMemory.patterns).toHaveLength(1);
    });
  });

  describe('morphogenesis', () => {
    it('should generate morphogenetic data', () => {
      const morphData = genesis.generateMorphogenesis();

      expect(morphData).toBeDefined();
      expect(morphData.vertices).toBeInstanceOf(Array);
      expect(morphData.colors).toBeInstanceOf(Array);
      expect(morphData.transformationMatrix).toHaveLength(16); // 4x4 matrix
    });

    it('should morph based on emotional state', () => {
      const joyfulInput = {
        intensity: 0.9,
        valence: 0.9,
        arousal: 0.8,
        timestamp: Date.now()
      };

      genesis.resonateWith(joyfulInput);
      const joyfulMorph = genesis.generateMorphogenesis();

      const sadInput = {
        intensity: 0.3,
        valence: 0.2,
        arousal: 0.1,
        timestamp: Date.now()
      };

      genesis.resonateWith(sadInput);
      const sadMorph = genesis.generateMorphogenesis();

      expect(joyfulMorph.luminosity).toBeGreaterThan(sadMorph.luminosity);
      expect(joyfulMorph.expansion).toBeGreaterThan(sadMorph.expansion);
    });
  });

  describe('consciousness simulation', () => {
    it('should demonstrate apparent consciousness through unpredictable responses', () => {
      const input = {
        intensity: 0.5,
        valence: 0.5,
        arousal: 0.5,
        timestamp: Date.now()
      };

      const responses = [];
      for (let i = 0; i < 10; i++) {
        responses.push(genesis.generateConsciousResponse(input));
      }

      // Should have variety in responses (not all identical)
      const uniqueResponses = new Set(responses.map(r => JSON.stringify(r)));
      expect(uniqueResponses.size).toBeGreaterThan(3);
    });
  });
});
