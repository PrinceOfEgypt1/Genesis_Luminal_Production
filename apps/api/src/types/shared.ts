/**
 * TRILHO B AÇÃO 6 - Types Consolidados (Reset Arquitetural)
 * 
 * Consolidação local para eliminar dependências monorepo
 * Resolução definitiva: Standalone architecture
 */

// Core Types
export interface Vector2D {
  x: number;
  y: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
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

// API Request/Response Types
export interface EmotionalAnalysisRequest {
  currentState?: EmotionalDNA;
  mousePosition?: Vector2D;
  sessionDuration?: number;
  userId?: string;
  text?: string; // Compatibilidade com backend atual
}

export interface EmotionalAnalysisResponse {
  success: boolean; // ✅ ADICIONADO para resolver erros
  intensity: number;
  dominantAffect: string;
  timestamp: string;
  confidence: number;
  recommendation: string;
  emotionalShift: string;
  morphogenicSuggestion: string;
}

// Provider Types
export enum ProviderType {
  ANTHROPIC = 'anthropic',
  FALLBACK = 'fallback'
}

export interface RoutingConfig {
  primaryProvider: ProviderType;
  fallbackProvider: ProviderType;
  retryAttempts: number;
  timeout: number;
}

export interface FallbackStrategy {
  enabled: boolean;
  triggers: string[];
  fallbackDelay: number;
}

export interface ProviderStateChangeEvent {
  from: ProviderType;
  to: ProviderType;
  reason: string;
  timestamp: Date;
}

// Claude API Types
export interface ClaudeApiResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{ type: string; text: string }>;
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Error Types
export interface ErrorResponseDto {
  error: string;
  message: string;
  timestamp: string;
  path?: string;
}

// Utility function exports
export function extractTextFromRequest(request: EmotionalAnalysisRequest): string {
  if (request.text) {
    return request.text;
  }
  
  if (request.currentState) {
    const dominant = Object.entries(request.currentState)
      .sort(([,a], [,b]) => b - a)[0];
    return `Dominant emotion: ${dominant[0]} (${dominant[1].toFixed(2)})`;
  }
  
  return "No emotional context provided";
}
