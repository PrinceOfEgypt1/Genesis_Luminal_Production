/**
 * Cliente para comunicação com backend
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

export interface EmotionalAnalysisRequest {
  currentState: any;
  mousePosition: { x: number; y: number };
  sessionDuration: number;
}

export interface EmotionalAnalysisResponse {
  success: boolean;
  analysis: {
    currentState: any;
    predictedNextState: any;
    recommendations: {
      visualStyle: string;
      audioScale: string;
      intensity: number;
    };
    confidence: number;
    reasoning: string;
  };
  timestamp: string;
  fallback?: boolean;
}

export class BackendClient {
  private baseURL: string;

  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async analyzeEmotionalState(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse | null> {
    try {
      const response = await fetch(`${this.baseURL}/emotional/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Backend API error:', error);
      return null;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
export const backendClient = new BackendClient();
