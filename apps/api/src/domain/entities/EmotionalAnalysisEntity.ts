/**
 * Emotional Analysis Domain Entity - Clean Architecture
 * ATUALIZADO: Entidade de domínio robusta para análise emocional
 */

export enum DominantAffect {
  JOY = 'joy',
  CURIOSITY = 'curiosity',
  WONDER = 'wonder',
  CALM = 'calm',
  EXCITEMENT = 'excitement',
  CONTEMPLATION = 'contemplation',
  AWE = 'awe',
  NEUTRAL = 'neutral',
  SADNESS = 'sadness',
  ANXIETY = 'anxiety'
}

export enum Recommendation {
  ENHANCE_POSITIVE = 'enhance_positive',
  STABILIZE = 'stabilize',
  EXPLORE_DEEPER = 'explore_deeper',
  CONTINUE = 'continue',
  SYSTEM_ERROR = 'system_error',
  SEEK_SUPPORT = 'seek_support'
}

export enum EmotionalShift {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  STABLE = 'stable',
  ESCALATING = 'escalating',
  UNKNOWN = 'unknown'
}

export enum MorphogenicSuggestion {
  FIBONACCI = 'fibonacci',
  SPIRAL = 'spiral',
  WAVE = 'wave',
  PARTICLE = 'particle',
  CRYSTALLINE = 'crystalline',
  ORGANIC = 'organic',
  CHAOTIC = 'chaotic',
  HARMONIC = 'harmonic'
}

export enum AnalysisSource {
  TEXT = 'text',
  BEHAVIORAL = 'behavioral',
  HYBRID = 'hybrid'
}

export interface AnalysisMetadata {
  processingTimeMs: number;
  source: AnalysisSource;
  version: string;
  confidence: number;
}

export class EmotionalAnalysisEntity {
  constructor(
    public readonly intensity: number,
    public readonly dominantAffect: DominantAffect,
    public readonly confidence: number,
    public readonly recommendation: Recommendation,
    public readonly emotionalShift: EmotionalShift,
    public readonly morphogenicSuggestion: MorphogenicSuggestion,
    public readonly timestamp: Date,
    public readonly metadata: AnalysisMetadata
  ) {
    this.validateValues();
  }

  private validateValues(): void {
    if (this.intensity < 0 || this.intensity > 1) {
      throw new Error('Intensity must be between 0 and 1');
    }
    
    if (this.confidence < 0 || this.confidence > 1) {
      throw new Error('Confidence must be between 0 and 1');
    }
    
    if (this.metadata.processingTimeMs < 0) {
      throw new Error('Processing time cannot be negative');
    }
  }

  static fromTextAnalysis(
    text: string,
    processingTimeMs: number
  ): EmotionalAnalysisEntity {
    // Análise básica de sentimento
    const analysis = analyzeTextSentiment(text);
    
    return new EmotionalAnalysisEntity(
      analysis.intensity,
      analysis.dominantAffect,
      analysis.confidence,
      analysis.recommendation,
      analysis.emotionalShift,
      MorphogenicSuggestion.SPIRAL,
      new Date(),
      {
        processingTimeMs,
        source: AnalysisSource.TEXT,
        version: 'v1',
        confidence: analysis.confidence
      }
    );
  }

  static fromBehavioralData(
    emotionalState: any,
    mousePosition: any,
    sessionDuration: number,
    processingTimeMs: number
  ): EmotionalAnalysisEntity {
    // Análise baseada em comportamento
    const analysis = analyzeBehavioralData(emotionalState, mousePosition, sessionDuration);
    
    return new EmotionalAnalysisEntity(
      analysis.intensity,
      analysis.dominantAffect,
      analysis.confidence,
      analysis.recommendation,
      analysis.emotionalShift,
      MorphogenicSuggestion.FIBONACCI,
      new Date(),
      {
        processingTimeMs,
        source: AnalysisSource.BEHAVIORAL,
        version: 'v1',
        confidence: analysis.confidence
      }
    );
  }

  public isHighIntensity(): boolean {
    return this.intensity > 0.7;
  }

  public isHighConfidence(): boolean {
    return this.confidence > 0.8;
  }

  public requiresAttention(): boolean {
    return this.recommendation === Recommendation.SEEK_SUPPORT ||
           this.recommendation === Recommendation.SYSTEM_ERROR;
  }

  public toJSON() {
    return {
      intensity: this.intensity,
      dominantAffect: this.dominantAffect,
      timestamp: this.timestamp.toISOString(),
      confidence: this.confidence,
      recommendation: this.recommendation,
      emotionalShift: this.emotionalShift,
      morphogenicSuggestion: this.morphogenicSuggestion,
      metadata: this.metadata
    };
  }
}

// Helper functions para análise
function analyzeTextSentiment(text: string) {
  const positiveWords = ['feliz', 'alegre', 'ótimo', 'excelente', 'maravilhoso', 'amor', 'joy', 'happy', 'great'];
  const negativeWords = ['triste', 'ruim', 'péssimo', 'ódio', 'raiva', 'deprimido', 'sad', 'bad', 'hate'];
  
  const lowerText = text.toLowerCase();
  const positiveMatches = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeMatches = negativeWords.filter(word => lowerText.includes(word)).length;
  
  let dominantAffect: DominantAffect;
  let intensity: number;
  let emotionalShift: EmotionalShift;
  let recommendation: Recommendation;
  
  if (positiveMatches > negativeMatches) {
    dominantAffect = DominantAffect.JOY;
    intensity = Math.min(0.9, 0.4 + (positiveMatches * 0.2));
    emotionalShift = EmotionalShift.POSITIVE;
    recommendation = Recommendation.ENHANCE_POSITIVE;
  } else if (negativeMatches > positiveMatches) {
    dominantAffect = DominantAffect.SADNESS;
    intensity = Math.min(0.8, 0.4 + (negativeMatches * 0.2));
    emotionalShift = EmotionalShift.NEGATIVE;
    recommendation = negativeMatches > 2 ? Recommendation.SEEK_SUPPORT : Recommendation.STABILIZE;
  } else {
    dominantAffect = DominantAffect.NEUTRAL;
    intensity = 0.5;
    emotionalShift = EmotionalShift.STABLE;
    recommendation = Recommendation.CONTINUE;
  }
  
  return {
    intensity,
    dominantAffect,
    confidence: 0.75,
    recommendation,
    emotionalShift
  };
}

function analyzeBehavioralData(emotionalState: any, mousePosition: any, sessionDuration: number) {
  const avgResonance = emotionalState.resonancePatterns.reduce((a: number, b: number) => a + b, 0) / 
                      emotionalState.resonancePatterns.length;
  
  const intensity = (emotionalState.morphogeneticField + avgResonance + emotionalState.quantumCoherence) / 3;
  
  let dominantAffect: DominantAffect;
  let recommendation: Recommendation;
  let emotionalShift: EmotionalShift;
  
  if (sessionDuration > 300000) { // > 5 minutos
    dominantAffect = DominantAffect.CONTEMPLATION;
    recommendation = Recommendation.EXPLORE_DEEPER;
    emotionalShift = EmotionalShift.STABLE;
  } else if (intensity > 0.7) {
    dominantAffect = DominantAffect.EXCITEMENT;
    recommendation = Recommendation.ENHANCE_POSITIVE;
    emotionalShift = EmotionalShift.POSITIVE;
  } else {
    dominantAffect = DominantAffect.CURIOSITY;
    recommendation = Recommendation.CONTINUE;
    emotionalShift = EmotionalShift.STABLE;
  }
  
  return {
    intensity,
    dominantAffect,
    confidence: 0.85,
    recommendation,
    emotionalShift
  };
}
