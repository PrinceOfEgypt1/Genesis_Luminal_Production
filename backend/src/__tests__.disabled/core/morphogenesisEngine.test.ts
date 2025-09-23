/**
 * @fileoverview Testes unitários para MorphogenesisEngine
 * @description Testa geração procedural de formas emocionais
 */

import { MorphogenesisEngine } from '../../core/usecases/MorphogenesisEngine';
import { EmotionalDNA } from '../../core/entities/EmotionalDNA';

describe('MorphogenesisEngine', () => {
  let engine: MorphogenesisEngine;

  beforeEach(() => {
    engine = new MorphogenesisEngine();
  });

  describe('shape generation', () => {
    it('should generate valid SDF functions', () => {
      const emotionalDNA = {
        joy: 0.8,
        sadness: 0.1,
        anger: 0.1,
        fear: 0.1,
        surprise: 0.2,
        disgust: 0.1,
        trust: 0.7
      };

      const sdf = engine.generateSDF(emotionalDNA);

      expect(sdf).toBeDefined();
      expect(typeof sdf).toBe('function');
      
      // Test SDF function at origin
      const distanceAtOrigin = sdf(0, 0, 0);
      expect(typeof distanceAtOrigin).toBe('number');
    });

    it('should create different shapes for different emotions', () => {
      const joyDNA = { joy: 0.9, sadness: 0.1, anger: 0.1, fear: 0.1, surprise: 0.1, disgust: 0.1, trust: 0.8 };
      const sadDNA = { joy: 0.1, sadness: 0.9, anger: 0.1, fear: 0.1, surprise: 0.1, disgust: 0.1, trust: 0.2 };

      const joyShape = engine.generateMorphology(joyDNA);
      const sadShape = engine.generateMorphology(sadDNA);

      expect(joyShape.expansion).toBeGreaterThan(sadShape.expansion);
      expect(joyShape.complexity).toBeGreaterThan(sadShape.complexity);
    });

    it('should generate smooth transformations', () => {
      const startDNA = { joy: 0.2, sadness: 0.1, anger: 0.1, fear: 0.1, surprise: 0.1, disgust: 0.1, trust: 0.3 };
      const endDNA = { joy: 0.8, sadness: 0.1, anger: 0.1, fear: 0.1, surprise: 0.1, disgust: 0.1, trust: 0.7 };

      const transformation = engine.generateTransformation(startDNA, endDNA, 10);

      expect(transformation).toHaveLength(10);
      expect(transformation[0].joy).toBeCloseTo(0.2, 1);
      expect(transformation[9].joy).toBeCloseTo(0.8, 1);
      
      // Check smooth interpolation
      for (let i = 1; i < transformation.length; i++) {
        expect(transformation[i].joy).toBeGreaterThanOrEqual(transformation[i-1].joy);
      }
    });
  });

  describe('procedural generation', () => {
    it('should generate vertex data for WebGL rendering', () => {
      const emotionalDNA = {
        joy: 0.6,
        sadness: 0.2,
        anger: 0.1,
        fear: 0.1,
        surprise: 0.3,
        disgust: 0.1,
        trust: 0.5
      };

      const vertexData = engine.generateVertexData(emotionalDNA, 1000);

      expect(vertexData.vertices).toHaveLength(1000 * 3); // x, y, z per vertex
      expect(vertexData.colors).toHaveLength(1000 * 4); // r, g, b, a per vertex
      expect(vertexData.normals).toHaveLength(1000 * 3); // nx, ny, nz per vertex
    });

    it('should respect emotional constraints in generation', () => {
      const fearDominantDNA = {
        joy: 0.1,
        sadness: 0.1,
        anger: 0.1,
        fear: 0.8,
        surprise: 0.1,
        disgust: 0.1,
        trust: 0.1
      };

      const morphology = engine.generateMorphology(fearDominantDNA);

      expect(morphology.sharpness).toBeGreaterThanOrEqual(0.5); // Fear creates sharp forms
      expect(morphology.retraction).toBeGreaterThan(0.5); // Fear causes retraction
    });
  });

  describe('performance optimization', () => {
    it('should generate morphology within performance budget', () => {
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
      const morphology = engine.generateMorphology(emotionalDNA);
      const endTime = performance.now();

      const generationTime = endTime - startTime;
      expect(generationTime).toBeLessThan(16); // Must generate in < 1 frame at 60fps
    });
  });
});
