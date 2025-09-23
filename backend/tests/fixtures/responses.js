/**
 * @fileoverview Fixtures de resposta para testes - Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 * @description Dados mock para testes unitários e integração
 */

module.exports = {
  // Health check response
  healthResponse: {
    status: 'healthy',
    timestamp: '2025-09-23T10:00:00.000Z',
    service: 'genesis-luminal',
    version: '1.0.0'
  },
  
  // Emotion analysis response
  emotionResponse: {
    emotionalDNA: {
      joy: 0.8,
      sadness: 0.1,
      anger: 0.05,
      fear: 0.02,
      surprise: 0.02,
      disgust: 0.01,
      neutral: 0.0
    },
    confidence: 0.92,
    timestamp: '2025-09-23T10:00:00.000Z',
    processingTime: 150
  },
  
  // Error responses
  errorResponses: {
    validation: {
      error: 'Validation Error',
      message: 'Invalid input parameters',
      code: 'VALIDATION_ERROR',
      timestamp: '2025-09-23T10:00:00.000Z'
    },
    
    internal: {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      timestamp: '2025-09-23T10:00:00.000Z'
    },
    
    notFound: {
      error: 'Not Found',
      message: 'The requested resource was not found',
      code: 'NOT_FOUND',
      timestamp: '2025-09-23T10:00:00.000Z'
    }
  }
};
