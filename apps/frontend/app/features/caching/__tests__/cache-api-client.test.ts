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