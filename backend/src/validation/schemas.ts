/**
 * @fileoverview Validation schemas with Zod
 * @version 1.0.0
 */

import { z } from 'zod';

// Request validation schemas
export const EmotionAnalysisRequestSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty').max(5000, 'Text too long'),
  userId: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  currentState: z.string().optional()
});

export const HealthCheckRequestSchema = z.object({
  detailed: z.boolean().optional(),
  component: z.string().optional()
});

export const MetricsRequestSchema = z.object({
  format: z.enum(['json', 'prometheus']).optional(),
  filter: z.string().optional()
});

// Response validation schemas
export const EmotionAnalysisResponseSchema = z.object({
  dominant: z.string(),
  intensity: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  processingTime: z.number().optional(),
  timestamp: z.string().optional(),
  recommendation: z.string().optional(),
  dominantAffect: z.string().optional(),
  emotionalShift: z.string().optional(),
  morphogenicSuggestion: z.string().optional()
});

// Input sanitization schemas
export const SanitizedTextSchema = z.string()
  .transform(str => str.trim())
  .refine(str => str.length > 0, 'Text cannot be empty after sanitization')
  .transform(str => str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''))
  .transform(str => str.replace(/javascript:/gi, ''))
  .transform(str => str.replace(/on\w+\s*=/gi, ''));

export const SanitizedUserIdSchema = z.string()
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid user ID format')
  .max(50, 'User ID too long');

// Type exports
export type EmotionAnalysisRequest = z.infer<typeof EmotionAnalysisRequestSchema>;
export type EmotionAnalysisResponse = z.infer<typeof EmotionAnalysisResponseSchema>;
export type HealthCheckRequest = z.infer<typeof HealthCheckRequestSchema>;
export type MetricsRequest = z.infer<typeof MetricsRequestSchema>;
