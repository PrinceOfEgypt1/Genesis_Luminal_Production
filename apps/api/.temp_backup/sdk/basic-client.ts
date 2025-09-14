/**
 * SDK Básico Tipado - SEM dependências externas
 * IMPLEMENTADO: Cliente funcional para Genesis Luminal API
 */

// Tipos básicos baseados na especificação OpenAPI
export interface LivenessResponse {
  status: 'alive';
  timestamp: string;
}

export interface ReadinessResponse {
  status: string;
  ready: boolean;
  timestamp: string;
}

export interface StatusResponse {
  status: string;
  timestamp: string;
  version?: string;
}

export interface TextAnalysisRequest {
  text: string;
}

export interface BehavioralAnalysisRequest {
  emotionalState: {
    morphogeneticField: number;
    resonancePatterns: number[];
    quantumCoherence: number;
  };
  mousePosition: {
    x: number;
    y: number;
  };
  sessionDuration: number;
  userId?: string;
}

export interface EmotionalAnalysisResponse {
  intensity: number;
  dominantAffect: string;
  timestamp: string;
  confidence: number;
  recommendation: string;
  emotionalShift: string;
  morphogenicSuggestion: string;
}

export class GenesisLuminalApiClient {
  constructor(private baseUrl: string = 'http://localhost:3001/api') {}

  async checkLiveness(): Promise<LivenessResponse> {
    const response = await fetch(`${this.baseUrl}/liveness`);
    if (!response.ok) throw new Error('Liveness check failed');
    return response.json();
  }

  async checkReadiness(): Promise<ReadinessResponse> {
    const response = await fetch(`${this.baseUrl}/readiness`);
    if (!response.ok) throw new Error('Readiness check failed');
    return response.json();
  }

  async getStatus(): Promise<StatusResponse> {
    const response = await fetch(`${this.baseUrl}/status`);
    if (!response.ok) throw new Error('Status check failed');
    return response.json();
  }

  async analyzeEmotion(
    request: TextAnalysisRequest | BehavioralAnalysisRequest
  ): Promise<EmotionalAnalysisResponse> {
    const response = await fetch(`${this.baseUrl}/emotional/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error('Emotional analysis failed');
    return response.json();
  }
}

// Export para uso direto
export default GenesisLuminalApiClient;
