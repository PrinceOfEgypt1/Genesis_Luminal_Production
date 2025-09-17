/**
 * Testes de Integração - Cache Service
 * Testa integração com Redis e fallbacks
 */

import { CacheService } from '../../services/CacheService';

// Mock Redis para testes
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    isOpen: true,
    on: jest.fn()
  }))
}));

describe('Cache Integration Tests', () => {
  let cacheService: CacheService;
  let mockRedisClient: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Get mock client reference
    const redis = require('redis');
    mockRedisClient = redis.createClient();
    
    cacheService = new CacheService();
  });

  describe('Cache Operations', () => {
    it('should store and retrieve data from cache', async () => {
      const testData = { test: 'data', timestamp: Date.now() };
      const cacheKey = 'test:cache:key';
      const ttl = 300;

      // Mock successful set
      mockRedisClient.setEx.mockResolvedValue('OK');
      mockRedisClient.get.mockResolvedValue(JSON.stringify(testData));

      // Test set operation
      await cacheService.set(cacheKey, testData, ttl);
      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        cacheKey,
        ttl,
        JSON.stringify(testData)
      );

      // Test get operation
      const retrieved = await cacheService.get(cacheKey);
      expect(mockRedisClient.get).toHaveBeenCalledWith(cacheKey);
      expect(retrieved).toEqual(testData);
    });

    it('should handle cache miss gracefully', async () => {
      const cacheKey = 'non:existent:key';
      
      // Mock cache miss
      mockRedisClient.get.mockResolvedValue(null);

      const result = await cacheService.get(cacheKey);
      expect(result).toBeNull();
      expect(mockRedisClient.get).toHaveBeenCalledWith(cacheKey);
    });

    it('should handle Redis connection errors', async () => {
      const testData = { test: 'data' };
      const cacheKey = 'test:error:key';

      // Mock connection error
      mockRedisClient.get.mockRejectedValue(new Error('Redis connection failed'));
      mockRedisClient.setEx.mockRejectedValue(new Error('Redis connection failed'));

      // Should not throw, but return null for get
      const result = await cacheService.get(cacheKey);
      expect(result).toBeNull();

      // Should not throw for set operations
      await expect(
        cacheService.set(cacheKey, testData, 300)
      ).resolves.not.toThrow();
    });

    it('should handle invalid JSON in cache', async () => {
      const cacheKey = 'invalid:json:key';
      
      // Mock invalid JSON
      mockRedisClient.get.mockResolvedValue('invalid json string {');

      const result = await cacheService.get(cacheKey);
      expect(result).toBeNull(); // Should handle gracefully
    });
  });

  describe('Cache TTL and Expiration', () => {
    it('should respect TTL settings', async () => {
      const testData = { test: 'ttl data' };
      const cacheKey = 'ttl:test:key';
      const ttl = 60; // 1 minute

      mockRedisClient.setEx.mockResolvedValue('OK');

      await cacheService.set(cacheKey, testData, ttl);
      
      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        cacheKey,
        ttl,
        JSON.stringify(testData)
      );
    });

    it('should handle different TTL values', async () => {
      const testCases = [
        { ttl: 30, desc: '30 seconds' },
        { ttl: 300, desc: '5 minutes' },
        { ttl: 3600, desc: '1 hour' },
        { ttl: 86400, desc: '24 hours' }
      ];

      for (const testCase of testCases) {
        mockRedisClient.setEx.mockResolvedValue('OK');
        
        await cacheService.set(
          `ttl:test:${testCase.ttl}`,
          { ttl: testCase.ttl },
          testCase.ttl
        );

        expect(mockRedisClient.setEx).toHaveBeenLastCalledWith(
          `ttl:test:${testCase.ttl}`,
          testCase.ttl,
          JSON.stringify({ ttl: testCase.ttl })
        );
      }
    });
  });

  describe('Cache Performance', () => {
    it('should handle concurrent cache operations', async () => {
      const operations = Array(10).fill(null).map((_, index) => ({
        key: `concurrent:test:${index}`,
        data: { index, timestamp: Date.now() }
      }));

      mockRedisClient.setEx.mockResolvedValue('OK');
      mockRedisClient.get.mockImplementation((key: string) => 
        Promise.resolve(JSON.stringify(operations.find(op => op.key === key)?.data))
      );

      // Execute concurrent set operations
      const setPromises = operations.map(op =>
        cacheService.set(op.key, op.data, 300)
      );
      await Promise.all(setPromises);

      // Execute concurrent get operations
      const getPromises = operations.map(op =>
        cacheService.get(op.key)
      );
      const results = await Promise.all(getPromises);

      // Verify all operations completed
      expect(mockRedisClient.setEx).toHaveBeenCalledTimes(10);
      expect(mockRedisClient.get).toHaveBeenCalledTimes(10);
      expect(results).toHaveLength(10);
      
      results.forEach((result, index) => {
        expect(result).toEqual(operations[index].data);
      });
    });

    it('should handle large payload caching', async () => {
      // Create large test data (~100KB)
      const largeData = {
        data: 'x'.repeat(100000),
        metadata: {
          size: 100000,
          timestamp: Date.now(),
          type: 'large_payload_test'
        }
      };

      mockRedisClient.setEx.mockResolvedValue('OK');
      mockRedisClient.get.mockResolvedValue(JSON.stringify(largeData));

      await cacheService.set('large:payload:test', largeData, 300);
      const retrieved = await cacheService.get('large:payload:test');

      expect(retrieved).toEqual(largeData);
      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'large:payload:test',
        300,
        JSON.stringify(largeData)
      );
    });
  });
});
