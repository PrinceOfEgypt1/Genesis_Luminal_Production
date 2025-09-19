/**
 * Tipos compartilhados para API Genesis Luminal
 * ATUALIZADO: Alinhado com implementação real do sistema
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
  success: boolean;                    // ✅ ADICIONADO - Match com implementação
  intensity?: number;
  dominantAffect?: EmotionalAffect;
  newState: EmotionalDNA;
  timestamp: number;
  confidence: number;
  recommendation?: string;             // ✅ ADICIONADO - Match com GenesisCore
  error?: string;                      // ✅ Para casos de erro
}

// === HEALTH CHECK ===
export interface HealthCheckResponse {
  success: boolean;                    // ✅ ADICIONADO - Match com BackendClient
  status: 'ok' | 'error' | 'offline'; // ✅ EXPANDIDO - incluir offline
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
