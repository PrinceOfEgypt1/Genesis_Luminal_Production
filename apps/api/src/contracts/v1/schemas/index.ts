/**
 * Índice de schemas para validação
 * IMPLEMENTADO: Exportação centralizada de todos os schemas v1
 */

// Health schemas
export {
  HealthQuerySchema,
  LivenessResponseSchema,
  ReadinessResponseSchema,
  SystemStatusResponseSchema,
  ErrorResponseSchema
} from '../dtos/health.dto';

export type {
  HealthQueryDto,
  LivenessResponseDto,
  ReadinessResponseDto,
  SystemStatusResponseDto,
  ErrorResponseDto
} from '../dtos/health.dto';

// Emotional schemas
export {
  TextAnalysisRequestSchema,
  BehavioralAnalysisRequestSchema,
  EmotionalAnalysisRequestSchema,
  EmotionalAnalysisResponseSchema,
  EmotionalStateSchema,
  MousePositionSchema
} from '../dtos/emotional.dto';

export type {
  TextAnalysisRequestDto,
  BehavioralAnalysisRequestDto,
  EmotionalAnalysisRequestDto,
  EmotionalAnalysisResponseDto,
  EmotionalStateDto,
  MousePositionDto
} from '../dtos/emotional.dto';
