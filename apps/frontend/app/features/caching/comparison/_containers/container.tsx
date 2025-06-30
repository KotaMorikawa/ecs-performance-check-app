import { Suspense } from 'react';
import { CacheComparisonPresentational } from './presentational';
import { cacheTestApi } from '../../_shared/cache-api-client';
import { compareStrategies, generateRecommendations, evaluateCacheHealth } from '../../_shared/cache-metrics';
import type { CacheStrategy, CacheLayerMetrics, CacheApiResponse, CacheTestData } from '../../_shared/types';

// Server Component（データ取得・統合レイヤー）
export async function CacheComparisonContainer() {
  const startTime = performance.now();
  
  try {
    // 各キャッシュ戦略のデータを並行取得
    const comparisonData = await cacheTestApi.getComparisonData();
    
    // メトリクス計算
    const layerMetrics = {} as Record<CacheStrategy, CacheLayerMetrics>;
    
    Object.entries(comparisonData).forEach(([strategy, response]) => {
      layerMetrics[strategy as CacheStrategy] = {
        strategy: strategy as CacheStrategy,
        hits: response.metadata.cached ? 1 : 0,
        misses: response.metadata.cached ? 0 : 1,
        totalRequests: 1,
        hitRate: response.metadata.cached ? 100 : 0,
        avgResponseTime: response.metrics.fetchTime,
        cacheSize: response.metrics.dataSize,
        lastRevalidated: response.metadata.timestamp,
        ttl: response.metadata.ttl,
      };
    });

    // 比較結果生成
    const comparison = compareStrategies(layerMetrics);
    
    // 全体メトリクス計算
    const overallMetrics = {
      layers: layerMetrics,
      overall: {
        totalHits: Object.values(layerMetrics).reduce((sum, layer) => sum + layer.hits, 0),
        totalMisses: Object.values(layerMetrics).reduce((sum, layer) => sum + layer.misses, 0),
        overallHitRate: 0,
        totalCacheSize: Object.values(layerMetrics).reduce((sum, layer) => sum + layer.cacheSize, 0),
        efficiencyScore: 85,
      },
      performance: {
        dataFetchTime: performance.now() - startTime,
        renderTime: 50,
        hydrationTime: 20,
        timeToFirstByte: 100,
        timeToInteractive: 300,
      },
      revalidation: {
        lastRevalidation: new Date().toISOString(),
        revalidationCount: 0,
        avgRevalidationTime: 0,
        failedRevalidations: 0,
      },
      timestamp: new Date().toISOString(),
    };

    // ヘルス評価
    const health = evaluateCacheHealth(overallMetrics);
    
    // 推奨事項生成
    const recommendations = generateRecommendations(overallMetrics, health);
    const endTime = performance.now();

    return (
      <Suspense fallback={<div>Loading cache comparison...</div>}>
        <CacheComparisonPresentational 
          comparisonData={comparisonData}
          comparisonResult={comparison}
          overallMetrics={overallMetrics}
          health={health}
          recommendations={recommendations}
          renderTime={endTime - startTime}
          error={null}
        />
      </Suspense>
    );
  } catch (err) {
    console.error('Cache comparison error:', err);
    
    return (
      <Suspense fallback={<div>Loading cache comparison...</div>}>
        <CacheComparisonPresentational 
          comparisonData={{} as Record<CacheStrategy, CacheApiResponse<CacheTestData[]>>}
          comparisonResult={null}
          overallMetrics={null}
          health={null}
          recommendations={[]}
          renderTime={50}
          error={err instanceof Error ? err.message : 'Unknown error'}
        />
      </Suspense>
    );
  }
}