/**
 * @fileoverview Testes unitários para EmotionController
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

import request from 'supertest';
import express from 'express';
import { EmotionController } from '@/controllers/EmotionController';
import { EmotionService } from '@/services/EmotionService';

// Mock do service
jest.mock('@/services/EmotionService');

describe('EmotionController', () => {
  let app: express.Application;
  let emotionController: EmotionController;
  let mockEmotionService: jest.Mocked<EmotionService>;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    mockEmotionService = new EmotionService(null as any) as jest.Mocked<EmotionService>;
    emotionController = new EmotionController(mockEmotionService);

    // Setup routes
    app.post('/api/analyze', emotionController.analyzeEmotion.bind(emotionController));
    app.get('/api/health', emotionController.healthCheck.bind(emotionController));
  });

  describe('POST /api/analyze', () => {
    it('should analyze emotion successfully with valid payload', async () => {
      const mockResult = {
        intensity: 0.8,
        dominantAffect: 'joy',
        confidence: 0.9,
        timestamp: new Date(),
        metadata: {
          model: 'claude-3',
          processingTime: 120,
        },
      };

      mockEmotionService.analyzeEmotion.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/analyze')
        .send({
          text: 'I am feeling great today!',
          userId: 'user-123',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        intensity: 0.8,
        dominantAffect: 'joy',
        confidence: 0.9,
      });

      expect(mockEmotionService.analyzeEmotion).toHaveBeenCalledWith({
        text: 'I am feeling great today!',
        userId: 'user-123',
        timestamp: expect.any(Date),
      });
    });

    it('should return 400 for missing text field', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          userId: 'user-123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('text');
    });

    it('should return 400 for missing userId field', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          text: 'Some text',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('userId');
    });

    it('should return 400 for empty text', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          text: '',
          userId: 'user-123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle service errors with 500 status', async () => {
      mockEmotionService.analyzeEmotion.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .post('/api/analyze')
        .send({
          text: 'Test text',
          userId: 'user-123',
        })
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Internal server error');
    });

    it('should handle large text inputs', async () => {
      const largeText = 'A'.repeat(5000);
      const mockResult = {
        intensity: 0.5,
        dominantAffect: 'neutral',
        confidence: 0.6,
        timestamp: new Date(),
      };

      mockEmotionService.analyzeEmotion.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/analyze')
        .send({
          text: largeText,
          userId: 'user-123',
        })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(mockEmotionService.analyzeEmotion).toHaveBeenCalled();
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'emotion-analysis');
    });
  });

  describe('request validation', () => {
    it('should sanitize input text', async () => {
      const maliciousText = '<script>alert("xss")</script>Hello world';
      const mockResult = {
        intensity: 0.5,
        dominantAffect: 'neutral',
        confidence: 0.7,
        timestamp: new Date(),
      };

      mockEmotionService.analyzeEmotion.mockResolvedValue(mockResult);

      await request(app)
        .post('/api/analyze')
        .send({
          text: maliciousText,
          userId: 'user-123',
        })
        .expect(200);

      // Verify that the service received sanitized input
      const calledWith = mockEmotionService.analyzeEmotion.mock.calls[0][0];
      expect(calledWith.text).not.toContain('<script>');
    });

    it('should validate userId format', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          text: 'Valid text',
          userId: 'invalid user id with spaces!@#',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
