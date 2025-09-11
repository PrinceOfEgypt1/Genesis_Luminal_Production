/**
 * 🏷️ TIPOS PARA IA REAL
 * Tipos específicos para integração Claude API
 */

export interface RealAIConfig {
  enableClaudeAPI: boolean;
  fallbackToSimulation: boolean;
  analysisInterval: number;
  maxHistorySize: number;
}

export interface AIAnalysisResult {
  type: 'claude-api' | 'simulation' | 'fallback';
  confidence: number;
  timestamp: number;
  processingTime: number;
}

export const AI_CONFIG: RealAIConfig = {
  enableClaudeAPI: true,
  fallbackToSimulation: false,
  analysisInterval: 30000, // 30 segundos
  maxHistorySize: 20
};
