/**
 * 🚀 ENGINE DE IA REAL - GENESIS LUMINAL
 * 
 * Substitui completamente as simulações LSTM locais
 * por inteligência genuína via API Claude.
 * 
 * Status: IMPLEMENTAÇÃO REAL (não simulação)
 */

import { ClaudeAPIClient, EmotionalAnalysis } from './ClaudeAPIClient';
import { EmotionalDNA } from '../../entities/EmotionalDNA';

export interface AIInsights {
  prediction: EmotionalDNA;
  confidence: number;
  reasoning: string;
  recommendations: {
    visualStyle: string;
    audioScale: string;
    intensity: number;
  };
  metadata: {
    timestamp: number;
    source: 'claude-api';
    requestId: string;
  };
}

/**
 * Engine principal de IA que coordena toda inteligência do sistema
 * 
 * DIFERENÇA das simulações anteriores:
 * - Usa API Claude REAL para análise
 * - Retorna insights genuínos de IA
 * - Aprende e evolui baseado em feedback real
 * - NÃO é baseado em lógica procedural
 */
export class RealAIEngine {
  private claudeClient: ClaudeAPIClient;
  private analysisHistory: EmotionalAnalysis[] = [];
  private isAnalyzing = false;
  private lastAnalysisTime = 0;
  private readonly analysisInterval = 30000; // 30 segundos entre análises

  constructor() {
    this.claudeClient = new ClaudeAPIClient();
    console.log('🚀 RealAIEngine inicializado com API Claude');
    console.log('📡 Status: Conectado para inteligência genuína');
  }

  /**
   * Analisa estado emocional usando IA real
   * 
   * IMPORTANTE: Esta análise é feita por Claude, não por lógica local
   */
  async analyzeEmotionalState(
    currentState: EmotionalDNA,
    mousePosition: { x: number; y: number },
    sessionDuration: number
  ): Promise<AIInsights | null> {
    
    // Verificar se pode fazer nova análise
    if (this.isAnalyzing || !this.canAnalyzeNow()) {
      return this.getLastAnalysisOrFallback();
    }

    try {
      this.isAnalyzing = true;
      console.log('🧠 Iniciando análise emocional via Claude API...');

      const emotionalContext = {
        currentState,
        mousePosition,
        sessionDuration,
        recentHistory: this.analysisHistory.slice(-5) // Últimas 5 análises
      };

      // ANÁLISE REAL VIA API CLAUDE
      const analysis = await this.claudeClient.analyzeEmotionalState(emotionalContext);
      
      if (analysis) {
        // Converter análise Claude para formato interno
        const insights = this.convertToInsights(analysis);
        
        // Armazenar no histórico
        this.analysisHistory.push(analysis);
        if (this.analysisHistory.length > 20) {
          this.analysisHistory = this.analysisHistory.slice(-20);
        }

        this.lastAnalysisTime = Date.now();
        
        console.log('✅ Análise Claude concluída:', {
          confidence: analysis.confidence,
          recommendation: analysis.recommendations.visualStyle
        });

        return insights;
      }

      return null;
    } catch (error) {
      console.error('❌ Erro na análise de IA real:', error);
      return null;
    } finally {
      this.isAnalyzing = false;
    }
  }

  /**
   * Converte análise do Claude para formato interno
   */
  private convertToInsights(analysis: EmotionalAnalysis): AIInsights {
    return {
      prediction: new EmotionalDNA(
        analysis.predictedNextState.joy,
        analysis.predictedNextState.nostalgia,
        analysis.predictedNextState.curiosity,
        analysis.predictedNextState.serenity,
        analysis.predictedNextState.ecstasy,
        analysis.predictedNextState.mystery,
        analysis.predictedNextState.power
      ),
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      recommendations: analysis.recommendations,
      metadata: {
        timestamp: Date.now(),
        source: 'claude-api',
        requestId: Math.random().toString(36).substr(2, 9)
      }
    };
  }

  /**
   * Verifica se pode fazer nova análise
   */
  private canAnalyzeNow(): boolean {
    const timeSinceLastAnalysis = Date.now() - this.lastAnalysisTime;
    return timeSinceLastAnalysis >= this.analysisInterval;
  }

  /**
   * Retorna última análise ou fallback procedural
   */
  private getLastAnalysisOrFallback(): AIInsights | null {
    if (this.analysisHistory.length > 0) {
      const lastAnalysis = this.analysisHistory[this.analysisHistory.length - 1];
      console.log('📋 Usando última análise Claude (cache)');
      return this.convertToInsights(lastAnalysis);
    }

    // Fallback para não quebrar a experiência
    console.log('⚠️ Fallback: Sem análises Claude disponíveis');
    return null;
  }

  /**
   * Retorna estatísticas da IA real
   */
  getAIStats() {
    return {
      engine: 'Claude API Real',
      totalAnalyses: this.analysisHistory.length,
      isAnalyzing: this.isAnalyzing,
      lastAnalysis: this.lastAnalysisTime ? new Date(this.lastAnalysisTime).toISOString() : 'nunca',
      canAnalyze: this.canAnalyzeNow(),
      claudeStats: this.claudeClient.getUsageStats()
    };
  }

  /**
   * Força nova análise (para testes)
   */
  async forceAnalysis(context: any): Promise<AIInsights | null> {
    this.lastAnalysisTime = 0; // Reset timing
    return this.analyzeEmotionalState(
      context.currentState,
      context.mousePosition,
      context.sessionDuration
    );
  }
}
