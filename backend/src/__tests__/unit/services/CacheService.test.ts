import { CacheService } from '../../../services/CacheService';

// Mock Redis
const mockRedisClient = {
  get: jest.fn(),
  setEx: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock('redis', () => ({
  createClient: jest.fn(() => mockRedisClient)
}));

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService();
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return cached data when key exists', async () => {
      const testData = { value: 'test', timestamp: Date.now() };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(testData));

      const result = await cacheService.get('test-key');

      expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
      expect(result).toEqual(testData);
    });

    it('should return null when key does not exist', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await cacheService.get('nonexistent-key');

      expect(result).toBeNull();
    });

    it('should handle JSON parse errors gracefully', async () => {
      mockRedisClient.get.mockResolvedValue('invalid-json');

      const result = await cacheService.get('invalid-key');

      expect(result).toBeNull();
    });

    it('should handle Redis connection errors', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Connection failed'));

      const result = await cacheService.get('error-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should store data with TTL (required parameter)', async () => {
      const testData = { value: 'test' };
      const ttl = 3600;
      mockRedisClient.setEx.mockResolvedValue('OK');

      await cacheService.set('test-key', testData, ttl);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'test-key',
        ttl,
        JSON.stringify(testData)
      );
    });

    it('should handle Redis set errors', async () => {
      const testData = { value: 'test' };
      mockRedisClient.setEx.mockRejectedValue(new Error('Set failed'));

      // Should not throw, just handle gracefully
      await expect(cacheService.set('error-key', testData, 3600))
        .resolves.toBeUndefined();
    });
  });

  describe('connection management', () => {
    it('should handle connection properly', () => {
      // Constructor calls connect automatically
      expect(mockRedisClient.connect).toHaveBeenCalled();
    });

    it('should handle connection failures gracefully', () => {
      mockRedisClient.connect.mockRejectedValue(new Error('Connection failed'));
      
      // Should not throw, uses fallback
      const newCacheService = new CacheService();
      expect(newCacheService).toBeInstanceOf(CacheService);
    });
  });

  describe('cache integration', () => {
    it('should work end-to-end when connected', async () => {
      const testData = { emotional: 'state', confidence: 0.8 };
      const key = 'emotion-cache-key';
      const ttl = 1800;

      mockRedisClient.setEx.mockResolvedValue('OK');
      mockRedisClient.get.mockResolvedValue(JSON.stringify(testData));

      // Set and then get
      await cacheService.set(key, testData, ttl);
      const retrieved = await cacheService.get(key);

      expect(retrieved).toEqual(testData);
    });

    it('should handle disconnected state gracefully', async () => {
      // Simulate disconnected state
      const disconnectedCache = new CacheService();
      disconnectedCache['connected'] = false;

      const result = await disconnectedCache.get('any-key');
      expect(result).toBeNull();

      // Set should not throw when disconnected
      await expect(disconnectedCache.set('any-key', {}, 3600))
        .resolves.toBeUndefined();
    });
  });
});
