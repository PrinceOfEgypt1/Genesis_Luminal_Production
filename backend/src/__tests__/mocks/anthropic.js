/**
 * @fileoverview Mocks para Anthropic API
 * @version 1.0.0
 * @author Genesis Luminal Team
 */
export const mockAnthropicResponse = {
    id: 'msg_test123',
    type: 'message',
    role: 'assistant',
    content: [
        {
            type: 'text',
            text: JSON.stringify({
                intensity: 0.8,
                dominantAffect: 'joy',
                confidence: 0.9,
                analysis: 'Positive emotional content detected',
            }),
        },
    ],
    model: 'claude-3-sonnet-20240229',
    stop_reason: 'end_turn',
    stop_sequence: null,
    usage: {
        input_tokens: 20,
        output_tokens: 50,
    },
};
export const createMockAnthropicClient = () => ({
    messages: {
        create: jest.fn().mockResolvedValue(mockAnthropicResponse),
    },
});
export const mockEmotionAnalysisResult = {
    intensity: 0.75,
    dominantAffect: 'joy',
    confidence: 0.85,
    timestamp: new Date(),
    metadata: {
        model: 'claude-3-sonnet',
        processingTime: 150,
        version: '1.0.0',
    },
};
