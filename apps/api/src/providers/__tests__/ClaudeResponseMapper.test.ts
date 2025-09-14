/**
 * Testes para ClaudeResponseMapper (VERSÃO CORRIGIDA)
 * Validação completa de mapeamento real Claude API → EmotionalResponse
 * 
 * CORREÇÕES APLICADAS:
 * - Imports locais para evitar quebras
 * - Teste de warnings corrigido
 * - Verificação de comportamento real
 */

import { ClaudeResponseMapper, type ClaudeApiResponse, type MappingResult } from '../mappers/ClaudeResponseMapper';

describe('ClaudeResponseMapper', () => {
  describe('mapToEmotionalResponse', () => {
    it('should parse valid JSON response correctly', () => {
      const mockResponse: ClaudeApiResponse = {
        id: 'test-id',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: '{"intensity": 0.8, "confidence": 0.9, "recommendation": "continue"}'
        }],
        model: 'claude-3-sonnet',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 20, output_tokens: 30 }
      };

      const result: MappingResult = ClaudeResponseMapper.mapToEmotionalResponse(mockResponse);

      expect(result.response.success).toBe(true);
      expect(result.response.intensity).toBe(0.8);
      expect(result.response.confidence).toBe(0.9);
      expect(result.response.recommendation).toBe('continue');
      expect(result.metadata.parseMethod).toBe('json');
      expect(result.metadata.tokensUsed).toBe(30);
    });

    it('should parse natural language response using NLP', () => {
      const mockResponse: ClaudeApiResponse = {
        id: 'test-id',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: 'O usuário demonstra alta curiosidade e alegria. Recomendo continuar a exploração.'
        }],
        model: 'claude-3-sonnet',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 25, output_tokens: 35 }
      };

      const result: MappingResult = ClaudeResponseMapper.mapToEmotionalResponse(mockResponse);

      expect(result.response.success).toBe(true);
      expect(result.response.intensity).toBeDefined();
      expect(result.response.confidence).toBeDefined();
      expect(result.metadata.parseMethod).toBe('nlp');
      expect(result.metadata.tokensUsed).toBe(35);
    });

    it('should handle malformed JSON gracefully', () => {
      const mockResponse: ClaudeApiResponse = {
        id: 'test-id',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: '{"intensity": 0.7, "confidence": INVALID_JSON, "recommendation":'
        }],
        model: 'claude-3-sonnet',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 15, output_tokens: 20 }
      };

      const result: MappingResult = ClaudeResponseMapper.mapToEmotionalResponse(mockResponse);

      expect(result.response.success).toBe(true);
      expect(result.response.intensity).toBeDefined();
      expect(result.response.confidence).toBeDefined();
      expect(result.metadata.parseMethod).toBe('nlp');
      // JSON malformado vai para NLP, que não gera warnings por si só
      expect(result.metadata.warnings.length).toBe(0);
    });

    it('should validate and sanitize invalid values with warnings', () => {
      const mockResponse: ClaudeApiResponse = {
        id: 'test-id',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: JSON.stringify({
            intensity: 2.5, // Inválido: > 1
            confidence: -0.3, // Inválido: < 0
            recommendation: 'invalid_recommendation', // Inválido
            emotionalShift: 'unknown_shift', // Inválido
            morphogenicSuggestion: 'invalid_pattern' // Inválido
          })
        }],
        model: 'claude-3-sonnet',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 20, output_tokens: 25 }
      };

      const result: MappingResult = ClaudeResponseMapper.mapToEmotionalResponse(mockResponse);

      expect(result.response.success).toBe(true);
      expect(result.response.intensity).toBe(0.5); // Clamped de 2.5
      expect(result.response.confidence).toBe(0.7); // Clamped de -0.3
      expect(result.response.recommendation).toBe('continue'); // Default
      expect(result.response.emotionalShift).toBe('stable'); // Default
      expect(result.response.morphogenicSuggestion).toBe('organic'); // Default
      // AGORA deve ter warnings porque há validação com valores inválidos
      expect(result.metadata.warnings.length).toBeGreaterThan(0);
    });

    it('should handle empty response', () => {
      const mockResponse: ClaudeApiResponse = {
        id: 'test-id',
        type: 'message',
        role: 'assistant',
        content: [],
        model: 'claude-3-sonnet',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 10, output_tokens: 15 }
      };

      const result: MappingResult = ClaudeResponseMapper.mapToEmotionalResponse(mockResponse);

      expect(result.response.success).toBe(true);
      expect(result.response.intensity).toBe(0.5);
      expect(result.response.confidence).toBe(0.5);
      expect(result.metadata.parseMethod).toBe('fallback');
      expect(result.metadata.warnings).toContain('Using fallback response due to parsing failure');
    });

    it('should extract intensity from emotional keywords', () => {
      const mockResponse: ClaudeApiResponse = {
        id: 'test-id',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: 'O usuário demonstra intensa alegria e curiosidade, com muita euforia e prazer na experiência.'
        }],
        model: 'claude-3-sonnet',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 25, output_tokens: 35 }
      };

      const result: MappingResult = ClaudeResponseMapper.mapToEmotionalResponse(mockResponse);

      expect(result.response.success).toBe(true);
      expect(result.response.intensity).toBeGreaterThan(0.5);
      expect(result.metadata.parseMethod).toBe('nlp');
    });

    it('should handle mixed JSON and text response', () => {
      const mockResponse: ClaudeApiResponse = {
        id: 'test-id',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: '```json\n{"intensity": 0.75, "confidence": 0.85, "recommendation": "explore"}\n```'
        }],
        model: 'claude-3-sonnet',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 30, output_tokens: 35 }
      };

      const result: MappingResult = ClaudeResponseMapper.mapToEmotionalResponse(mockResponse);

      expect(result.response.success).toBe(true);
      expect(result.response.intensity).toBe(0.75);
      expect(result.response.confidence).toBe(0.85);
      expect(result.response.recommendation).toBe('explore');
      expect(result.metadata.parseMethod).toBe('json');
    });

    it('should measure processing time accurately', () => {
      const mockResponse: ClaudeApiResponse = {
        id: 'test-id',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: '{"intensity": 0.7, "confidence": 0.8}' }],
        model: 'claude-3-sonnet',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 15, output_tokens: 20 }
      };

      const result: MappingResult = ClaudeResponseMapper.mapToEmotionalResponse(mockResponse);

      expect(result.metadata.processingTimeMs).toBeGreaterThanOrEqual(0);
      expect(typeof result.metadata.processingTimeMs).toBe('number');
      expect(result.metadata.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should provide meaningful metadata', () => {
      const mockResponse: ClaudeApiResponse = {
        id: 'test-id',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: '{"intensity": 0.8, "confidence": 0.7}' }],
        model: 'claude-3-sonnet',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 18, output_tokens: 20 }
      };

      const result: MappingResult = ClaudeResponseMapper.mapToEmotionalResponse(mockResponse);

      expect(result.metadata).toHaveProperty('processingTimeMs');
      expect(result.metadata).toHaveProperty('parseMethod');
      expect(result.metadata).toHaveProperty('tokensUsed');
      expect(result.metadata).toHaveProperty('warnings');
      expect(result.metadata).toHaveProperty('timestamp');
      expect(Array.isArray(result.metadata.warnings)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle response with no content array', () => {
      const mockResponse = {
        id: 'test-id',
        type: 'message',
        role: 'assistant',
        content: null,
        model: 'claude-3-sonnet',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 10, output_tokens: 0 }
      } as unknown as ClaudeApiResponse;

      const result: MappingResult = ClaudeResponseMapper.mapToEmotionalResponse(mockResponse);

      expect(result.response.success).toBe(true);
      expect(result.metadata.parseMethod).toBe('fallback');
      expect(result.metadata.warnings).toContain('Using fallback response due to parsing failure');
    });

    it('should handle response with null content', () => {
      const mockResponse: ClaudeApiResponse = {
        id: 'test-id',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: '' }],
        model: 'claude-3-sonnet',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 10, output_tokens: 0 }
      };

      const result: MappingResult = ClaudeResponseMapper.mapToEmotionalResponse(mockResponse);

      expect(result.response.success).toBe(true);
      expect(result.metadata.parseMethod).toBe('fallback');
    });
  });
});
