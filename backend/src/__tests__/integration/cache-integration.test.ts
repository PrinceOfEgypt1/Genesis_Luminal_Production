import { CacheService } from '../../services/CacheService';

// Mock Redis client antes de importar
const mockRedisClient = {
  connect: jest.fn().mockResolvedValue(undefined),
  get: jest.fn(),
  setEx: jest.fn(),
  disconnect: jest.fn(),
  isOpen: true,
  on: jest.fn()
};

jest.mock('redis', () => ({
  createClient: jest.fn(() => mockRedisClient)
}));

describe('Cache Integration Tests', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Force connected state for tests
    cacheService = new CacheService();
    (cacheService as any).connected = true;
    (cacheService as any).client = mockRedisClient;
  });

  describe('Cache Operations', () => {
    it('should store and retrieve data from cache', async () => {
      const cacheKey = 'test:cache:key';
      const testData = { test: 'data', timestamp: Date.now() };
      const ttl = 300;

      // Mock Redis responses
      mockRedisClient.get.mockResolvedValue(JSON.stringify(testData));
      mockRedisClient.setEx.mockResolvedValue('OK');

      // Test set operation
      await cacheService.set(cacheKey, testData, ttl);
      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        cacheKey,
        ttl,
        JSON.stringify(testData)
      );

      // Test get operation
      const result = await cacheService.get(cacheKey);
      expect(mockRedisClient.get).toHaveBeenCalledWith(cacheKey);
      expect(result).toEqual(testData);
    });

    it('should handle cache miss gracefully', async () => {
      const cacheKey = 'non:existent:key';
      
      mockRedisClient.get.mockResolvedValue(null);

      const result = await cacheService.get(cacheKey);
      expect(result).toBeNull();
      expect(mockRedisClient.get).toHaveBeenCalledWith(cacheKey);
    });

    it('should handle Redis connection errors', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Connection failed'));
      mockRedisClient.setEx.mockRejectedValue(new Error('Connection failed'));

      const result = await cacheService.get('error:key');
      expect(result).toBeNull();

      await expect(cacheService.set('error:key', 'data', 300)).resolves.not.toThrow();
    });
  });

  describe('Cache TTL and Expiration', () => {
    it('should respect TTL settings', async () => {
      const cacheKey = 'ttl:test:key';
      const testData = { test: 'ttl data' };
      const ttl = 60;

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
        { ttl: 30, description: '30 seconds' },
        { ttl: 300, description: '5 minutes' },
        { ttl: 3600, description: '1 hour' }
      ];

      mockRedisClient.setEx.mockResolvedValue('OK');

      for (const testCase of testCases) {
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
      mockRedisClient.setEx.mockResolvedValue('OK');
      mockRedisClient.get.mockResolvedValue(JSON.stringify({ concurrent: true }));

      const operations = Array.from({ length: 10 }, async (_, i) => {
        await cacheService.set(`concurrent:${i}`, { index: i }, 300);
        return await cacheService.get(`concurrent:${i}`);
      });

      const results = await Promise.all(operations);

      // Verify all operations completed
      expect(mockRedisClient.setEx).toHaveBeenCalledTimes(10);
      expect(mockRedisClient.get).toHaveBeenCalledTimes(10);
      expect(results).toHaveLength(10);
    });

    it('should handle large payload caching', async () => {
      const largeData = { data: 'x'.repeat(10000) }; // 10KB payload
      
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

  describe('Cache Error Recovery', () => {
    it('should gracefully degrade when Redis is unavailable', async () => {
      // Simulate disconnected state
      (cacheService as any).connected = false;

      const result = await cacheService.get('test:key');
      expect(result).toBeNull();

      await expect(cacheService.set('test:key', 'data', 300)).resolves.not.toThrow();
    });

    it('should handle JSON parsing errors', async () => {
      mockRedisClient.get.mockResolvedValue('invalid-json-{');

      const result = await cacheService.get('invalid:json:key');
      expect(result).toBeNull();
    });
  });
});
