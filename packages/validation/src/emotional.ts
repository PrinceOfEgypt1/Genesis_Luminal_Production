/**
 * Schemas de validação Zod para alinhamento de contratos API
 * CORREÇÃO: Alinhar shared types com implementação real do backend
 */
import { z } from 'zod';

// Validação para EmotionalDNA
export const EmotionalDNASchema = z.object({
  joy: z.number().min(0).max(1),
  nostalgia: z.number().min(0).max(1),
  curiosity: z.number().min(0).max(1),
  serenity: z.number().min(0).max(1),
  ecstasy: z.number().min(0).max(1),
  mystery: z.number().min(0).max(1),
  power: z.number().min(0).max(1),
});

// Validação para Vector2D
export const Vector2DSchema = z.object({
  x: z.number(),
  y: z.number(),
});

// ✅ CORREÇÃO: Request que aceita TANTO formato completo QUANTO apenas text
export const EmotionalAnalysisRequestSchema = z.union([
  // Formato completo (shared types)
  z.object({
    currentState: EmotionalDNASchema,
    mousePosition: Vector2DSchema,
    sessionDuration: z.number().min(0),
    userId: z.string().optional(),
  }),
  // Formato simplificado (implementação backend atual)
  z.object({
    text: z.string().min(1)
  })
]);

// Validação para Response
export const EmotionalAnalysisResponseSchema = z.object({
  intensity: z.number().min(0).max(1),
  dominantAffect: z.string(),
  timestamp: z.string(),
  confidence: z.number().min(0).max(1),
  recommendation: z.string(),
  emotionalShift: z.string(),
  morphogenicSuggestion: z.string(),
});

// Exportar tipos
export type EmotionalDNA = z.infer<typeof EmotionalDNASchema>;
export type Vector2D = z.infer<typeof Vector2DSchema>;
export type EmotionalAnalysisRequest = z.infer<typeof EmotionalAnalysisRequestSchema>;
export type EmotionalAnalysisResponse = z.infer<typeof EmotionalAnalysisResponseSchema>;
