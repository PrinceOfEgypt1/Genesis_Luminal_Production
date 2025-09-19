export interface Vector2D {
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

export interface EmotionalAnalysisRequest {
  currentState: EmotionalDNA;
  mousePosition: Vector2D;
  sessionDuration: number;
  userId?: string;
}

export interface EmotionalAnalysisResponse {
  success: boolean;
  newState: EmotionalDNA;
  timestamp: number;
  confidence: number;
  recommendation?: string;
  error?: string;
  emotionalShift?: string;
  intensity?: number;
  dominantAffect?: string;
}

export interface HealthCheckResponse {
  success: boolean;
  status: 'ok' | 'error' | 'offline';
  timestamp: number;
  uptime: number;
  services: {
    database?: 'healthy' | 'unhealthy';
    cache?: 'healthy' | 'unhealthy';
    ai?: 'healthy' | 'unhealthy';
  };
  version: string;
  error?: any;
}
