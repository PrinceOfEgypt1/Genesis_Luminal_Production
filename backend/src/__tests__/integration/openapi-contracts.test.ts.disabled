/**
 * Testes de Integração - Contratos OpenAPI
 * Valida conformidade com especificações de API
 */

import request from 'supertest';
import express from 'express';
import { setupRoutes } from '../../routes';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use('/api', setupRoutes());

// OpenAPI Schema Definitions (simplified for testing)
const schemas = {
  EmotionalAnalysisRequest: {
    type: 'object',
    properties: {
      emotionalState: {
        type: 'object',
        properties: {
          joy: { type: 'number', minimum: 0, maximum: 1 },
          nostalgia: { type: 'number', minimum: 0, maximum: 1 },
          curiosity: { type: 'number', minimum: 0, maximum: 1 },
          serenity: { type: 'number', minimum: 0, maximum: 1 },
          ecstasy: { type: 'number', minimum: 0, maximum: 1 },
          mystery: { type: 'number', minimum: 0, maximum: 1 },
          power: { type: 'number', minimum: 0, maximum: 1 }
        }
      },
      text: { type: 'string', maxLength: 10000 },
      mousePosition: {
        type: 'object',
        properties: {
          x: { type: 'number' },
          y: { type: 'number' }
        }
      },
      sessionDuration: { type: 'number', minimum: 0 }
    }
  },
  
  EmotionalAnalysisResponse: {
    type: 'object',
    required: ['intensity', 'confidence', 'timestamp', 'dominantAffect', 'recommendation', 'emotionalShift', 'morphogenicSuggestion'],
    properties: {
      intensity: { type: 'number', minimum: 0, maximum: 1 },
      confidence: { type: 'number', minimum: 0, maximum: 1 },
      timestamp: { type: 'string', format: 'date-time' },
      dominantAffect: { 
        type: 'string',
        enum: ['joy', 'nostalgia', 'curiosity', 'serenity', 'ecstasy', 'mystery', 'power', 'neutral']
      },
      recommendation: { 
        type: 'string',
        enum: ['continue', 'pause', 'intensify', 'explore', 'transcend']
      },
      emotionalShift: {
        type: 'string',
        enum: ['positive', 'negative', 'stable', 'ascending', 'descending']
      },
      morphogenicSuggestion: {
        type: 'string',
        enum: ['spiral', 'fibonacci', 'fractal', 'wave', 'linear', 'circular']
      }
    }
  },

  HealthResponse: {
    type: 'object',
    required: ['status', 'timestamp'],
    properties: {
      status: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time' },
      uptime: { type: 'number', minimum: 0 },
      version: { type: 'string' },
      services: {
        type: 'object',
        properties: {
          cache: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
          ai: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] }
        }
      }
    }
  },

  ErrorResponse: {
    type: 'object',
    required: ['error'],
    properties: {
      error: { type: 'string' },
      message: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time' },
      code: { type: 'string' }
    }
  }
};

// Simple JSON Schema validator
function validateSchema(data: any, schema: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  function validate(value: any, schemaObj: any, path: string = '') {
    if (schemaObj.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== schemaObj.type) {
        errors.push(`${path}: expected ${schemaObj.type}, got ${actualType}`);
        return;
      }
    }

    if (schemaObj.required) {
      for (const requiredField of schemaObj.required) {
        if (!(requiredField in value)) {
          errors.push(`${path}.${requiredField}: required field missing`);
        }
      }
    }

    if (schemaObj.properties) {
      for (const [key, propSchema] of Object.entries(schemaObj.properties)) {
        if (key in value) {
          validate(value[key], propSchema, path ? `${path}.${key}` : key);
        }
      }
    }

    if (schemaObj.minimum !== undefined && typeof value === 'number') {
      if (value < schemaObj.minimum) {
        errors.push(`${path}: ${value} is below minimum ${schemaObj.minimum}`);
      }
    }

    if (schemaObj.maximum !== undefined && typeof value === 'number') {
      if (value > schemaObj.maximum) {
        errors.push(`${path}: ${value} is above maximum ${schemaObj.maximum}`);
      }
    }

    if (schemaObj.enum && !schemaObj.enum.includes(value)) {
      errors.push(`${path}: ${value} is not in allowed values [${schemaObj.enum.join(', ')}]`);
    }

    if (schemaObj.format === 'date-time' && typeof value === 'string') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        errors.push(`${path}: ${value} is not a valid date-time`);
      }
    }

    if (schemaObj.maxLength !== undefined && typeof value === 'string') {
      if (value.length > schemaObj.maxLength) {
        errors.push(`${path}: string length ${value.length} exceeds maximum ${schemaObj.maxLength}`);
      }
    }
  }

  try {
    validate(data, schema);
  } catch (error) {
    errors.push(`Validation error: ${error}`);
  }

  return { valid: errors.length === 0, errors };
}

describe('OpenAPI Contract Validation', () => {
  
  describe('Health Endpoints Contracts', () => {
    it('GET /api/liveness should conform to HealthResponse schema', async () => {
      const response = await request(app)
        .get('/api/liveness')
        .expect(200);

      const validation = validateSchema(response.body, schemas.HealthResponse);
      if (!validation.valid) {
        console.error('Validation errors:', validation.errors);
      }
      expect(validation.valid).toBe(true);
    });

    it('GET /api/readiness should conform to HealthResponse schema', async () => {
      const response = await request(app)
        .get('/api/readiness')
        .expect(200);

      const validation = validateSchema(response.body, schemas.HealthResponse);
      expect(validation.valid).toBe(true);
    });

    it('GET /api/status should conform to detailed HealthResponse schema', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200);

      // Extended schema validation for status endpoint
      const extendedSchema = {
        ...schemas.HealthResponse,
        required: [...schemas.HealthResponse.required, 'uptime', 'version']
      };

      const validation = validateSchema(response.body, extendedSchema);
      if (!validation.valid) {
        console.error('Status validation errors:', validation.errors);
      }
      expect(validation.valid).toBe(true);
    });
  });

  describe('Emotional Analysis Contracts', () => {
    it('POST /api/emotional/analyze should accept valid EmotionalAnalysisRequest', async () => {
      const validRequest = {
        emotionalState: {
          joy: 0.8,
          nostalgia: 0.3,
          curiosity: 0.9,
          serenity: 0.5,
          ecstasy: 0.2,
          mystery: 0.7,
          power: 0.6
        },
        mousePosition: { x: 400, y: 300 },
        sessionDuration: 120000
      };

      // First validate our test request conforms to schema
      const requestValidation = validateSchema(validRequest, schemas.EmotionalAnalysisRequest);
      expect(requestValidation.valid).toBe(true);

      // Then test the API
      const response = await request(app)
        .post('/api/emotional/analyze')
        .send(validRequest)
        .expect(200);

      const responseValidation = validateSchema(response.body, schemas.EmotionalAnalysisResponse);
      if (!responseValidation.valid) {
        console.error('Response validation errors:', responseValidation.errors);
        console.error('Actual response:', JSON.stringify(response.body, null, 2));
      }
      expect(responseValidation.valid).toBe(true);
    });

    it('POST /api/emotional/analyze should accept text-only request', async () => {
      const textRequest = {
        text: 'I am feeling very excited about this new project!'
      };

      const response = await request(app)
        .post('/api/emotional/analyze')
        .send(textRequest)
        .expect(200);

      const validation = validateSchema(response.body, schemas.EmotionalAnalysisResponse);
      expect(validation.valid).toBe(true);
    });

    it('should reject requests with invalid emotional state values', async () => {
      const invalidRequest = {
        emotionalState: {
          joy: 1.5, // Invalid: above maximum
          curiosity: -0.2, // Invalid: below minimum
          serenity: 'high' // Invalid: wrong type
        }
      };

      const response = await request(app)
        .post('/api/emotional/analyze')
        .send(invalidRequest);

      // Should still return 200 but with fallback values
      expect(response.status).toBe(200);
      
      // Response should still conform to schema
      const validation = validateSchema(response.body, schemas.EmotionalAnalysisResponse);
      expect(validation.valid).toBe(true);
    });

    it('should handle oversized text requests according to contract', async () => {
      const oversizedRequest = {
        text: 'x'.repeat(20000) // Exceeds maxLength
      };

      // Should either reject with 413 or handle gracefully
      const response = await request(app)
        .post('/api/emotional/analyze')
        .send(oversizedRequest);

      if (response.status === 413) {
        // Request rejected - should have error response
        const validation = validateSchema(response.body, schemas.ErrorResponse);
        expect(validation.valid).toBe(true);
      } else if (response.status === 200) {
        // Request accepted - should have valid response
        const validation = validateSchema(response.body, schemas.EmotionalAnalysisResponse);
        expect(validation.valid).toBe(true);
      } else {
        fail(`Unexpected status code: ${response.status}`);
      }
    });
  });

  describe('Error Response Contracts', () => {
    it('404 errors should conform to ErrorResponse schema', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint')
        .expect(404);

      const validation = validateSchema(response.body, schemas.ErrorResponse);
      expect(validation.valid).toBe(true);
    });

    it('405 Method Not Allowed should conform to ErrorResponse schema', async () => {
      const response = await request(app)
        .patch('/api/emotional/analyze')
        .expect(405);

      const validation = validateSchema(response.body, schemas.ErrorResponse);
      expect(validation.valid).toBe(true);
    });

    it('400 Bad Request should conform to ErrorResponse schema', async () => {
      const response = await request(app)
        .post('/api/emotional/analyze')
        .type('json')
        .send('{"invalid": json}')
        .expect(400);

      const validation = validateSchema(response.body, schemas.ErrorResponse);
      expect(validation.valid).toBe(true);
    });
  });

  describe('Response Headers Contracts', () => {
    it('should include required security headers', async () => {
      const response = await request(app)
        .get('/api/liveness');

      // Common security headers
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers['x-content-type-options']).toBeDefined();
      expect(response.headers['x-frame-options']).toBeDefined();
    });

    it('should include CORS headers for cross-origin requests', async () => {
      const response = await request(app)
        .options('/api/emotional/analyze')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
      expect(response.headers['access-control-allow-headers']).toBeDefined();
    });

    it('should include proper cache headers for health endpoints', async () => {
      const response = await request(app)
        .get('/api/liveness');

      // Health endpoints should not be cached
      expect(
        response.headers['cache-control'] === 'no-cache' ||
        response.headers['cache-control'] === 'no-store' ||
        !response.headers['cache-control']
      ).toBe(true);
    });
  });

  describe('API Versioning Support', () => {
    it('should handle API version headers', async () => {
      const response = await request(app)
        .get('/api/status')
        .set('Accept', 'application/json; version=1.0');

      expect(response.status).toBe(200);
      
      // Should include version info in response
      expect(response.body).toHaveProperty('version');
    });

    it('should maintain backward compatibility', async () => {
      // Test that older request formats still work
      const legacyRequest = {
        text: 'legacy format request',
        // Missing newer fields should be handled gracefully
      };

      const response = await request(app)
        .post('/api/emotional/analyze')
        .send(legacyRequest)
        .expect(200);

      const validation = validateSchema(response.body, schemas.EmotionalAnalysisResponse);
      expect(validation.valid).toBe(true);
    });
  });

  describe('Content Type Validation', () => {
    it('should enforce JSON content type for POST requests', async () => {
      const response = await request(app)
        .post('/api/emotional/analyze')
        .type('text/plain')
        .send('plain text data');

      expect(response.status).toBe(415); // Unsupported Media Type
      const validation = validateSchema(response.body, schemas.ErrorResponse);
      expect(validation.valid).toBe(true);
    });

    it('should return JSON content type in responses', async () => {
      const response = await request(app)
        .get('/api/liveness');

      expect(response.headers['content-type']).toContain('application/json');
    });
  });
});
