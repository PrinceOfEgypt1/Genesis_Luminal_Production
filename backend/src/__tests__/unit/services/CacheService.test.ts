import { CacheService } from '../../../services/CacheService';

// Mock Redis
const mockRedisClient = {
  get: jest.fn(),
  setEx: jest.fn(),
  del: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  isOpen: true
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

    it('should handle JSON parse errors', async () => {
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
    it('should store data with default TTL', async () => {
      const testData = { value: 'test' };
      mockRedisClient.setEx.mockResolvedValue('OK');

      await cacheService.set('test-key', testData);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'test-key',
        3600, // default TTL
        JSON.stringify(testData)
      );
    });

    it('should store data with custom TTL', async () => {
      const testData = { value: 'test' };
      const customTtl = 1800;
      mockRedisClient.setEx.mockResolvedValue('OK');

      await cacheService.set('test-key', testData, customTtl);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'test-key',
        customTtl,
        JSON.stringify(testData)
      );
    });

    it('should handle Redis set errors', async () => {
      const testData = { value: 'test' };
      mockRedisClient.setEx.mockRejectedValue(new Error('Set failed'));

      await expect(cacheService.set('error-key', testData))
        .rejects.toThrow('Set failed');
    });
  });

  describe('delete', () => {
    it('should delete key from cache', async () => {
      mockRedisClient.del.mockResolvedValue(1);

      const result = await cacheService.delete('test-key');

      expect(mockRedisClient.del).toHaveBeenCalledWith('test-key');
      expect(result).toBe(true);
    });

    it('should return false when key does not exist', async () => {
      mockRedisClient.del.mockResolvedValue(0);

      const result = await cacheService.delete('nonexistent-key');

      expect(result).toBe(false);
    });
  });

  describe('generateKey', () => {
    it('should generate consistent keys for same input', () => {
      const input = { text: 'test', state: { energy: 0.5 } };
      
      const key1 = cacheService.generateKey('emotional', input);
      const key2 = cacheService.generateKey('emotional', input);
      
      expect(key1).toBe(key2);
      expect(key1).toContain('emotional:');
    });

    it('should generate different keys for different inputs', () => {
      const input1 = { text: 'test1' };
      const input2 = { text: 'test2' };
      
      const key1 = cacheService.generateKey('emotional', input1);
      const key2 = cacheService.generateKey('emotional', input2);
      
      expect(key1).not.toBe(key2);
    });
  });

  describe('connection management', () => {
    it('should handle connection initialization', async () => {
      mockRedisClient.connect.mockResolvedValue(undefined);

      await cacheService.connect();

      expect(mockRedisClient.connect).toHaveBeenCalled();
    });

    it('should handle disconnection', async () => {
      mockRedisClient.disconnect.mockResolvedValue(undefined);

      await cacheService.disconnect();

      expect(mockRedisClient.disconnect).toHaveBeenCalled();
    });
  });
});
