// CacheComparisonContainer Server Componentのテスト

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CacheComparisonContainer } from '../container';
import { cacheTestApi } from '../../../_shared/cache-api-client';
import { compareStrategies, generateRecommendations, evaluateCacheHealth } from '../../../_shared/cache-metrics';
import type { 
  CacheComparisonResult, 
  CacheHealthStatus, 
  CacheStrategy,
  CacheApiResponse,
  CacheTestData
} from '../../../_shared/types';

// モック設定
vi.mock('../../../_shared/cache-api-client');
vi.mock('../../../_shared/cache-metrics');
vi.mock('../presentational', () => ({
  CacheComparisonPresentational: ({ comparisonData, error }: { comparisonData?: Record<string, unknown>; error?: string }) => (
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

// console.error のモック
vi.spyOn(console, 'error').mockImplementation(() => {});

const mockCacheTestApi = vi.mocked(cacheTestApi);
const mockCompareStrategies = vi.mocked(compareStrategies);
const mockGenerateRecommendations = vi.mocked(generateRecommendations);
const mockEvaluateCacheHealth = vi.mocked(evaluateCacheHealth);

// モックデータ
const mockComparisonData = {
  'data-cache': {
    data: [{
      id: 1,
      title: 'Data Cache Test',
      content: 'Test content',
      category: 'test',
      timestamp: '2023-01-01T00:00:00Z',
      size: 1024,
      views: 100,
      name: 'Data Cache Test',
      postCount: 5,
      description: 'Test description',
    }],
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
    data: [{
      id: 2,
      title: 'Full Route Cache Test',
      content: 'Test content',
      category: 'test',
      timestamp: '2023-01-01T00:00:00Z',
      size: 2048,
      views: 200,
      name: 'Full Route Cache Test',
      postCount: 10,
      description: 'Test description',
    }],
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
  'router-cache': {
    data: [{
      id: 3,
      title: 'Router Cache Test',
      content: 'Test content',
      category: 'test',
      timestamp: '2023-01-01T00:00:00Z',
      size: 512,
      views: 300,
      name: 'Router Cache Test',
      postCount: 15,
      description: 'Test description',
    }],
    metadata: {
      cached: true,
      cacheStatus: 'hit',
      strategy: 'router-cache',
      timestamp: '2023-01-01T00:00:00Z',
      source: 'cache',
      ttl: 30,
      tags: ['test'],
    },
    metrics: {
      fetchTime: 5,
      dataSize: 512,
      cacheHit: true,
    },
  },
  'request-memoization': {
    data: [{
      id: 4,
      title: 'Request Memoization Test',
      content: 'Test content',
      category: 'test',
      timestamp: '2023-01-01T00:00:00Z',
      size: 256,
      views: 400,
      name: 'Request Memoization Test',
      postCount: 20,
      description: 'Test description',
    }],
    metadata: {
      cached: true,
      cacheStatus: 'hit',
      strategy: 'request-memoization',
      timestamp: '2023-01-01T00:00:00Z',
      source: 'cache',
      ttl: 0,
      tags: ['test'],
    },
    metrics: {
      fetchTime: 1,
      dataSize: 256,
      cacheHit: true,
    },
  },
  'cloudfront-cache': {
    data: [{
      id: 5,
      title: 'CloudFront Cache Test',
      content: 'Test content',
      category: 'test',
      timestamp: '2023-01-01T00:00:00Z',
      size: 4096,
      views: 500,
      name: 'CloudFront Cache Test',
      postCount: 25,
      description: 'Test description',
    }],
    metadata: {
      cached: true,
      cacheStatus: 'hit',
      strategy: 'cloudfront-cache',
      timestamp: '2023-01-01T00:00:00Z',
      source: 'cache',
      ttl: 86400,
      tags: ['test'],
    },
    metrics: {
      fetchTime: 50,
      dataSize: 4096,
      cacheHit: true,
    },
  },
} as Record<CacheStrategy, CacheApiResponse<CacheTestData[]>>;

const mockComparison: CacheComparisonResult = {
  strategies: ['full-route-cache', 'data-cache'],
  metrics: {
    'full-route-cache': {
      performance: 95,
      efficiency: 90,
      reliability: 88,
      complexity: 75,
    },
    'data-cache': {
      performance: 85,
      efficiency: 80,
      reliability: 85,
      complexity: 60,
    },
    'router-cache': {
      performance: 70,
      efficiency: 75,
      reliability: 90,
      complexity: 80,
    },
    'request-memoization': {
      performance: 60,
      efficiency: 85,
      reliability: 95,
      complexity: 90,
    },
    'cloudfront-cache': {
      performance: 85,
      efficiency: 95,
      reliability: 80,
      complexity: 70,
    },
  },
  recommendations: [
    {
      bestFor: 'Static content',
      worstFor: 'Dynamic data',
      useCase: 'Blog posts',
      pros: ['Fast loading'],
      cons: ['Memory usage'],
    },
  ],
  winner: {
    strategy: 'full-route-cache',
    score: 95,
    reason: 'Best overall performance',
  },
};

const mockRecommendations = [
  {
    type: 'cache-strategy' as const,
    priority: 'high' as const,
    title: 'Use Full Route Cache',
    description: 'Best performance for static content',
    expectedImprovement: '50% faster loading',
    implementation: {
      complexity: 'easy' as const,
      timeRequired: '1 hour',
      steps: ['Enable route caching'],
    },
    metrics: {
      before: 100,
      after: 50,
      unit: 'ms',
    },
  },
];

const mockHealthEvaluation: CacheHealthStatus = {
  overall: 'healthy',
  layers: {
    'data-cache': {
      status: 'healthy',
      issues: [],
      lastCheck: '2023-01-01T00:00:00Z',
    },
    'full-route-cache': {
      status: 'healthy',
      issues: [],
      lastCheck: '2023-01-01T00:00:00Z',
    },
    'router-cache': {
      status: 'healthy',
      issues: [],
      lastCheck: '2023-01-01T00:00:00Z',
    },
    'request-memoization': {
      status: 'healthy',
      issues: [],
      lastCheck: '2023-01-01T00:00:00Z',
    },
    'cloudfront-cache': {
      status: 'healthy',
      issues: [],
      lastCheck: '2023-01-01T00:00:00Z',
    },
  },
  alerts: [],
  uptime: 99.9,
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
      expect(screen.getByTestId('comparison-count')).toHaveTextContent('5');
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