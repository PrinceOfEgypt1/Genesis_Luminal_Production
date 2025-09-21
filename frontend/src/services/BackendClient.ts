import { 
  EmotionalAnalysisRequest,
  EmotionalAnalysisResponse,
  HealthCheckResponse
} from '../../../packages/shared/types/api';

export class BackendClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'http://localhost:3001';
  }

  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/liveness`);
      const data = await response.json();
      
      return {
        success: response.ok,
        status: response.ok ? 'ok' : 'error',
        timestamp: Date.now(),
        uptime: data.uptime || 0,
        services: data.services || {},
        version: data.version || '1.0.0'
      };
    } catch (error) {
      return {
        success: false,
        status: 'offline',
        timestamp: Date.now(),
        uptime: 0,
        services: {},
        version: '1.0.0',
        error: String(error)
      };
    }
  }

  async analyzeEmotionalState(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/emotional/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      
      const data = await response.json();
      
      return {
        success: response.ok,
        newState: data.newState || request.currentState,
        timestamp: Date.now(),
        confidence: data.confidence || 0.5,
        recommendation: data.recommendation || 'continue exploring',
        emotionalShift: data.emotionalShift || 'stable',
        intensity: data.intensity || 0.5,
        dominantAffect: data.dominantAffect || 'curiosity'
      };
    } catch (error) {
      return {
        success: false,
        newState: request.currentState,
        timestamp: Date.now(),
        confidence: 0,
        recommendation: 'connection failed',
        error: String(error)
      };
    }
  }
}
