/**
 * Emotional Analysis DTOs - Contratos versionados v1
 * IMPLEMENTADO: Validação runtime rigorosa com Zod
 */

import { z } from 'zod';

// ============================================
// EMOTIONAL REQUEST DTOS
// ============================================

// Text Analysis Request
export const TextAnalysisRequestSchema = z.object({
  text: z.string()
    .min(1, 'Texto não pode estar vazio')
    .max(10000, 'Texto excede limite máximo de 10000 caracteres')
    .trim()
});

// Emotional State para análise comportamental
export const EmotionalStateSchema = z.object({
  morphogeneticField: z.number()
    .min(0, 'morphogeneticField deve ser >= 0')
    .max(1, 'morphogeneticField deve ser <= 1'),
  resonancePatterns: z.array(z.number().min(0).max(1))
    .min(3, 'Mínimo 3 padrões de ressonância')
    .max(10, 'Máximo 10 padrões de ressonância'),
  quantumCoherence: z.number()
    .min(0, 'quantumCoherence deve ser >= 0')
    .max(1, 'quantumCoherence deve ser <= 1')
});

// Mouse Position
export const MousePositionSchema = z.object({
  x: z.number().int('Coordenada X deve ser inteira'),
  y: z.number().int('Coordenada Y deve ser inteira')
});

// Behavioral Analysis Request
export const BehavioralAnalysisRequestSchema = z.object({
  emotionalState: EmotionalStateSchema,
  mousePosition: MousePositionSchema,
  sessionDuration: z.number()
    .int('Duração da sessão deve ser inteira')
    .min(0, 'Duração da sessão deve ser >= 0')
    .max(86400000, 'Duração da sessão não pode exceder 24h'), // 24h em ms
  userId: z.string().optional()
});

// Union type para requests de análise emocional
export const EmotionalAnalysisRequestSchema = z.union([
  TextAnalysisRequestSchema,
  BehavioralAnalysisRequestSchema
]);

// ============================================
// EMOTIONAL RESPONSE DTOS
// ============================================

export const EmotionalAnalysisResponseSchema = z.object({
  intensity: z.number()
    .min(0, 'Intensidade deve ser >= 0')
    .max(1, 'Intensidade deve ser <= 1'),
  dominantAffect: z.enum([
    'joy', 'curiosity', 'wonder', 'calm', 'excitement', 
    'contemplation', 'awe', 'neutral', 'sadness', 'anxiety'
  ]),
  timestamp: z.string().datetime(),
  confidence: z.number()
    .min(0, 'Confiança deve ser >= 0')
    .max(1, 'Confiança deve ser <= 1'),
  recommendation: z.enum([
    'enhance_positive', 'stabilize', 'explore_deeper', 
    'continue', 'system_error', 'seek_support'
  ]),
  emotionalShift: z.enum([
    'positive', 'negative', 'stable', 'escalating', 'unknown'
  ]),
  morphogenicSuggestion: z.enum([
    'fibonacci', 'spiral', 'wave', 'particle', 
    'crystalline', 'organic', 'chaotic', 'harmonic'
  ]),
  metadata: z.object({
    processingTimeMs: z.number().min(0),
    source: z.enum(['text', 'behavioral', 'hybrid']),
    version: z.string().default('v1')
  }).optional()
});

// Tipos inferidos para TypeScript
export type TextAnalysisRequestDto = z.infer<typeof TextAnalysisRequestSchema>;
export type BehavioralAnalysisRequestDto = z.infer<typeof BehavioralAnalysisRequestSchema>;
export type EmotionalAnalysisRequestDto = z.infer<typeof EmotionalAnalysisRequestSchema>;
export type EmotionalAnalysisResponseDto = z.infer<typeof EmotionalAnalysisResponseSchema>;
export type EmotionalStateDto = z.infer<typeof EmotionalStateSchema>;
export type MousePositionDto = z.infer<typeof MousePositionSchema>;
