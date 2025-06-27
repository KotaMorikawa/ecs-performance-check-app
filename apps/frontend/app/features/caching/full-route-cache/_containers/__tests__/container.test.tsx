// FullRouteCacheContainer Server Componentのテスト

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FullRouteCacheContainer } from '../container';
import { cacheTestApi } from '../../../_shared/cache-api-client';
import {
  updateLayerMetrics,
  calculateOverallMetrics,
  generatePerformanceMetrics,
} from '../../../_shared/cache-metrics';

// モック設定
vi.mock('../../../_shared/cache-api-client');
vi.mock('../../../_shared/cache-metrics');
vi.mock('../presentational', () => ({
  FullRouteCachePresentational: ({ initialData, error, cacheInfo }: any) => (
    <div data-testid="presentational">
      {error && <div data-testid="error">{error}</div>}
      <div data-testid="data-count">{initialData.length}</div>
      <div data-testid="cache-mode">{cacheInfo.mode}</div>
      <div data-testid="cache-cached">{cacheInfo.cached.toString()}</div>
    </div>
  ),
}));

const mockCacheTestApi = vi.mocked(cacheTestApi);
const mockUpdateLayerMetrics = vi.mocked(updateLayerMetrics);
const mockCalculateOverallMetrics = vi.mocked(calculateOverallMetrics);
const mockGeneratePerformanceMetrics = vi.mocked(generatePerformanceMetrics);

// performance.now のモック
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: { now: mockPerformanceNow },
  writable: true,
});

// モックデータ
const mockCacheResponse = {
  data: [
    {
      id: 1,
      title: 'Full Route Cache Test',
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
    strategy: 'full-route-cache',
    timestamp: '2023-01-01T00:00:00Z',
    source: 'cache',
    ttl: 120,
    tags: ['full-route-cache'],
  },
  metrics: {
    fetchTime: 25,
    dataSize: 2048,
    cacheHit: true,
  },
};

const mockLayerMetrics = {
  strategy: 'full-route-cache',
  hits: 1,
  misses: 0,
  totalRequests: 1,
  hitRate: 100,
  avgResponseTime: 25,
  cacheSize: 2048,
};

const mockOverallMetrics = {
  totalHits: 1,
  totalMisses: 0,
  overallHitRate: 100,
  totalCacheSize: 2048,
  efficiencyScore: 95,
};

const mockPerformanceMetrics = {
  renderTime: 25,
  loadTime: 100,
  coreWebVitals: {
    lcp: 1200,
    fid: 50,
    cls: 0.1,
  },
};

describe('FullRouteCacheContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // デフォルトのモック動作を設定
    mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(125);
    mockGeneratePerformanceMetrics.mockReturnValue(mockPerformanceMetrics);
    mockUpdateLayerMetrics.mockReturnValue(mockLayerMetrics);
    mockCalculateOverallMetrics.mockReturnValue(mockOverallMetrics);
  });

  describe('staticモード', () => {
    it('should render successfully with static cache mode', async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);

      // Act
      const Component = await FullRouteCacheContainer({ mode: 'static' });
      render(Component);

      // Assert
      expect(screen.getByTestId('presentational')).toBeInTheDocument();
      expect(screen.getByTestId('data-count')).toHaveTextContent('1');
      expect(screen.getByTestId('cache-mode')).toHaveTextContent('static');
      expect(screen.getByTestId('cache-cached')).toHaveTextContent('true');
      expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    });

    it('should call cacheTestApi.getTestData with force-cache for static mode', async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);

      // Act
      await FullRouteCacheContainer({ mode: 'static' });

      // Assert
      expect(mockCacheTestApi.getTestData).toHaveBeenCalledWith(
        {
          cache: 'force-cache',
        },
        'full-route-cache'
      );
    });

    it('should set cached to true for static mode', async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue({
        ...mockCacheResponse,
        metadata: { ...mockCacheResponse.metadata, cached: false },
      });

      // Act
      const Component = await FullRouteCacheContainer({ mode: 'static' });
      render(Component);

      // Assert
      expect(screen.getByTestId('cache-cached')).toHaveTextContent('true');
    });
  });

  describe('ISRモード', () => {
    it('should render successfully with ISR mode', async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);

      // Act
      const Component = await FullRouteCacheContainer({ mode: 'isr' });
      render(Component);

      // Assert
      expect(screen.getByTestId('presentational')).toBeInTheDocument();
      expect(screen.getByTestId('cache-mode')).toHaveTextContent('isr');
    });

    it('should call cacheTestApi.getTestData with revalidate settings for ISR mode', async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);

      // Act
      await FullRouteCacheContainer({ mode: 'isr' });

      // Assert
      expect(mockCacheTestApi.getTestData).toHaveBeenCalledWith(
        {
          next: {
            revalidate: 120,
            tags: ['full-route-cache', 'isr'],
          },
        },
        'full-route-cache'
      );
    });
  });

  describe('dynamicモード', () => {
    it('should render successfully with dynamic mode', async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);

      // Act
      const Component = await FullRouteCacheContainer({ mode: 'dynamic' });
      render(Component);

      // Assert
      expect(screen.getByTestId('presentational')).toBeInTheDocument();
      expect(screen.getByTestId('cache-mode')).toHaveTextContent('dynamic');
    });

    it('should call cacheTestApi.getTestData with no-store for dynamic mode', async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);

      // Act
      await FullRouteCacheContainer({ mode: 'dynamic' });

      // Assert
      expect(mockCacheTestApi.getTestData).toHaveBeenCalledWith(
        {
          cache: 'no-store',
        },
        'full-route-cache'
      );
    });
  });

  describe('デフォルト設定', () => {
    it('should use static mode as default', async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);

      // Act
      const Component = await FullRouteCacheContainer();
      render(Component);

      // Assert
      expect(screen.getByTestId('cache-mode')).toHaveTextContent('static');
    });

    it('should handle no props passed', async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);

      // Act
      const Component = await FullRouteCacheContainer();
      render(Component);

      // Assert
      expect(screen.getByTestId('presentational')).toBeInTheDocument();
      expect(screen.getByTestId('data-count')).toHaveTextContent('1');
    });
  });

  describe('パフォーマンス測定', () => {
    it('should measure render time correctly', async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);
      mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(150);

      // Act
      await FullRouteCacheContainer({ mode: 'static' });

      // Assert
      expect(mockUpdateLayerMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          strategy: 'full-route-cache',
        }),
        expect.objectContaining({
          metrics: expect.objectContaining({
            fetchTime: 50, // 150 - 100
          }),
        })
      );
    });

    it('should update performance metrics in initial metrics', async () => {
      // Arrange
      const customRenderTime = 75;
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);
      mockPerformanceNow.mockReturnValueOnce(200).mockReturnValueOnce(275);

      // Act
      await FullRouteCacheContainer({ mode: 'isr' });

      // Assert
      // updateLayerMetrics呼び出し時のmetricsを確認
      const updateLayerMetricsCall = mockUpdateLayerMetrics.mock.calls[0];
      expect(updateLayerMetricsCall[1].metrics.fetchTime).toBe(customRenderTime);
    });
  });

  describe('メトリクス更新', () => {
    it('should update full-route-cache layer metrics', async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);

      // Act
      await FullRouteCacheContainer({ mode: 'static' });

      // Assert
      expect(mockUpdateLayerMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          strategy: 'full-route-cache',
          hits: 0,
          misses: 0,
        }),
        expect.objectContaining({
          metadata: expect.objectContaining({
            cached: true, // staticモードでは強制的にtrueになる
          }),
        })
      );
    });

    it('should calculate overall metrics', async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);

      // Act
      await FullRouteCacheContainer({ mode: 'isr' });

      // Assert
      expect(mockCalculateOverallMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          'full-route-cache': mockLayerMetrics,
        })
      );
    });

    it('should include all cache layers in initial metrics', async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);

      // Act
      await FullRouteCacheContainer({ mode: 'dynamic' });

      // Assert
      const overallMetricsCall = mockCalculateOverallMetrics.mock.calls[0];
      const layers = overallMetricsCall[0];
      
      expect(layers).toHaveProperty('data-cache');
      expect(layers).toHaveProperty('full-route-cache');
      expect(layers).toHaveProperty('router-cache');
      expect(layers).toHaveProperty('request-memoization');
      expect(layers).toHaveProperty('cloudfront-cache');
    });
  });

  describe('エラーハンドリング', () => {
    it('should handle API errors gracefully', async () => {
      // Arrange
      const errorMessage = 'Full route cache error';
      mockCacheTestApi.getTestData.mockRejectedValue(new Error(errorMessage));

      // Act
      const Component = await FullRouteCacheContainer({ mode: 'static' });
      render(Component);

      // Assert
      expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
      expect(screen.getByTestId('data-count')).toHaveTextContent('0');
    });

    it('should handle unknown errors', async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockRejectedValue('Unknown error');

      // Act
      const Component = await FullRouteCacheContainer({ mode: 'isr' });
      render(Component);

      // Assert
      expect(screen.getByTestId('error')).toHaveTextContent('Unknown error');
    });

    it('should log errors to console', async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const testError = new Error('Test error');
      mockCacheTestApi.getTestData.mockRejectedValue(testError);

      // Act
      await FullRouteCacheContainer({ mode: 'dynamic' });

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Full route cache fetch error:', testError);

      consoleSpy.mockRestore();
    });
  });

  describe('Suspense integration', () => {
    it('should render with Suspense wrapper', async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);

      // Act
      const Component = await FullRouteCacheContainer({ mode: 'static' });

      // Assert
      expect(Component.props.fallback).toEqual(
        <div>Loading full route cache demo...</div>
      );
    });
  });

  describe('cacheInfo生成', () => {
    it('should generate correct cacheInfo for static mode', async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);

      // Act
      const Component = await FullRouteCacheContainer({ mode: 'static' });
      render(Component);

      // Assert
      expect(screen.getByTestId('cache-mode')).toHaveTextContent('static');
      expect(screen.getByTestId('cache-cached')).toHaveTextContent('true');
    });

    it('should generate correct cacheInfo for dynamic mode', async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue({
        ...mockCacheResponse,
        metadata: { ...mockCacheResponse.metadata, cached: false },
      });

      // Act
      const Component = await FullRouteCacheContainer({ mode: 'dynamic' });
      render(Component);

      // Assert
      expect(screen.getByTestId('cache-mode')).toHaveTextContent('dynamic');
      expect(screen.getByTestId('cache-cached')).toHaveTextContent('false');
    });
  });
});