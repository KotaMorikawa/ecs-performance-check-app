// CacheComparisonContainer Server Componentのテスト

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CacheComparisonContainer } from '../container';
import { cacheTestApi } from '../../../_shared/cache-api-client';
import { compareStrategies, generateRecommendations, evaluateCacheHealth } from '../../../_shared/cache-metrics';

// モック設定
vi.mock('../../../_shared/cache-api-client');
vi.mock('../../../_shared/cache-metrics');
vi.mock('../presentational', () => ({
  CacheComparisonPresentational: ({ comparisonData, error }: any) => (
    <div data-testid="presentational">
      {error && <div data-testid="error">{error}</div>}
      <div data-testid="comparison-count">{Object.keys(comparisonData || {}).length}</div>
    </div>
  ),
}));

// performance.now のモック
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: { now: mockPerformanceNow },
  writable: true,
});

const mockCacheTestApi = vi.mocked(cacheTestApi);
const mockCompareStrategies = vi.mocked(compareStrategies);
const mockGenerateRecommendations = vi.mocked(generateRecommendations);
const mockEvaluateCacheHealth = vi.mocked(evaluateCacheHealth);

// モックデータ
const mockComparisonData = {
  'data-cache': {
    data: [{ id: 1, name: 'Data Cache Test' }],
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
      fetchTime: 25,
      dataSize: 1024,
      cacheHit: true,
    },
  },
  'full-route-cache': {
    data: [{ id: 2, name: 'Full Route Cache Test' }],
    metadata: {
      cached: true,
      cacheStatus: 'fresh',
      strategy: 'full-route-cache',
      timestamp: '2023-01-01T00:00:00Z',
      source: 'cache',
      ttl: 120,
      tags: ['test'],
    },
    metrics: {
      fetchTime: 15,
      dataSize: 2048,
      cacheHit: true,
    },
  },
};

const mockComparison = {
  winner: 'full-route-cache' as const,
  rankings: ['full-route-cache', 'data-cache'],
  scores: {
    'full-route-cache': 95,
    'data-cache': 85,
  },
};

const mockRecommendations = [
  {
    strategy: 'full-route-cache' as const,
    priority: 'high' as const,
    reason: 'Best performance',
    impact: 'High performance improvement',
  },
];

const mockHealthEvaluation = {
  overall: 'good' as const,
  scores: {
    performance: 90,
    efficiency: 85,
    freshness: 80,
  },
  issues: [],
};

describe('CacheComparisonContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(150);
    
    // デフォルトのモック動作を設定
    mockCompareStrategies.mockReturnValue(mockComparison);
    mockGenerateRecommendations.mockReturnValue(mockRecommendations);
    mockEvaluateCacheHealth.mockReturnValue(mockHealthEvaluation);
  });

  describe('正常なデータ取得', () => {
    it('should render successfully with comparison data', async () => {
      // Arrange
      mockCacheTestApi.getComparisonData.mockResolvedValue(mockComparisonData);

      // Act
      const Component = await CacheComparisonContainer();
      render(Component);

      // Assert
      expect(screen.getByTestId('presentational')).toBeInTheDocument();
      expect(screen.getByTestId('comparison-count')).toHaveTextContent('2');
      expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    });

    it('should call cacheTestApi.getComparisonData', async () => {
      // Arrange
      mockCacheTestApi.getComparisonData.mockResolvedValue(mockComparisonData);

      // Act
      await CacheComparisonContainer();

      // Assert
      expect(mockCacheTestApi.getComparisonData).toHaveBeenCalled();
    });

    it('should call comparison and recommendation functions', async () => {
      // Arrange
      mockCacheTestApi.getComparisonData.mockResolvedValue(mockComparisonData);

      // Act
      await CacheComparisonContainer();

      // Assert
      expect(mockCompareStrategies).toHaveBeenCalled();
      expect(mockGenerateRecommendations).toHaveBeenCalled();
      expect(mockEvaluateCacheHealth).toHaveBeenCalled();
    });
  });

  describe('エラーハンドリング', () => {
    it('should handle API errors gracefully', async () => {
      // Arrange
      const errorMessage = 'Cache comparison error';
      mockCacheTestApi.getComparisonData.mockRejectedValue(new Error(errorMessage));

      // Act
      const Component = await CacheComparisonContainer();
      render(Component);

      // Assert
      expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
      expect(screen.getByTestId('comparison-count')).toHaveTextContent('0');
    });

    it('should handle unknown errors', async () => {
      // Arrange
      mockCacheTestApi.getComparisonData.mockRejectedValue('Unknown error');

      // Act
      const Component = await CacheComparisonContainer();
      render(Component);

      // Assert
      expect(screen.getByTestId('error')).toHaveTextContent('Unknown error');
    });
  });

  describe('Suspense integration', () => {
    it('should render with Suspense wrapper', async () => {
      // Arrange
      mockCacheTestApi.getComparisonData.mockResolvedValue(mockComparisonData);

      // Act
      const Component = await CacheComparisonContainer();

      // Assert
      expect(Component.props.fallback).toEqual(
        <div>Loading cache comparison...</div>
      );
    });
  });
});