/**
 * TRILHO B AÇÃO 5 - Testes unitários para ClaudeResponseMapper
 * 
 * Testes abrangentes para validar mapeamento real de respostas Claude API
 */

import { ClaudeResponseMapper, ClaudeApiResponse, MappingResult } from '../mappers/ClaudeResponseMapper';

describe('ClaudeResponseMapper', () => {
  describe('mapToEmotionalResponse', () => {
    it('should parse valid JSON response correctly', () => {
      const claudeResponse: ClaudeApiResponse = {
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: JSON.stringify({
            intensity: 0.8,
            confidence: 0.9,
            recommendation: 'continue',
            emotionalShift: 'positive',
            morphogenicSuggestion: 'spiral'
          })
        }],
        model: 'claude-3-5-sonnet-latest',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: {
          input_tokens: 50,
          output_tokens: 30
        }
      };

      const result = ClaudeResponseMapper.mapToEmotionalResponse(claudeResponse);

      expect(result.success).toBe(true);
      expect(result.response.intensity).toBe(0.8);
      expect(result.response.confidence).toBe(0.9);
      expect(result.response.recommendation).toBe('continue');
      expect(result.response.emotionalShift).toBe('positive');
      expect(result.response.morphogenicSuggestion).toBe('spiral');
      expect(result.metadata.parseMethod).toBe('json');
      expect(result.metadata.tokensUsed).toBe(30);
    });

    it('should parse natural language response using NLP', () => {
      const claudeResponse: ClaudeApiResponse = {
        id: 'msg_124',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: 'O usuário demonstra uma emoção muito intensa e positiva. Recomendo continuar com esta abordagem. A mudança emocional é claramente positiva e sugiro um padrão espiral para a visualização.'
        }],
        model: 'claude-3-5-sonnet-latest',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: {
          input_tokens: 45,
          output_tokens: 35
        }
      };

      const result = ClaudeResponseMapper.mapToEmotionalResponse(claudeResponse, 'Estou muito feliz hoje!');

      expect(result.success).toBe(true);
      expect(result.response.intensity).toBeGreaterThan(0.5);
      expect(result.response.recommendation).toBe('continue');
      expect(result.response.emotionalShift).toBe('positive');
      expect(result.response.morphogenicSuggestion).toBe('spiral');
      expect(result.metadata.parseMethod).toBe('nlp');
    });

    it('should handle malformed JSON gracefully', () => {
      const claudeResponse: ClaudeApiResponse = {
        id: 'msg_125',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: '{ "intensity": 0.8, "invalid_json": }'
        }],
        model: 'claude-3-5-sonnet-latest',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: {
          input_tokens: 40,
          output_tokens: 20
        }
      };

      const result = ClaudeResponseMapper.mapToEmotionalResponse(claudeResponse);

      expect(result.success).toBe(true); // Should fallback gracefully
      expect(result.response.intensity).toBeDefined();
      expect(result.response.confidence).toBeDefined();
      expect(result.metadata.warnings.length).toBeGreaterThan(0);
    });

    it('should validate and sanitize invalid values', () => {
      const claudeResponse: ClaudeApiResponse = {
        id: 'msg_126',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: JSON.stringify({
            intensity: 2.5, // Invalid range
            confidence: -0.3, // Invalid range
            recommendation: 'invalid_recommendation',
            emotionalShift: 'unknown_shift',
            morphogenicSuggestion: 'invalid_pattern'
          })
        }],
        model: 'claude-3-5-sonnet-latest',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: {
          input_tokens: 40,
          output_tokens: 25
        }
      };

      const result = ClaudeResponseMapper.mapToEmotionalResponse(claudeResponse);

      expect(result.success).toBe(true);
      expect(result.response.intensity).toBe(0.5); // Sanitized to default
      expect(result.response.confidence).toBe(0.7); // Sanitized to default
      expect(result.response.recommendation).toBe('continue'); // Sanitized to default
      expect(result.response.emotionalShift).toBe('stable'); // Sanitized to default
      expect(result.response.morphogenicSuggestion).toBe('organic'); // Sanitized to default
      expect(result.metadata.warnings.length).toBeGreaterThan(0);
    });

    it('should handle empty response', () => {
      const claudeResponse: ClaudeApiResponse = {
        id: 'msg_127',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: ''
        }],
        model: 'claude-3-5-sonnet-latest',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: {
          input_tokens: 30,
          output_tokens: 0
        }
      };

      const result = ClaudeResponseMapper.mapToEmotionalResponse(claudeResponse);

      expect(result.success).toBe(false);
      expect(result.response.intensity).toBe(0.5);
      expect(result.response.confidence).toBe(0.3);
      expect(result.metadata.parseMethod).toBe('fallback');
      expect(result.metadata.warnings).toContain('Empty response text from Claude');
    });

    it('should extract intensity from emotional keywords', () => {
      const claudeResponse: ClaudeApiResponse = {
        id: 'msg_128',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: 'O usuário está extremamente feliz e eufórico! A intensidade emocional é muito alta.'
        }],
        model: 'claude-3-5-sonnet-latest',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: {
          input_tokens: 35,
          output_tokens: 25
        }
      };

      const result = ClaudeResponseMapper.mapToEmotionalResponse(claudeResponse);

      expect(result.success).toBe(true);
      expect(result.response.intensity).toBeGreaterThan(0.7);
      expect(result.metadata.parseMethod).toBe('nlp');
    });

    it('should handle mixed JSON and text response', () => {
      const claudeResponse: ClaudeApiResponse = {
        id: 'msg_129',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: 'Baseado na análise, aqui está o resultado: {"intensity": 0.75, "confidence": 0.85, "recommendation": "continue"} - Esta análise indica um estado emocional positivo.'
        }],
        model: 'claude-3-5-sonnet-latest',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: {
          input_tokens: 40,
          output_tokens: 35
        }
      };

      const result = ClaudeResponseMapper.mapToEmotionalResponse(claudeResponse);

      expect(result.success).toBe(true);
      expect(result.response.intensity).toBe(0.75);
      expect(result.response.confidence).toBe(0.85);
      expect(result.response.recommendation).toBe('continue');
      expect(result.metadata.parseMethod).toBe('json');
    });

    it('should measure processing time accurately', () => {
      const claudeResponse: ClaudeApiResponse = {
        id: 'msg_130',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: '{"intensity": 0.6}'
        }],
        model: 'claude-3-5-sonnet-latest',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: {
          input_tokens: 30,
          output_tokens: 15
        }
      };

      const result = ClaudeResponseMapper.mapToEmotionalResponse(claudeResponse);

      expect(result.success).toBe(true);
      expect(result.metadata.processingTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.metadata.processingTimeMs).toBeLessThan(1000); // Should be fast
    });

    it('should provide meaningful metadata', () => {
      const claudeResponse: ClaudeApiResponse = {
        id: 'msg_131',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: '{"intensity": 0.7, "confidence": 0.8}'
        }],
        model: 'claude-3-5-sonnet-latest',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: {
          input_tokens: 25,
          output_tokens: 20
        }
      };

      const result = ClaudeResponseMapper.mapToEmotionalResponse(claudeResponse);

      expect(result.metadata).toHaveProperty('parseMethod');
      expect(result.metadata).toHaveProperty('confidence');
      expect(result.metadata).toHaveProperty('tokensUsed');
      expect(result.metadata).toHaveProperty('processingTimeMs');
      expect(result.metadata).toHaveProperty('warnings');
      expect(Array.isArray(result.metadata.warnings)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle response with no content array', () => {
      const claudeResponse = {
        id: 'msg_132',
        type: 'message',
        role: 'assistant',
        content: [],
        model: 'claude-3-5-sonnet-latest',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 20, output_tokens: 0 }
      } as ClaudeApiResponse;

      const result = ClaudeResponseMapper.mapToEmotionalResponse(claudeResponse);

      expect(result.success).toBe(false);
      expect(result.metadata.parseMethod).toBe('fallback');
    });

    it('should handle response with null content', () => {
      const claudeResponse = {
        id: 'msg_133',
        type: 'message',
        role: 'assistant',
        content: null,
        model: 'claude-3-5-sonnet-latest',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 20, output_tokens: 0 }
      } as any;

      const result = ClaudeResponseMapper.mapToEmotionalResponse(claudeResponse);

      expect(result.success).toBe(false);
      expect(result.metadata.parseMethod).toBe('fallback');
    });
  });
});
