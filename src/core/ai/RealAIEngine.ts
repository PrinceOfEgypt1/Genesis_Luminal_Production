/**
 * @fileoverview Engine de IA Real usando Claude API
 * 
 * Substitui todas as simulações por IA genuína da Anthropic.
 * Mantém interface compatível mas usa inteligência real.
 */

import { ClaudeAPIClient } from './ClaudeAPIClient';

interface EmotionalDNA {
  joy: number; nostalgia: number; curiosity: number; serenity: number;
  ecstasy: number; mystery: number; power: number;
}

interface EmotionalPrediction {
  predictedEmotion: EmotionalDNA;
  confidence: number;
  timeHorizon: number;
  reasoning: string;
  isRealAI: boolean;
}

/**
 * Engine de IA Real - substitui simulações
 */
export class RealAIEngine {
  private claudeClient: ClaudeAPIClient;
  private emotionalHistory: EmotionalDNA[] = [];
  private sessionStartTime: number = Date.now();
  private interactionPatterns: string[] = [];

  constructor() {
    this.claudeClient = new ClaudeAPIClient();
    console.log('🧠 Engine de IA Real inicializada com Claude API');
  }

  /**
   * Adiciona estado emocional e solicita análise da IA real
   */
  async addEmotionalState(dna: EmotionalDNA): Promise<void> {
    this.emotionalHistory.push({ ...dna });
    
    // Manter histórico dos últimos 20 estados
    if (this.emotionalHistory.length > 20) {
      this.emotionalHistory.shift();
    }

    // Detectar padrões de interação
    this.detectInteractionPattern(dna);
  }

  /**
   * PREDIÇÃO REAL usando Claude
   */
  async predictNextState(): Promise<EmotionalPrediction | null> {
    if (this.emotionalHistory.length < 3) {
      return null;
    }

    try {
      const context = {
        currentState: this.emotionalHistory[this.emotionalHistory.length - 1],
        mousePosition: this.inferMousePosition(),
        sessionDuration: Date.now() - this.sessionStartTime,
        recentHistory: this.emotionalHistory.slice(-5),
        timeOfDay: new Date().getHours(),
        interactionPatterns: this.interactionPatterns
      };

      const prediction = await this.claudeClient.predictNextEmotionalState(
        context.currentState,
        context
      );

      if (!prediction) {
        return null;
      }

      return {
        predictedEmotion: prediction.predictedState,
        confidence: prediction.confidence,
        timeHorizon: 5000, // 5 segundos
        reasoning: `IA Real Claude: ${prediction.reasoning}`,
        isRealAI: true
      };

    } catch (error) {
      console.error('❌ Erro na predição IA real:', error);
      return null;
    }
  }

  /**
   * Detecta padrões de interação para contexto
   */
  private detectInteractionPattern(dna: EmotionalDNA): void {
    const dominant = Object.entries(dna).reduce((max, [emotion, value]) => 
      value > dna[max as keyof EmotionalDNA] ? emotion : max, 'joy'
    );

    this.interactionPatterns.push(dominant);
    
    // Manter apenas últimos 10 padrões
    if (this.interactionPatterns.length > 10) {
      this.interactionPatterns.shift();
    }
  }

  /**
   * Infere posição do mouse baseada no estado emocional
   */
  private inferMousePosition(): { x: number; y: number } {
    const current = this.emotionalHistory[this.emotionalHistory.length - 1];
    return {
      x: (current.curiosity + current.joy) / 2,
      y: (current.serenity + current.power) / 2
    };
  }

  /**
   * MÉTRICAS DA IA REAL
   */
  getMetrics() {
    return {
      accuracy: 'N/A (IA Real Claude)',
      historySize: this.emotionalHistory.length,
      maxHistorySize: 20,
      isReady: this.claudeClient.isAPIEnabled(),
      isRealAI: true,
      aiType: 'Claude API',
      status: this.claudeClient.getStatus()
    };
  }

  /**
   * Recomendações personalizadas da IA
   */
  async getPersonalizedRecommendations(): Promise<any> {
    if (this.emotionalHistory.length === 0) {
      return {
        visualStyle: 'fibonacci',
        audioScale: 'ethereal',
        intensity: 0.7
      };
    }

    const context = {
      currentState: this.emotionalHistory[this.emotionalHistory.length - 1],
      mousePosition: this.inferMousePosition(),
      sessionDuration: Date.now() - this.sessionStartTime,
      recentHistory: this.emotionalHistory.slice(-5),
      timeOfDay: new Date().getHours(),
      interactionPatterns: this.interactionPatterns
    };

    const recommendations = await this.claudeClient.getPersonalizedRecommendations(
      null, // userProfile pode ser expandido futuramente
      context
    );

    return recommendations;
  }

  /**
   * Status da IA
   */
  isRealAI(): boolean {
    return this.claudeClient.isAPIEnabled();
  }
}
