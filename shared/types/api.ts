/**
 * Tipos compartilhados para API Genesis Luminal
 * Centralização de contratos entre frontend e backend
 */

// === TIPOS BÁSICOS ===

export interface Vector2D {
  x: number;
  y: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

// === TIPOS EMOCIONAIS ===

export interface EmotionalDNA {
  joy: number;
  nostalgia: number;
  curiosity: number;
  serenity: number;
  ecstasy: number;
  mystery: number;
  power: number;
}

export type EmotionalAffect = keyof EmotionalDNA;

// === REQUISIÇÕES E RESPOSTAS DA API ===

export interface EmotionalAnalysisRequest {
  currentState: EmotionalDNA;
  mousePosition: Vector2D;
  sessionDuration: number;
  userId?: string;
}

export interface EmotionalAnalysisResponse {
  success: boolean;
  intensity: number;
  dominantAffect: EmotionalAffect;
  timestamp: string;
  confidence: number;
  recommendation: string;
  emotionalShift?: string;
  morphogenicSuggestion?: string;
  error?: any;
}

// === HEALTH CHECK ===

export interface HealthCheckResponse {
  success: boolean;
  status: string;
  error?: any;
}

export interface SystemStatus {
  status: string;
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  uptime_seconds: number;
  memory_mb: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
  claude_api_key: 'configured' | 'missing';
}

// === PREDIÇÕES E ANÁLISES ===

export interface EmotionalPrediction {
  predictedEmotion: EmotionalDNA;
  confidence: number;
  timeHorizon: number;
  reasoning: string;
}

export interface ClaudeAnalysisResult {
  confidence: number;
  recommendation: string;
  emotionalShift: string;
  morphogenicSuggestion: string;
}

// === PERFORMANCE E SISTEMA ===

export interface PerformanceMetrics {
  fps: number;
  inputLatency: number;
  memoryUsage: number;
  particleCount: number;
  visibleParticles: number;
  renderedParticles: number;
  distributionTransitions: number;
  webglEnabled: boolean;
  adaptiveOptimizations: number;
}

// === CONFIGURAÇÕES ===

export interface AudioScale {
  name: string;
  frequencies: number[];
  emotions: string[];
  timbre: 'sine' | 'square' | 'sawtooth' | 'triangle';
}

export interface DistributionConfig {
  name: string;
  emotions: string[];
  description: string;
}

// === TIPOS DE EVENTOS ===

export type StatusChangeHandler = (message: string) => void;

// === ENUMS ===

export enum DistributionType {
  FIBONACCI = 'fibonacci',
  SPIRAL = 'spiral',
  ORGANIC = 'organic',
  RANDOM = 'random'
}

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected'
}