/**
 * Health DTOs - Contratos versionados v1
 * IMPLEMENTADO: Validação runtime com Zod
 */

import { z } from 'zod';

// ============================================
// HEALTH REQUEST DTOS
// ============================================

// Health endpoints não requerem body, apenas validação de headers/query
export const HealthQuerySchema = z.object({
  verbose: z.string().optional().transform(val => val === 'true')
}).optional();

export type HealthQueryDto = z.infer<typeof HealthQuerySchema>;

// ============================================
// HEALTH RESPONSE DTOS  
// ============================================

export const LivenessResponseSchema = z.object({
  status: z.literal('alive'),
  timestamp: z.string().datetime(),
});

export const ReadinessResponseSchema = z.object({
  status: z.enum(['ready', 'not_ready']),
  ready: z.boolean(),
  timestamp: z.string().datetime(),
  services: z.array(z.object({
    name: z.string(),
    status: z.enum(['healthy', 'unhealthy', 'unknown']),
    lastCheck: z.string().datetime().optional()
  })).optional()
});

export const SystemStatusResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string().datetime(),
  version: z.string().optional(),
  uptime: z.number().min(0).optional(),
  environment: z.enum(['development', 'staging', 'production']).optional(),
  services: z.record(z.string()).optional()
});

// Tipos inferidos
export type LivenessResponseDto = z.infer<typeof LivenessResponseSchema>;
export type ReadinessResponseDto = z.infer<typeof ReadinessResponseSchema>;
export type SystemStatusResponseDto = z.infer<typeof SystemStatusResponseSchema>;

// ============================================
// ERROR RESPONSE DTO
// ============================================

export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  timestamp: z.string().datetime(),
  code: z.string().optional(),
  details: z.record(z.any()).optional()
});

export type ErrorResponseDto = z.infer<typeof ErrorResponseSchema>;
