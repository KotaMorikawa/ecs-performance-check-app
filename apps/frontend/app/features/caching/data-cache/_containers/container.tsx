import { Suspense } from 'react';
import { DataCachePresentational } from './presentational';
import { cacheTestApi } from '../../_shared/cache-api-client';
import {
  CacheMetrics,
  CacheLayerMetrics,
  CacheTestData,
} from '../../_shared/types';
import {
  updateLayerMetrics,
  calculateOverallMetrics,
  generatePerformanceMetrics,
} from '../../_shared/cache-metrics';

// Server Component（データ取得・統合レイヤー）
export async function DataCacheContainer() {
  // 初期メトリクスの生成
  const initialMetrics: CacheMetrics = {
    layers: {
      'data-cache': {
        strategy: 'data-cache',
        hits: 0,
        misses: 0,
        totalRequests: 0,
        hitRate: 0,
        avgResponseTime: 0,
        cacheSize: 0,
      } as CacheLayerMetrics,
      'full-route-cache': { strategy: 'full-route-cache', hits: 0, misses: 0, totalRequests: 0, hitRate: 0, avgResponseTime: 0, cacheSize: 0 } as CacheLayerMetrics,
      'router-cache': { strategy: 'router-cache', hits: 0, misses: 0, totalRequests: 0, hitRate: 0, avgResponseTime: 0, cacheSize: 0 } as CacheLayerMetrics,
      'request-memoization': { strategy: 'request-memoization', hits: 0, misses: 0, totalRequests: 0, hitRate: 0, avgResponseTime: 0, cacheSize: 0 } as CacheLayerMetrics,
      'cloudfront-cache': { strategy: 'cloudfront-cache', hits: 0, misses: 0, totalRequests: 0, hitRate: 0, avgResponseTime: 0, cacheSize: 0 } as CacheLayerMetrics,
    },
    overall: {
      totalHits: 0,
      totalMisses: 0,
      overallHitRate: 0,
      totalCacheSize: 0,
      efficiencyScore: 0,
    },
    performance: generatePerformanceMetrics(),
    revalidation: {
      revalidationCount: 0,
      avgRevalidationTime: 0,
      failedRevalidations: 0,
    },
    timestamp: new Date().toISOString(),
  };

  let testData: CacheTestData[] = [];
  let error: string | null = null;

  try {
    // 異なるキャッシュ戦略でデータを取得
    // 1. 通常のキャッシュ（60秒）
    const cachedResponse = await cacheTestApi.getTestData({
      next: {
        revalidate: 60,
        tags: ['cache-test'],
      },
    }, 'data-cache');

    testData = cachedResponse.data;

    // メトリクスを更新
    const updatedDataCacheMetrics = updateLayerMetrics(
      initialMetrics.layers['data-cache'],
      cachedResponse
    );
    
    initialMetrics.layers['data-cache'] = updatedDataCacheMetrics;
    initialMetrics.overall = calculateOverallMetrics(initialMetrics.layers);
    initialMetrics.timestamp = new Date().toISOString();

  } catch (err) {
    console.error('Data cache fetch error:', err);
    error = err instanceof Error ? err.message : 'Unknown error';
  }

  return (
    <Suspense fallback={<div>Loading data cache demo...</div>}>
      <DataCachePresentational 
        initialData={testData}
        initialMetadata={null}
        initialMetrics={null}
        error={error}
      />
    </Suspense>
  );
}