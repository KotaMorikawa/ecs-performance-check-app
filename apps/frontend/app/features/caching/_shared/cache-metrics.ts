// キャッシュメトリクス計算ユーティリティ

import {
  CacheStrategy,
  CacheLayerMetrics,
  CacheMetrics,
  CacheApiResponse,
  CacheComparisonResult,
  CloudFrontCacheMetrics,
  CacheHealthStatus,
  PerformanceRecommendation,
} from './types';

// キャッシュレイヤーのデフォルトメトリクス
export function createDefaultLayerMetrics(strategy: CacheStrategy): CacheLayerMetrics {
  return {
    strategy,
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRate: 0,
    avgResponseTime: 0,
    cacheSize: 0,
    lastRevalidated: undefined,
    ttl: undefined,
  };
}

// キャッシュヒット率の計算
export function calculateHitRate(hits: number, misses: number): number {
  const total = hits + misses;
  if (total === 0) return 0;
  return Math.round((hits / total) * 100);
}

// キャッシュ効率スコアの計算（0-100）
export function calculateEfficiencyScore(
  hitRate: number,
  avgResponseTime: number,
  targetResponseTime = 100 // ms
): number {
  // ヒット率の重み: 70%
  const hitRateScore = hitRate * 0.7;
  
  // レスポンス時間の重み: 30%
  const responseScore = Math.max(0, Math.min(100, 
    (1 - avgResponseTime / targetResponseTime) * 100
  )) * 0.3;
  
  return Math.round(hitRateScore + responseScore);
}

// APIレスポンスからレイヤーメトリクスを更新
export function updateLayerMetrics(
  currentMetrics: CacheLayerMetrics,
  response: CacheApiResponse<unknown>
): CacheLayerMetrics {
  const isHit = response.metrics.cacheHit;
  const newHits = currentMetrics.hits + (isHit ? 1 : 0);
  const newMisses = currentMetrics.misses + (isHit ? 0 : 1);
  const newTotal = currentMetrics.totalRequests + 1;
  
  // 移動平均でレスポンス時間を更新
  const newAvgResponseTime = (
    currentMetrics.avgResponseTime * currentMetrics.totalRequests +
    response.metrics.fetchTime
  ) / newTotal;

  return {
    ...currentMetrics,
    hits: newHits,
    misses: newMisses,
    totalRequests: newTotal,
    hitRate: calculateHitRate(newHits, newMisses),
    avgResponseTime: Math.round(newAvgResponseTime),
    cacheSize: currentMetrics.cacheSize + response.metrics.dataSize,
    lastRevalidated: response.metadata.timestamp,
    ttl: response.metadata.ttl,
  };
}

// 総合キャッシュメトリクスの計算
export function calculateOverallMetrics(
  layers: Record<CacheStrategy, CacheLayerMetrics>
): CacheMetrics['overall'] {
  const layerValues = Object.values(layers);
  
  const totalHits = layerValues.reduce((sum, layer) => sum + layer.hits, 0);
  const totalMisses = layerValues.reduce((sum, layer) => sum + layer.misses, 0);
  const totalCacheSize = layerValues.reduce((sum, layer) => sum + layer.cacheSize, 0);
  
  const overallHitRate = calculateHitRate(totalHits, totalMisses);
  
  // 効率スコアは各レイヤーの重み付き平均
  const efficiencyScore = layerValues.reduce((sum, layer) => {
    const weight = layer.totalRequests / Math.max(1, 
      layerValues.reduce((s, l) => s + l.totalRequests, 0)
    );
    return sum + calculateEfficiencyScore(layer.hitRate, layer.avgResponseTime) * weight;
  }, 0);

  return {
    totalHits,
    totalMisses,
    overallHitRate,
    totalCacheSize,
    efficiencyScore: Math.round(efficiencyScore),
  };
}

// パフォーマンスメトリクスのモック生成（デモ用）
export function generatePerformanceMetrics(): CacheMetrics['performance'] {
  return {
    dataFetchTime: Math.random() * 50 + 10, // 10-60ms
    renderTime: Math.random() * 30 + 20, // 20-50ms
    hydrationTime: Math.random() * 20 + 10, // 10-30ms
    timeToFirstByte: Math.random() * 100 + 50, // 50-150ms
    timeToInteractive: Math.random() * 200 + 300, // 300-500ms
  };
}

// CloudFrontキャッシュメトリクスのシミュレーション
export function simulateCloudFrontMetrics(
  baseMetrics: CacheLayerMetrics
): CloudFrontCacheMetrics {
  const regions = ['Tokyo', 'Singapore', 'Sydney', 'London', 'Frankfurt', 'New York'];
  const selectedRegion = regions[Math.floor(Math.random() * regions.length)];
  
  // 地域による遅延のシミュレーション
  const latencyMap: Record<string, { edge: number; origin: number }> = {
    'Tokyo': { edge: 10, origin: 50 },
    'Singapore': { edge: 20, origin: 100 },
    'Sydney': { edge: 25, origin: 120 },
    'London': { edge: 80, origin: 200 },
    'Frankfurt': { edge: 90, origin: 210 },
    'New York': { edge: 100, origin: 250 },
  };

  const latency = latencyMap[selectedRegion] || { edge: 50, origin: 150 };
  const hitRate = baseMetrics.hitRate * 0.9; // CloudFrontは少し低めのヒット率
  
  return {
    edgeLocation: selectedRegion,
    hitRate,
    missRate: 100 - hitRate,
    originRequestRate: 100 - hitRate,
    bandwidth: {
      saved: (baseMetrics.cacheSize * hitRate / 100) / 1024 / 1024, // MB
      total: baseMetrics.cacheSize / 1024 / 1024, // MB
    },
    latency,
    geolocation: {
      region: 'Asia Pacific',
      country: 'Japan',
      city: selectedRegion,
    },
  };
}

// キャッシュ戦略の比較
export function compareStrategies(
  metrics: Record<CacheStrategy, CacheLayerMetrics>
): CacheComparisonResult {
  const strategies = Object.keys(metrics) as CacheStrategy[];
  
  // 各戦略のスコア計算
  const scores = strategies.reduce((acc, strategy) => {
    const layerMetrics = metrics[strategy];
    const efficiency = calculateEfficiencyScore(
      layerMetrics.hitRate,
      layerMetrics.avgResponseTime
    );
    
    acc[strategy] = {
      performance: Math.min(100, Math.round(200 / Math.max(1, layerMetrics.avgResponseTime))),
      efficiency,
      reliability: layerMetrics.totalRequests > 0 ? 95 : 0,
      complexity: strategy === 'request-memoization' ? 20 : 
                  strategy === 'data-cache' ? 40 :
                  strategy === 'router-cache' ? 50 :
                  strategy === 'full-route-cache' ? 60 : 80,
    };
    
    return acc;
  }, {} as CacheComparisonResult['metrics']);

  // 最高スコアの戦略を決定
  let winner: CacheStrategy = 'data-cache';
  let highestScore = 0;
  
  strategies.forEach(strategy => {
    const score = scores[strategy];
    const totalScore = score.performance + score.efficiency + score.reliability - score.complexity;
    if (totalScore > highestScore) {
      highestScore = totalScore;
      winner = strategy;
    }
  });

  return {
    strategies,
    metrics: scores,
    recommendations: [
      {
        bestFor: 'Static content with rare updates',
        worstFor: 'Real-time data',
        useCase: 'Product pages, blog posts',
        pros: ['Excellent performance', 'Low server load', 'CDN friendly'],
        cons: ['Stale data risk', 'Complex invalidation'],
      },
      {
        bestFor: 'Dynamic content with moderate updates',
        worstFor: 'User-specific data',
        useCase: 'Category pages, search results',
        pros: ['Good balance', 'Flexible revalidation'],
        cons: ['Memory usage', 'Cache management overhead'],
      },
    ],
    winner: {
      strategy: winner,
      score: highestScore,
      reason: 'Best overall balance of performance, efficiency, and reliability',
    },
  };
}

// キャッシュヘルス状態の評価
export function evaluateCacheHealth(
  metrics: CacheMetrics
): CacheHealthStatus {
  const layers = metrics.layers;
  const layerStatuses = {} as Record<CacheStrategy, { status: 'healthy' | 'warning' | 'critical'; issues: string[]; lastCheck: string; }>;
  
  // 各レイヤーの健全性評価
  Object.entries(layers).forEach(([strategy, layerMetrics]) => {
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (layerMetrics.hitRate < 50) {
      issues.push('Low hit rate');
      status = 'warning';
    }
    if (layerMetrics.hitRate < 20) {
      status = 'critical';
    }
    if (layerMetrics.avgResponseTime > 500) {
      issues.push('Slow response time');
      status = status === 'critical' ? 'critical' : 'warning';
    }
    
    layerStatuses[strategy as CacheStrategy] = {
      status,
      issues,
      lastCheck: new Date().toISOString(),
    };
  });

  // 全体の健全性判定
  const statusValues = Object.values(layerStatuses);
  const criticalCount = statusValues.filter(s => s.status === 'critical').length;
  const warningCount = statusValues.filter(s => s.status === 'warning').length;
  
  let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (criticalCount > 0) overall = 'critical';
  else if (warningCount > 2) overall = 'warning';

  return {
    overall,
    layers: layerStatuses,
    alerts: metrics.overall.efficiencyScore < 60 ? [{
      level: 'warning',
      message: 'Overall cache efficiency is below optimal levels',
      timestamp: new Date().toISOString(),
      acknowledged: false,
    }] : [],
    uptime: 99.9, // 仮の値
    lastIncident: undefined,
  };
}

// パフォーマンス改善の推奨事項生成
export function generateRecommendations(
  metrics: CacheMetrics,
  health: CacheHealthStatus
): PerformanceRecommendation[] {
  const recommendations: PerformanceRecommendation[] = [];

  // ヒット率が低い場合
  if (metrics.overall.overallHitRate < 70) {
    recommendations.push({
      type: 'cache-strategy',
      priority: 'high',
      title: 'Improve Cache Hit Rate',
      description: 'Your cache hit rate is below optimal levels. Consider increasing cache duration or implementing more aggressive caching strategies.',
      expectedImprovement: '30% faster load times',
      implementation: {
        complexity: 'medium',
        timeRequired: '2-4 hours',
        steps: [
          'Analyze cache miss patterns',
          'Increase revalidation time for stable content',
          'Implement tag-based caching for dynamic content',
          'Add cache warming strategies',
        ],
      },
      metrics: {
        before: metrics.overall.overallHitRate,
        after: 85,
        unit: '%',
      },
    });
  }

  // レスポンス時間が遅い場合
  const avgResponseTime = Object.values(metrics.layers).reduce(
    (sum, layer) => sum + layer.avgResponseTime,
    0
  ) / Object.keys(metrics.layers).length;
  
  if (avgResponseTime > 200) {
    recommendations.push({
      type: 'optimization',
      priority: 'medium',
      title: 'Optimize Response Times',
      description: 'Response times are higher than recommended. Consider implementing edge caching or optimizing data fetching.',
      expectedImprovement: '50% reduction in response time',
      implementation: {
        complexity: 'hard',
        timeRequired: '1-2 days',
        steps: [
          'Enable CloudFront edge caching',
          'Implement request batching',
          'Optimize database queries',
          'Add connection pooling',
        ],
      },
      metrics: {
        before: Math.round(avgResponseTime),
        after: 100,
        unit: 'ms',
      },
    });
  }

  // 健全性に問題がある場合
  if (health.overall !== 'healthy') {
    recommendations.push({
      type: 'monitoring',
      priority: 'high',
      title: 'Enhance Cache Monitoring',
      description: 'Cache health issues detected. Implement better monitoring to prevent performance degradation.',
      expectedImprovement: '99.9% cache availability',
      implementation: {
        complexity: 'easy',
        timeRequired: '2-4 hours',
        steps: [
          'Set up cache metrics dashboard',
          'Configure alerts for low hit rates',
          'Implement cache health checks',
          'Add automated recovery procedures',
        ],
      },
      metrics: {
        before: 95,
        after: 99.9,
        unit: '% uptime',
      },
    });
  }

  return recommendations;
}

// キャッシュサイズのフォーマット
export function formatCacheSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

// TTLのフォーマット
export function formatTTL(seconds?: number): string {
  if (!seconds) return 'No TTL';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}