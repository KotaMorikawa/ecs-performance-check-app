// キャッシュメトリクス計算のテスト

import { describe, it, expect } from 'vitest';
import {
  calculateHitRate,
  calculateEfficiencyScore,
  formatCacheSize,
  formatTTL,
  createDefaultLayerMetrics,
  updateLayerMetrics,
  calculateOverallMetrics,
  generatePerformanceMetrics,
  simulateCloudFrontMetrics,
  compareStrategies,
  evaluateCacheHealth,
  generateRecommendations,
} from '../_shared/cache-metrics';
import type {
  CacheStrategy,
  CacheLayerMetrics,
  CacheApiResponse,
  CacheMetrics,
} from '../_shared/types';

describe('Cache Metrics Utilities', () => {
  describe('calculateHitRate', () => {
    it('should calculate correct hit rate', () => {
      expect(calculateHitRate(8, 2)).toBe(80);
      expect(calculateHitRate(10, 0)).toBe(100);
      expect(calculateHitRate(0, 10)).toBe(0);
      expect(calculateHitRate(0, 0)).toBe(0);
    });
  });

  describe('calculateEfficiencyScore', () => {
    it('should calculate efficiency score correctly', () => {
      // 高いヒット率、低いレスポンス時間 = 高スコア
      const highScore = calculateEfficiencyScore(90, 50);
      expect(highScore).toBeGreaterThan(75);

      // 低いヒット率、高いレスポンス時間 = 低スコア
      const lowScore = calculateEfficiencyScore(30, 200);
      expect(lowScore).toBeLessThan(50);
    });

    it('should handle edge cases', () => {
      expect(calculateEfficiencyScore(100, 0)).toBe(100);
      expect(calculateEfficiencyScore(0, 1000)).toBe(0);
    });
  });

  describe('formatCacheSize', () => {
    it('should format bytes correctly', () => {
      expect(formatCacheSize(500)).toBe('500 B');
      expect(formatCacheSize(1536)).toBe('1.50 KB');
      expect(formatCacheSize(2097152)).toBe('2.00 MB');
      expect(formatCacheSize(1073741824)).toBe('1.00 GB');
    });
  });

  describe('formatTTL', () => {
    it('should format TTL correctly', () => {
      expect(formatTTL(undefined)).toBe('No TTL');
      expect(formatTTL(30)).toBe('30s');
      expect(formatTTL(120)).toBe('2m');
      expect(formatTTL(7200)).toBe('2h');
      expect(formatTTL(172800)).toBe('2d');
    });
  });

  describe('createDefaultLayerMetrics', () => {
    it('should create default metrics for a strategy', () => {
      const metrics = createDefaultLayerMetrics('data-cache');
      
      expect(metrics).toEqual({
        strategy: 'data-cache',
        hits: 0,
        misses: 0,
        totalRequests: 0,
        hitRate: 0,
        avgResponseTime: 0,
        cacheSize: 0,
        lastRevalidated: undefined,
        ttl: undefined,
      });
    });
  });

  describe('updateLayerMetrics', () => {
    it('should update metrics with a cache hit', () => {
      const currentMetrics: CacheLayerMetrics = createDefaultLayerMetrics('data-cache');
      const response: CacheApiResponse<unknown> = {
        data: {},
        metadata: {
          cached: true,
          cacheStatus: 'hit',
          strategy: 'data-cache',
          timestamp: '2023-01-01T00:00:00Z',
          source: 'cache',
          ttl: 3600,
          tags: ['test'],
        },
        metrics: {
          fetchTime: 50,
          dataSize: 1024,
          cacheHit: true,
        },
      };

      const updated = updateLayerMetrics(currentMetrics, response);

      expect(updated.hits).toBe(1);
      expect(updated.misses).toBe(0);
      expect(updated.totalRequests).toBe(1);
      expect(updated.hitRate).toBe(100);
      expect(updated.avgResponseTime).toBe(50);
      expect(updated.cacheSize).toBe(1024);
      expect(updated.ttl).toBe(3600);
    });

    it('should update metrics with a cache miss', () => {
      const currentMetrics: CacheLayerMetrics = createDefaultLayerMetrics('data-cache');
      const response: CacheApiResponse<unknown> = {
        data: {},
        metadata: {
          cached: false,
          cacheStatus: 'miss',
          strategy: 'data-cache',
          timestamp: '2023-01-01T00:00:00Z',
          source: 'network',
          ttl: undefined,
          tags: [],
        },
        metrics: {
          fetchTime: 150,
          dataSize: 2048,
          cacheHit: false,
        },
      };

      const updated = updateLayerMetrics(currentMetrics, response);

      expect(updated.hits).toBe(0);
      expect(updated.misses).toBe(1);
      expect(updated.totalRequests).toBe(1);
      expect(updated.hitRate).toBe(0);
      expect(updated.avgResponseTime).toBe(150);
      expect(updated.cacheSize).toBe(2048);
    });
  });

  describe('calculateOverallMetrics', () => {
    it('should calculate overall metrics from layers', () => {
      const layers: Record<CacheStrategy, CacheLayerMetrics> = {
        'data-cache': {
          strategy: 'data-cache',
          hits: 8,
          misses: 2,
          totalRequests: 10,
          hitRate: 80,
          avgResponseTime: 50,
          cacheSize: 10240,
        } as CacheLayerMetrics,
        'full-route-cache': {
          strategy: 'full-route-cache',
          hits: 5,
          misses: 5,
          totalRequests: 10,
          hitRate: 50,
          avgResponseTime: 100,
          cacheSize: 20480,
        } as CacheLayerMetrics,
        'router-cache': createDefaultLayerMetrics('router-cache'),
        'request-memoization': createDefaultLayerMetrics('request-memoization'),
        'cloudfront-cache': createDefaultLayerMetrics('cloudfront-cache'),
      };

      const overall = calculateOverallMetrics(layers);

      expect(overall.totalHits).toBe(13);
      expect(overall.totalMisses).toBe(7);
      expect(overall.overallHitRate).toBe(65);
      expect(overall.totalCacheSize).toBe(30720);
      expect(overall.efficiencyScore).toBeGreaterThan(0);
    });
  });

  describe('generatePerformanceMetrics', () => {
    it('should generate random performance metrics', () => {
      const metrics = generatePerformanceMetrics();

      expect(metrics.dataFetchTime).toBeGreaterThanOrEqual(10);
      expect(metrics.dataFetchTime).toBeLessThanOrEqual(60);
      expect(metrics.renderTime).toBeGreaterThanOrEqual(20);
      expect(metrics.renderTime).toBeLessThanOrEqual(50);
      expect(metrics.hydrationTime).toBeGreaterThanOrEqual(10);
      expect(metrics.hydrationTime).toBeLessThanOrEqual(30);
      expect(metrics.timeToFirstByte).toBeGreaterThanOrEqual(50);
      expect(metrics.timeToFirstByte).toBeLessThanOrEqual(150);
      expect(metrics.timeToInteractive).toBeGreaterThanOrEqual(300);
      expect(metrics.timeToInteractive).toBeLessThanOrEqual(500);
    });
  });

  describe('simulateCloudFrontMetrics', () => {
    it('should simulate CloudFront metrics', () => {
      const baseMetrics: CacheLayerMetrics = {
        strategy: 'cloudfront-cache',
        hits: 90,
        misses: 10,
        totalRequests: 100,
        hitRate: 90,
        avgResponseTime: 50,
        cacheSize: 1048576, // 1MB
      } as CacheLayerMetrics;

      const cloudFrontMetrics = simulateCloudFrontMetrics(baseMetrics);

      expect(cloudFrontMetrics.edgeLocation).toBeTruthy();
      expect(cloudFrontMetrics.hitRate).toBeLessThanOrEqual(baseMetrics.hitRate);
      expect(cloudFrontMetrics.missRate).toBe(100 - cloudFrontMetrics.hitRate);
      expect(cloudFrontMetrics.bandwidth.total).toBe(1); // 1MB
      expect(cloudFrontMetrics.latency.edge).toBeGreaterThan(0);
      expect(cloudFrontMetrics.latency.origin).toBeGreaterThan(cloudFrontMetrics.latency.edge);
    });
  });

  describe('compareStrategies', () => {
    it('should compare different cache strategies', () => {
      const metrics: Record<CacheStrategy, CacheLayerMetrics> = {
        'data-cache': {
          strategy: 'data-cache',
          hits: 90,
          misses: 10,
          totalRequests: 100,
          hitRate: 90,
          avgResponseTime: 50,
          cacheSize: 10240,
        } as CacheLayerMetrics,
        'full-route-cache': {
          strategy: 'full-route-cache',
          hits: 80,
          misses: 20,
          totalRequests: 100,
          hitRate: 80,
          avgResponseTime: 30,
          cacheSize: 20480,
        } as CacheLayerMetrics,
        'router-cache': createDefaultLayerMetrics('router-cache'),
        'request-memoization': createDefaultLayerMetrics('request-memoization'),
        'cloudfront-cache': createDefaultLayerMetrics('cloudfront-cache'),
      };

      const comparison = compareStrategies(metrics);

      expect(comparison.strategies).toHaveLength(5);
      expect(comparison.metrics).toBeDefined();
      expect(comparison.winner).toBeDefined();
      expect(comparison.winner.strategy).toBeTruthy();
      expect(comparison.winner.score).toBeGreaterThan(0);
      expect(comparison.recommendations).toHaveLength(2);
    });
  });

  describe('evaluateCacheHealth', () => {
    it('should evaluate cache health as healthy', () => {
      const metrics: CacheMetrics = {
        layers: {
          'data-cache': {
            strategy: 'data-cache',
            hits: 90,
            misses: 10,
            totalRequests: 100,
            hitRate: 90,
            avgResponseTime: 50,
            cacheSize: 10240,
          } as CacheLayerMetrics,
          'full-route-cache': {
            strategy: 'full-route-cache',
            hits: 80,
            misses: 20,
            totalRequests: 100,
            hitRate: 80,
            avgResponseTime: 60,
            cacheSize: 8192,
          } as CacheLayerMetrics,
          'router-cache': {
            strategy: 'router-cache',
            hits: 70,
            misses: 30,
            totalRequests: 100,
            hitRate: 70,
            avgResponseTime: 40,
            cacheSize: 4096,
          } as CacheLayerMetrics,
          'request-memoization': {
            strategy: 'request-memoization',
            hits: 60,
            misses: 40,
            totalRequests: 100,
            hitRate: 60,
            avgResponseTime: 30,
            cacheSize: 2048,
          } as CacheLayerMetrics,
          'cloudfront-cache': {
            strategy: 'cloudfront-cache',
            hits: 85,
            misses: 15,
            totalRequests: 100,
            hitRate: 85,
            avgResponseTime: 25,
            cacheSize: 16384,
          } as CacheLayerMetrics,
        },
        overall: {
          totalHits: 90,
          totalMisses: 10,
          overallHitRate: 90,
          totalCacheSize: 10240,
          efficiencyScore: 85,
        },
        performance: generatePerformanceMetrics(),
        revalidation: {
          revalidationCount: 0,
          avgRevalidationTime: 0,
          failedRevalidations: 0,
        },
        timestamp: new Date().toISOString(),
      };

      const health = evaluateCacheHealth(metrics);

      expect(health.overall).toBe('healthy');
      expect(health.layers['data-cache'].status).toBe('healthy');
      expect(health.alerts).toHaveLength(0);
      expect(health.uptime).toBe(99.9);
    });

    it('should evaluate cache health as warning', () => {
      const metrics: CacheMetrics = {
        layers: {
          'data-cache': {
            strategy: 'data-cache',
            hits: 40,
            misses: 60,
            totalRequests: 100,
            hitRate: 40,
            avgResponseTime: 200,
            cacheSize: 10240,
          } as CacheLayerMetrics,
          'full-route-cache': createDefaultLayerMetrics('full-route-cache'),
          'router-cache': createDefaultLayerMetrics('router-cache'),
          'request-memoization': createDefaultLayerMetrics('request-memoization'),
          'cloudfront-cache': createDefaultLayerMetrics('cloudfront-cache'),
        },
        overall: {
          totalHits: 40,
          totalMisses: 60,
          overallHitRate: 40,
          totalCacheSize: 10240,
          efficiencyScore: 50,
        },
        performance: generatePerformanceMetrics(),
        revalidation: {
          revalidationCount: 0,
          avgRevalidationTime: 0,
          failedRevalidations: 0,
        },
        timestamp: new Date().toISOString(),
      };

      const health = evaluateCacheHealth(metrics);

      expect(health.layers['data-cache'].status).toBe('warning');
      expect(health.layers['data-cache'].issues).toContain('Low hit rate');
      expect(health.alerts).toHaveLength(1);
    });
  });

  describe('generateRecommendations', () => {
    it('should generate recommendations for low hit rate', () => {
      const metrics: CacheMetrics = {
        layers: {
          'data-cache': {
            strategy: 'data-cache',
            hits: 50,
            misses: 50,
            totalRequests: 100,
            hitRate: 50,
            avgResponseTime: 100,
            cacheSize: 10240,
          } as CacheLayerMetrics,
          'full-route-cache': createDefaultLayerMetrics('full-route-cache'),
          'router-cache': createDefaultLayerMetrics('router-cache'),
          'request-memoization': createDefaultLayerMetrics('request-memoization'),
          'cloudfront-cache': createDefaultLayerMetrics('cloudfront-cache'),
        },
        overall: {
          totalHits: 50,
          totalMisses: 50,
          overallHitRate: 50,
          totalCacheSize: 10240,
          efficiencyScore: 60,
        },
        performance: generatePerformanceMetrics(),
        revalidation: {
          revalidationCount: 0,
          avgRevalidationTime: 0,
          failedRevalidations: 0,
        },
        timestamp: new Date().toISOString(),
      };

      const health = evaluateCacheHealth(metrics);
      const recommendations = generateRecommendations(metrics, health);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.type === 'cache-strategy')).toBe(true);
      expect(recommendations[0].priority).toBe('high');
      expect(recommendations[0].implementation.steps.length).toBeGreaterThan(0);
    });

    it('should generate recommendations for slow response times', () => {
      const metrics: CacheMetrics = {
        layers: {
          'data-cache': {
            strategy: 'data-cache',
            hits: 90,
            misses: 10,
            totalRequests: 100,
            hitRate: 90,
            avgResponseTime: 300,
            cacheSize: 10240,
          } as CacheLayerMetrics,
          'full-route-cache': {
            strategy: 'full-route-cache',
            hits: 80,
            misses: 20,
            totalRequests: 100,
            hitRate: 80,
            avgResponseTime: 250,
            cacheSize: 8192,
          } as CacheLayerMetrics,
          'router-cache': {
            strategy: 'router-cache',
            hits: 70,
            misses: 30,
            totalRequests: 100,
            hitRate: 70,
            avgResponseTime: 200,
            cacheSize: 4096,
          } as CacheLayerMetrics,
          'request-memoization': {
            strategy: 'request-memoization',
            hits: 60,
            misses: 40,
            totalRequests: 100,
            hitRate: 60,
            avgResponseTime: 180,
            cacheSize: 2048,
          } as CacheLayerMetrics,
          'cloudfront-cache': {
            strategy: 'cloudfront-cache',
            hits: 85,
            misses: 15,
            totalRequests: 100,
            hitRate: 85,
            avgResponseTime: 220,
            cacheSize: 16384,
          } as CacheLayerMetrics,
        },
        overall: {
          totalHits: 90,
          totalMisses: 10,
          overallHitRate: 90,
          totalCacheSize: 10240,
          efficiencyScore: 75,
        },
        performance: generatePerformanceMetrics(),
        revalidation: {
          revalidationCount: 0,
          avgRevalidationTime: 0,
          failedRevalidations: 0,
        },
        timestamp: new Date().toISOString(),
      };

      const health = evaluateCacheHealth(metrics);
      const recommendations = generateRecommendations(metrics, health);

      expect(recommendations.some(r => r.type === 'optimization')).toBe(true);
    });
  });
});