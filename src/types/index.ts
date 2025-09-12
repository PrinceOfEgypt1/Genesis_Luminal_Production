// ========================================
// GENESIS LUMINAL - TYPES CORRIGIDOS
// Status: ✅ IMPLEMENTADO - Types funcionais
// Versão: 4.1.0 - ZERO ERROS
// ========================================

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface MousePosition {
  x: number;
  y: number;
}

export interface EmotionalDNA {
  joy: number;
  nostalgia: number;
  curiosity: number;
  serenity: number;
  ecstasy: number;
  mystery: number;
  power: number;
}

export interface OptimizedParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  visible: boolean;
  lastUpdate: number;
  lodLevel: number;
  quadrant: number;
  originalIndex: number;
}

export interface PerformanceMetrics {
  fps: number;
  inputLatency: number;
  memoryUsage: number;
  particleCount: number;
  visibleParticles: number;
  renderedParticles: number;
  distributionTransitions: number;
  webglEnabled: boolean;
}

// ✅ CORREÇÃO CRÍTICA: Enum declarado diretamente (não import type)
export enum DistributionType {
  FIBONACCI = 'fibonacci',
  SPIRAL = 'spiral',
  ORGANIC = 'organic',
  RANDOM = 'random'
}

export interface DistributionConfig {
  name: string;
  emotions: string[];
  description: string;
  algorithm: (index: number, total: number) => Vector3;
}

export interface EmotionalPrediction {
  predictedEmotion: EmotionalDNA;
  confidence: number;
  timeHorizon: number;
  reasoning: string;
}
