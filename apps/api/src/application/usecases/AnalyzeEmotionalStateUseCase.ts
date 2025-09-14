/**
 * Analyze Emotional State Use Case - Application Layer
 * ATUALIZADO: Use case completo seguindo Clean Architecture
 */

import { EmotionalAnalysisEntity } from '../../domain/entities/EmotionalAnalysisEntity';
import { IEmotionalAnalysisService, ITextAnalysisRequest, IBehavioralAnalysisRequest } from '../interfaces/IEmotionalAnalysisService';
import { ProcessingMetrics } from '../../domain/value-objects/ProcessingMetrics';

export class AnalyzeEmotionalStateUseCase implements IEmotionalAnalysisService {
  constructor(
    private readonly logger?: any,
    private readonly cache?: any,
    private readonly analyzer?: any
  ) {}

  async analyzeText(request: ITextAnalysisRequest): Promise<EmotionalAnalysisEntity> {
    const startTime = new Date();
    
    try {
      this.logger?.info('Starting text analysis', { 
        textLength: request.text.length,
        timestamp: startTime.toISOString()
      });

      // Validação de entrada
      if (!request.text || request.text.trim().length === 0) {
        throw new Error('Text cannot be empty');
      }

      if (request.text.length > 10000) {
        throw new Error('Text exceeds maximum length of 10000 characters');
      }

      // Verificar cache (se disponível)
      const cacheKey = `text_analysis:${Buffer.from(request.text).toString('base64').slice(0, 32)}`;
      
      if (this.cache) {
        try {
          const cached = await this.cache.get?.(cacheKey);
          if (cached) {
            this.logger?.info('Returning cached text analysis result');
            return EmotionalAnalysisEntity.fromTextAnalysis(
              request.text,
              Date.now() - startTime.getTime()
            );
          }
        } catch (error) {
          this.logger?.warn('Cache error during text analysis', { error });
        }
      }

      // Realizar análise
      const entity = EmotionalAnalysisEntity.fromTextAnalysis(
        request.text,
        Date.now() - startTime.getTime()
      );

      // Salvar no cache (se disponível)
      if (this.cache) {
        try {
          await this.cache.set?.(cacheKey, entity.toJSON(), 300); // 5 minutos
        } catch (error) {
          this.logger?.warn('Failed to cache text analysis result', { error });
        }
      }

      const metrics = ProcessingMetrics.create(startTime, request.text.length);
      
      this.logger?.info('Text analysis completed', {
        dominantAffect: entity.dominantAffect,
        intensity: entity.intensity,
        confidence: entity.confidence,
        metrics: metrics.toJSON()
      });

      return entity;
    } catch (error) {
      this.logger?.error('Text analysis failed', { 
        error: error.message,
        textLength: request.text?.length
      });
      throw error;
    }
  }

  async analyzeBehavior(request: IBehavioralAnalysisRequest): Promise<EmotionalAnalysisEntity> {
    const startTime = new Date();
    
    try {
      this.logger?.info('Starting behavioral analysis', {
        sessionDuration: request.sessionDuration,
        userId: request.userId,
        timestamp: startTime.toISOString()
      });

      // Validação de entrada
      this.validateBehavioralRequest(request);

      // Verificar cache (se disponível)
      const cacheKey = `behavioral_analysis:${request.userId || 'anonymous'}:${request.sessionDuration}`;
      
      if (this.cache) {
        try {
          const cached = await this.cache.get?.(cacheKey);
          if (cached) {
            this.logger?.info('Returning cached behavioral analysis result');
            return EmotionalAnalysisEntity.fromBehavioralData(
              request.emotionalState,
              request.mousePosition,
              request.sessionDuration,
              Date.now() - startTime.getTime()
            );
          }
        } catch (error) {
          this.logger?.warn('Cache error during behavioral analysis', { error });
        }
      }

      // Realizar análise
      const entity = EmotionalAnalysisEntity.fromBehavioralData(
        request.emotionalState,
        request.mousePosition,
        request.sessionDuration,
        Date.now() - startTime.getTime()
      );

      // Salvar no cache (se disponível)
      if (this.cache) {
        try {
          await this.cache.set?.(cacheKey, entity.toJSON(), 60); // 1 minuto para behavioral
        } catch (error) {
          this.logger?.warn('Failed to cache behavioral analysis result', { error });
        }
      }

      const requestSize = JSON.stringify(request).length;
      const metrics = ProcessingMetrics.create(startTime, requestSize);
      
      this.logger?.info('Behavioral analysis completed', {
        dominantAffect: entity.dominantAffect,
        intensity: entity.intensity,
        confidence: entity.confidence,
        sessionDuration: request.sessionDuration,
        metrics: metrics.toJSON()
      });

      return entity;
    } catch (error) {
      this.logger?.error('Behavioral analysis failed', { 
        error: error.message,
        sessionDuration: request.sessionDuration,
        userId: request.userId
      });
      throw error;
    }
  }

  private validateBehavioralRequest(request: IBehavioralAnalysisRequest): void {
    if (!request.emotionalState) {
      throw new Error('Emotional state is required');
    }

    if (!request.mousePosition) {
      throw new Error('Mouse position is required');
    }

    if (typeof request.sessionDuration !== 'number' || request.sessionDuration < 0) {
      throw new Error('Session duration must be a non-negative number');
    }

    if (request.sessionDuration > 86400000) { // 24 horas
      throw new Error('Session duration cannot exceed 24 hours');
    }

    const { morphogeneticField, resonancePatterns, quantumCoherence } = request.emotionalState;

    if (typeof morphogeneticField !== 'number' || morphogeneticField < 0 || morphogeneticField > 1) {
      throw new Error('Morphogenetic field must be a number between 0 and 1');
    }

    if (!Array.isArray(resonancePatterns) || resonancePatterns.length < 3 || resonancePatterns.length > 10) {
      throw new Error('Resonance patterns must be an array with 3-10 elements');
    }

    if (resonancePatterns.some(p => typeof p !== 'number' || p < 0 || p > 1)) {
      throw new Error('All resonance patterns must be numbers between 0 and 1');
    }

    if (typeof quantumCoherence !== 'number' || quantumCoherence < 0 || quantumCoherence > 1) {
      throw new Error('Quantum coherence must be a number between 0 and 1');
    }
  }
}
