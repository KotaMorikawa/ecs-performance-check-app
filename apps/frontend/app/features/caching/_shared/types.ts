// キャッシュ機能の共通型定義

// キャッシュ戦略の種類
export type CacheStrategy =
  | "data-cache" // Next.js Data Cache (fetch API)
  | "full-route-cache" // Next.js Full Route Cache (pages)
  | "router-cache" // Next.js Router Cache (client navigation)
  | "request-memoization" // Request Memoization (same request)
  | "cloudfront-cache"; // CloudFront Edge Cache

// キャッシュ操作の種類
export type CacheOperation = "read" | "write" | "hit" | "miss" | "revalidate" | "invalidate";

// リバリデート戦略
export type RevalidationStrategy =
  | "time-based" // 時間ベース（revalidate: 60）
  | "on-demand" // オンデマンド（revalidatePath/Tag）
  | "manual" // 手動リバリデート
  | "webhook"; // バックエンドからの通知

// キャッシュ状態
export type CacheStatus =
  | "hit" // キャッシュヒット
  | "miss" // キャッシュミス
  | "fresh" // 新鮮なデータ
  | "stale" // 古いデータ
  | "revalidating" // リバリデート中
  | "error" // エラー状態
  | "empty"; // キャッシュなし

// キャッシュレイヤー詳細メトリクス
export interface CacheLayerMetrics {
  strategy: CacheStrategy;
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
  avgResponseTime: number;
  cacheSize: number;
  lastRevalidated?: string;
  ttl?: number; // Time To Live (seconds)
}

// 総合キャッシュメトリクス
export interface CacheMetrics {
  layers: Record<CacheStrategy, CacheLayerMetrics>;
  overall: {
    totalHits: number;
    totalMisses: number;
    overallHitRate: number;
    totalCacheSize: number;
    efficiencyScore: number; // 0-100
  };
  performance: {
    dataFetchTime: number;
    renderTime: number;
    hydrationTime: number;
    timeToFirstByte: number;
    timeToInteractive: number;
  };
  revalidation: {
    lastRevalidation?: string;
    revalidationCount: number;
    avgRevalidationTime: number;
    failedRevalidations: number;
  };
  timestamp: string;
}

// リバリデート操作の詳細
export interface RevalidationOperation {
  type: "path" | "tag" | "full";
  target: string; // パス、タグ名、または'all'
  strategy: RevalidationStrategy;
  triggeredBy: "user" | "backend" | "timer" | "webhook";
  timestamp: string;
  duration?: number;
  success: boolean;
  error?: string;
}

// キャッシュ設定オプション
export interface CacheOptions {
  strategy: CacheStrategy;
  revalidate?: number | false;
  tags?: string[];
  force?: boolean; // キャッシュを無視して強制取得
  timeout?: number;
}

// キャッシュ対応フェッチオプション
export interface CacheFetchOptions {
  cache?: RequestCache | "no-store" | "force-cache";
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// キャッシュAPI レスポンス
export interface CacheApiResponse<T> {
  data: T;
  metadata: {
    cached: boolean;
    cacheStatus: CacheStatus;
    strategy: CacheStrategy;
    timestamp: string;
    source: string; // 'cache' | 'network' | 'fallback'
    ttl?: number;
    tags?: string[];
  };
  metrics: {
    fetchTime: number;
    dataSize: number;
    cacheHit: boolean;
  };
}

// キャッシュデモ用のサンプルデータ
export interface CacheTestData {
  id: number;
  title: string;
  content: string;
  category: string;
  timestamp: string;
  size: number;
  views: number;
  name: string;
  postCount: number;
  description: string;
}

// キャッシュ比較結果
export interface CacheComparisonResult {
  strategies: CacheStrategy[];
  metrics: Record<
    CacheStrategy,
    {
      performance: number; // 0-100 score
      efficiency: number; // 0-100 score
      reliability: number; // 0-100 score
      complexity: number; // 0-100 score (lower is better)
    }
  >;
  recommendations: {
    bestFor: string;
    worstFor: string;
    useCase: string;
    pros: string[];
    cons: string[];
  }[];
  winner: {
    strategy: CacheStrategy;
    score: number;
    reason: string;
  };
}

// CloudFront キャッシュシミュレーション
export interface CloudFrontCacheMetrics {
  edgeLocation: string;
  hitRate: number;
  missRate: number;
  originRequestRate: number;
  bandwidth: {
    saved: number; // MB
    total: number; // MB
  };
  latency: {
    edge: number; // ms from edge
    origin: number; // ms from origin
  };
  geolocation: {
    region: string;
    country: string;
    city: string;
  };
}

// パフォーマンス改善提案
export interface PerformanceRecommendation {
  type: "cache-strategy" | "revalidation" | "optimization" | "monitoring";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  expectedImprovement: string; // e.g., "20% faster load time"
  implementation: {
    complexity: "easy" | "medium" | "hard";
    timeRequired: string;
    steps: string[];
  };
  metrics: {
    before: number;
    after: number;
    unit: string;
  };
}

// キャッシュ無効化イベント
export interface CacheInvalidationEvent {
  id: string;
  timestamp: string;
  type: "manual" | "automatic" | "webhook" | "schedule";
  scope: "path" | "tag" | "all";
  target: string;
  reason: string;
  triggeredBy: string;
  affectedPages: number;
  duration: number;
  success: boolean;
  error?: string;
}

// キャッシュヘルス状態
export interface CacheHealthStatus {
  overall: "healthy" | "warning" | "critical";
  layers: Record<
    CacheStrategy,
    {
      status: "healthy" | "warning" | "critical";
      issues: string[];
      lastCheck: string;
    }
  >;
  alerts: {
    level: "info" | "warning" | "error";
    message: string;
    timestamp: string;
    acknowledged: boolean;
  }[];
  uptime: number; // percentage
  lastIncident?: string;
}

// エクスポート用の統合型
export interface CachingDemoState {
  metrics: CacheMetrics;
  testData: CacheTestData[];
  operations: CacheOperation[];
  revalidations: RevalidationOperation[];
  comparison?: CacheComparisonResult;
  health: CacheHealthStatus;
  recommendations: PerformanceRecommendation[];
  events: CacheInvalidationEvent[];
}
