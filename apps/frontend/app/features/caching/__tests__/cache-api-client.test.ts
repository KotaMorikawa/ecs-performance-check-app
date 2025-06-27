// キャッシュAPIクライアントのテスト

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  calculateCacheMetrics, 
  CacheApiError,
  cacheTestApi,
  revalidationApi,
  cacheStatsApi,
  cloudfrontSimulationApi
} from '../_shared/cache-api-client';
import type { CacheApiResponse, CacheTestData } from '../_shared/types';

// モックレスポンスデータ
const mockCacheResponse: CacheApiResponse<CacheTestData[]> = {
  data: [
    {
      id: 1,
      title: 'Test Category',
      content: 'Test content',
      category: 'test',
      timestamp: '2023-01-01T00:00:00Z',
      size: 1024,
      views: 100,
      name: 'Test Item',
      postCount: 5,
      description: 'Test description',
    },
  ],
  metadata: {
    cached: true,
    cacheStatus: 'fresh',
    strategy: 'data-cache',
    timestamp: '2023-01-01T00:00:00Z',
    source: 'cache',
    ttl: 3600,
    tags: ['test'],
  },
  metrics: {
    fetchTime: 50,
    dataSize: 2048,
    cacheHit: true,
  },
};

// モック設定
vi.mock('../_shared/cache-api-client', async () => {
  const actual = await vi.importActual('../_shared/cache-api-client');
  return {
    ...actual,
    // fetchWithCacheをモック化するために再エクスポート
  };
});

// グローバルfetchのモック
global.fetch = vi.fn();

describe('Cache API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('revalidationApi', () => {
    it('should handle revalidateTag API calls', async () => {
      // Arrange
      const mockResponse = {
        id: 'revalidation-1',
        type: 'tag' as const,
        target: 'categories',
        success: true,
        timestamp: new Date().toISOString(),
        duration: 150,
        triggeredBy: 'user',
        strategy: 'on-demand',
      };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // Act
      const result = await revalidationApi.revalidateTag('categories');

      // Assert
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/revalidate'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag: 'categories' }),
        })
      );
    });

    it('should handle revalidatePath API calls', async () => {
      // Arrange
      const mockResponse = {
        id: 'revalidation-2',
        type: 'path' as const,
        target: '/features/caching',
        success: true,
        timestamp: new Date().toISOString(),
        duration: 200,
        triggeredBy: 'user',
        strategy: 'on-demand',
      };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // Act
      const result = await revalidationApi.revalidatePath('/features/caching');

      // Assert
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/revalidate'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/features/caching' }),
        })
      );
    });
  });

  describe('cacheStatsApi', () => {
    it('should fetch cache statistics', async () => {
      // Arrange
      const mockStats = {
        layers: {
          'data-cache': { hits: 100, misses: 20 },
          'full-route-cache': { hits: 80, misses: 10 },
        },
        overall: { hitRate: 85 },
      };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStats),
      });

      // Act
      const result = await cacheStatsApi.getStats();

      // Assert
      expect(result).toEqual(mockStats);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/cache-stats')
      );
    });
  });

  describe('cloudfrontSimulationApi', () => {
    it('should simulate CloudFront cache behavior', async () => {
      // Arrange
      const mockSimulation = {
        status: 'simulated',
        hitRate: 95,
        responseTime: 50,
      };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSimulation),
      });

      // Act
      const result = await cloudfrontSimulationApi.simulate({ region: 'us-east-1' });

      // Assert
      expect(result).toEqual(mockSimulation);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/cloudfront-simulation'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ region: 'us-east-1' }),
        })
      );
    });
  });

  describe('calculateCacheMetrics', () => {
    it('should calculate metrics from cache responses', () => {
      const responses = [mockCacheResponse];
      const metrics = calculateCacheMetrics(responses);

      expect(metrics.hits).toBe(1);
      expect(metrics.misses).toBe(0);
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.hitRate).toBe(100);
      expect(metrics.avgResponseTime).toBe(50);
      expect(metrics.cacheSize).toBe(2048);
      expect(metrics.strategy).toBe('data-cache');
    });

    it('should handle multiple responses', () => {
      const missResponse = {
        ...mockCacheResponse,
        metadata: {
          ...mockCacheResponse.metadata,
          cached: false,
        },
        metrics: {
          ...mockCacheResponse.metrics,
          cacheHit: false,
          fetchTime: 150,
        },
      };

      const responses = [mockCacheResponse, missResponse];
      const metrics = calculateCacheMetrics(responses);

      expect(metrics.hits).toBe(1);
      expect(metrics.misses).toBe(1);
      expect(metrics.totalRequests).toBe(2);
      expect(metrics.hitRate).toBe(50);
      expect(metrics.avgResponseTime).toBe(100); // (50 + 150) / 2
      expect(metrics.cacheSize).toBe(4096); // 2048 * 2
    });

    it('should handle empty responses', () => {
      const metrics = calculateCacheMetrics([]);

      expect(metrics.hits).toBe(0);
      expect(metrics.misses).toBe(0);
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.hitRate).toBe(0);
      expect(metrics.avgResponseTime).toBe(0);
      expect(metrics.cacheSize).toBe(0);
    });
  });
});