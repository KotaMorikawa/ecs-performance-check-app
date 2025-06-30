import { Suspense } from 'react';
import { RouterCachePresentational } from './presentational';
import {
  CacheMetrics,
  CacheLayerMetrics,
} from '../../_shared/types';

// Server Component（データ取得・統合レイヤー）
export async function RouterCacheContainer() {
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
    performance: {
      dataFetchTime: 0,
      renderTime: 0,
      hydrationTime: 0,
      timeToFirstByte: 0,
      timeToInteractive: 0,
    },
    revalidation: {
      revalidationCount: 0,
      avgRevalidationTime: 0,
      failedRevalidations: 0,
    },
    timestamp: new Date().toISOString(),
  };

  // Router Cacheは実際のルーターキャッシュ機能をデモするため、
  // データ取得は行わずクライアント側でのナビゲーション動作を重視
  try {
    // メトリクスのタイムスタンプを更新
    initialMetrics.timestamp = new Date().toISOString();
  } catch (err) {
    console.error('Router cache fetch error:', err);
  }

  return (
    <Suspense fallback={<div>Loading router cache demo...</div>}>
      <RouterCachePresentational />
    </Suspense>
  );
}