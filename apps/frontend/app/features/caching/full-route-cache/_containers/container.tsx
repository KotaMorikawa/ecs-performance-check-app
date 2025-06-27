import { Suspense } from 'react';
import { FullRouteCachePresentational } from './presentational';
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

interface FullRouteCacheContainerProps {
  mode?: 'static' | 'isr' | 'dynamic';
}

// Server Component（データ取得・統合レイヤー）
export async function FullRouteCacheContainer({ 
  mode = 'static' 
}: FullRouteCacheContainerProps = {}) {
  // 初期メトリクスの生成
  const initialMetrics: CacheMetrics = {
    layers: {
      'data-cache': { strategy: 'data-cache', hits: 0, misses: 0, totalRequests: 0, hitRate: 0, avgResponseTime: 0, cacheSize: 0 } as CacheLayerMetrics,
      'full-route-cache': {
        strategy: 'full-route-cache',
        hits: 0,
        misses: 0,
        totalRequests: 0,
        hitRate: 0,
        avgResponseTime: 0,
        cacheSize: 0,
      } as CacheLayerMetrics,
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
  let cacheInfo = {
    renderTime: new Date().toISOString(),
    mode,
    cached: false,
  };

  try {
    const startTime = performance.now();

    // モード別のキャッシュ戦略
    let response;
    
    switch (mode) {
      case 'static':
        // 静的生成（ビルド時キャッシュ、revalidateなし）
        response = await cacheTestApi.getTestData({
          cache: 'force-cache',
        }, 'full-route-cache');
        cacheInfo.cached = true;
        break;
        
      case 'isr':
        // ISR（120秒でリバリデート）
        response = await cacheTestApi.getTestData({
          next: {
            revalidate: 120,
            tags: ['full-route-cache', 'isr'],
          },
        }, 'full-route-cache');
        break;
        
      case 'dynamic':
        // 動的生成（キャッシュなし）
        response = await cacheTestApi.getTestData({
          cache: 'no-store',
        }, 'full-route-cache');
        break;
        
      default:
        response = await cacheTestApi.getTestData({}, 'full-route-cache');
    }

    testData = response.data;
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Full Route Cache メトリクスを更新
    const simulatedResponse = {
      ...response,
      metadata: {
        ...response.metadata,
        cached: mode === 'static' || response.metadata.cached,
      },
      metrics: {
        ...response.metrics,
        fetchTime: renderTime,
      },
    };

    const updatedFullRouteCacheMetrics = updateLayerMetrics(
      initialMetrics.layers['full-route-cache'],
      simulatedResponse
    );
    
    initialMetrics.layers['full-route-cache'] = updatedFullRouteCacheMetrics;
    initialMetrics.overall = calculateOverallMetrics(initialMetrics.layers);
    initialMetrics.performance.renderTime = renderTime;
    initialMetrics.timestamp = new Date().toISOString();

    cacheInfo = {
      renderTime: new Date().toISOString(),
      mode,
      cached: simulatedResponse.metadata.cached,
    };

  } catch (err) {
    console.error('Full route cache fetch error:', err);
    error = err instanceof Error ? err.message : 'Unknown error';
  }

  return (
    <Suspense fallback={<div>Loading full route cache demo...</div>}>
      <FullRouteCachePresentational 
        initialData={testData}
        initialMetrics={initialMetrics}
        cacheInfo={cacheInfo}
        error={error}
      />
    </Suspense>
  );
}