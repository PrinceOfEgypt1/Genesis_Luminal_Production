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
  /** Intensidade (0..1). Temporariamente opcional para compatibilidade. */
  intensity?: number;
  /** Afeto dominante. Temporariamente opcional. */
  dominantAffect?: EmotionalAffect;
  /** Estado emocional resultante */
  newState: EmotionalDNA;
  /** Timestamp da análise */
  timestamp: number;
  /** Confiança da predição */
  confidence: number;
}

// === HEALTH CHECK ===

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: number;
  uptime: number;
  services: {
    database?: 'healthy' | 'unhealthy';
    cache?: 'healthy' | 'unhealthy';
    ai?: 'healthy' | 'unhealthy';
  };
  version: string;
}

// === PERFORMANCE METRICS ===

export interface PerformanceMetrics {
  fps: number;
  latency: number;
  memoryUsage: number;
  renderTime: number;
}

// === ERROR RESPONSES ===

export interface ApiError {
  code: string;
  message: string;
  timestamp: number;
  path?: string;
}
