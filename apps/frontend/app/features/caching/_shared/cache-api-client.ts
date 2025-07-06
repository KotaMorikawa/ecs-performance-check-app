// キャッシュ機能専用のAPIクライアント

import type {
  CacheApiResponse,
  CacheFetchOptions,
  CacheInvalidationEvent,
  CacheStatus,
  CacheStrategy,
  CacheTestData,
  RevalidationOperation,
} from "./types";

const API_BASE_URL = process.env.API_URL || "http://localhost:8000";

class CacheApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "CacheApiError";
  }
}

// キャッシュヘッダー解析
function parseCacheHeaders(headers: Headers): {
  cacheStatus: CacheStatus;
  cached: boolean;
  ttl?: number;
  strategy?: CacheStrategy;
} {
  const xCache = headers.get("x-nextjs-cache");
  const cacheControl = headers.get("cache-control");
  const age = headers.get("age");

  let cacheStatus: CacheStatus = "empty";
  let cached = false;
  let ttl: number | undefined;

  // Next.js キャッシュステータス判定
  if (xCache === "HIT") {
    cacheStatus = "fresh";
    cached = true;
  } else if (xCache === "STALE") {
    cacheStatus = "stale";
    cached = true;
  } else if (xCache === "MISS") {
    cacheStatus = "empty";
    cached = false;
  }

  // TTL計算（Cache-Controlから）
  if (cacheControl) {
    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
    if (maxAgeMatch) {
      const maxAge = parseInt(maxAgeMatch[1], 10);
      const currentAge = age ? parseInt(age, 10) : 0;
      ttl = Math.max(0, maxAge - currentAge);
    }
  }

  return { cacheStatus, cached, ttl };
}

// キャッシュ対応フェッチ関数
async function fetchWithCache<T>(
  url: string,
  options: CacheFetchOptions = {},
  strategy: CacheStrategy = "data-cache"
): Promise<CacheApiResponse<T>> {
  const startTime = performance.now();

  try {
    // Next.js キャッシュオプションの設定
    const fetchOptions: RequestInit = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      cache: options.cache,
      next: options.next,
    };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new CacheApiError(
        `API request failed: ${response.statusText}`,
        response.status,
        "FETCH_ERROR"
      );
    }

    const data = await response.json();
    const endTime = performance.now();
    const fetchTime = endTime - startTime;

    // キャッシュヘッダー解析
    const { cacheStatus, cached, ttl } = parseCacheHeaders(response.headers);

    // データサイズの計算
    const dataSize = new Blob([JSON.stringify(data)]).size;

    return {
      data,
      metadata: {
        cached,
        cacheStatus,
        strategy,
        timestamp: new Date().toISOString(),
        source: cached ? "cache" : "network",
        ttl,
        tags: options.next?.tags,
      },
      metrics: {
        fetchTime,
        dataSize,
        cacheHit: cached,
      },
    };
  } catch (error) {
    if (error instanceof CacheApiError) {
      throw error;
    }

    throw new CacheApiError(
      `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      undefined,
      "NETWORK_ERROR"
    );
  }
}

// キャッシュテストデータAPI
export const cacheTestApi = {
  // データキャッシュデモ用データ取得
  async getTestData(
    options: CacheFetchOptions = {},
    strategy: CacheStrategy = "data-cache"
  ): Promise<CacheApiResponse<CacheTestData[]>> {
    return fetchWithCache<CacheTestData[]>(
      `${API_BASE_URL}/api/cache-test/data`,
      options,
      strategy
    );
  },

  // 特定アイテム取得（動的ルート用）
  async getTestItem(
    id: number,
    options: CacheFetchOptions = {},
    strategy: CacheStrategy = "data-cache"
  ): Promise<CacheApiResponse<CacheTestData>> {
    return fetchWithCache<CacheTestData>(
      `${API_BASE_URL}/api/cache-test/data/${id}`,
      options,
      strategy
    );
  },

  // カテゴリ別データ取得（タグベースキャッシュ用）
  async getByCategory(
    category: string,
    options: CacheFetchOptions = {},
    strategy: CacheStrategy = "data-cache"
  ): Promise<CacheApiResponse<CacheTestData[]>> {
    return fetchWithCache<CacheTestData[]>(
      `${API_BASE_URL}/api/cache-test/category/${category}`,
      {
        ...options,
        next: {
          ...options.next,
          tags: [`category-${category}`, ...(options.next?.tags || [])],
        },
      },
      strategy
    );
  },

  // リアルタイムデータ（キャッシュなし）
  async getRealtimeData(): Promise<CacheApiResponse<CacheTestData[]>> {
    return fetchWithCache<CacheTestData[]>(
      `${API_BASE_URL}/api/cache-test/realtime`,
      {
        cache: "no-store",
      },
      "data-cache"
    );
  },

  // 比較用データ（複数キャッシュ戦略）
  async getComparisonData(): Promise<Record<CacheStrategy, CacheApiResponse<CacheTestData[]>>> {
    const strategies: CacheStrategy[] = [
      "data-cache",
      "full-route-cache",
      "router-cache",
      "request-memoization",
    ];

    const results = await Promise.all(
      strategies.map(async (strategy) => {
        const data = await this.getTestData({}, strategy);
        return [strategy, data] as const;
      })
    );

    return Object.fromEntries(results) as Record<CacheStrategy, CacheApiResponse<CacheTestData[]>>;
  },

  // データキャッシュデモ用データ取得（タグ付き）
  async getDataCacheDemo(tags: string[]): Promise<CacheApiResponse<CacheTestData[]>> {
    return fetchWithCache<CacheTestData[]>(
      `${API_BASE_URL}/api/cache-test/data`,
      {
        next: {
          tags: tags,
        },
      },
      "data-cache"
    );
  },
};

// リバリデーションAPI
export const revalidationApi = {
  // パスベースのリバリデート
  async revalidatePath(path: string, secret?: string): Promise<RevalidationOperation> {
    const startTime = performance.now();

    try {
      const response = await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path,
          secret: secret || process.env.NEXT_PUBLIC_REVALIDATE_SECRET,
        }),
      });

      const endTime = performance.now();
      const result = await response.json();

      return {
        type: "path",
        target: path,
        strategy: "on-demand",
        triggeredBy: "user",
        timestamp: new Date().toISOString(),
        duration: endTime - startTime,
        success: response.ok,
        error: result.error,
      };
    } catch (error) {
      return {
        type: "path",
        target: path,
        strategy: "on-demand",
        triggeredBy: "user",
        timestamp: new Date().toISOString(),
        duration: performance.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  // タグベースのリバリデート
  async revalidateTag(tag: string, secret?: string): Promise<RevalidationOperation> {
    const startTime = performance.now();

    try {
      const response = await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tag,
          secret: secret || process.env.NEXT_PUBLIC_REVALIDATE_SECRET,
        }),
      });

      const endTime = performance.now();
      const result = await response.json();

      return {
        type: "tag",
        target: tag,
        strategy: "on-demand",
        triggeredBy: "user",
        timestamp: new Date().toISOString(),
        duration: endTime - startTime,
        success: response.ok,
        error: result.error,
      };
    } catch (error) {
      return {
        type: "tag",
        target: tag,
        strategy: "on-demand",
        triggeredBy: "user",
        timestamp: new Date().toISOString(),
        duration: performance.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  // 全体リバリデート（開発用）
  async revalidateAll(secret?: string): Promise<RevalidationOperation> {
    const startTime = performance.now();

    try {
      // 主要なパスとタグを一括リバリデート
      const paths = ["/features/caching", "/features/caching/data-cache"];
      const tags = ["cache-test", "categories"];

      const results = await Promise.all([
        ...paths.map((path) => this.revalidatePath(path, secret)),
        ...tags.map((tag) => this.revalidateTag(tag, secret)),
      ]);

      const success = results.every((r) => r.success);
      const errors = results
        .filter((r) => !r.success)
        .map((r) => r.error)
        .filter(Boolean);

      return {
        type: "full",
        target: "all",
        strategy: "on-demand",
        triggeredBy: "user",
        timestamp: new Date().toISOString(),
        duration: performance.now() - startTime,
        success,
        error: errors.length > 0 ? errors.join(", ") : undefined,
      };
    } catch (error) {
      return {
        type: "full",
        target: "all",
        strategy: "on-demand",
        triggeredBy: "user",
        timestamp: new Date().toISOString(),
        duration: performance.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  // 複数タグの一括リバリデート
  async revalidateMultipleTags(tags: string[], secret?: string): Promise<RevalidationOperation[]> {
    return Promise.all(tags.map((tag) => this.revalidateTag(tag, secret)));
  },

  // バックエンドからのリバリデートシミュレーション
  async simulateBackendRevalidation(
    reason: string,
    secret?: string
  ): Promise<RevalidationOperation> {
    const startTime = performance.now();

    try {
      // バックエンドからの通知をシミュレート
      const response = await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tag: "backend-update",
          path: "/features/caching",
          reason,
          secret: secret || process.env.NEXT_PUBLIC_REVALIDATE_SECRET,
        }),
      });

      const endTime = performance.now();
      const result = await response.json();

      return {
        type: "tag",
        target: "backend-update",
        strategy: "webhook",
        triggeredBy: "backend",
        timestamp: new Date().toISOString(),
        duration: endTime - startTime,
        success: response.ok,
        error: result.error,
      };
    } catch (error) {
      return {
        type: "tag",
        target: "backend-update",
        strategy: "webhook",
        triggeredBy: "backend",
        timestamp: new Date().toISOString(),
        duration: performance.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

// キャッシュ統計API
export const cacheStatsApi = {
  // キャッシュ状態取得
  async getCacheStatus(): Promise<{
    layers: Record<CacheStrategy, { enabled: boolean; size: number }>;
    timestamp: string;
  }> {
    try {
      const response = await fetch("/api/cache-status");
      if (!response.ok) {
        throw new Error("Failed to fetch cache status");
      }
      return response.json();
    } catch {
      // デフォルト値を返す
      return {
        layers: {
          "data-cache": { enabled: true, size: 0 },
          "full-route-cache": { enabled: true, size: 0 },
          "router-cache": { enabled: true, size: 0 },
          "request-memoization": { enabled: true, size: 0 },
          "cloudfront-cache": { enabled: false, size: 0 },
        },
        timestamp: new Date().toISOString(),
      };
    }
  },

  // キャッシュイベント履歴取得
  async getCacheEvents(): Promise<CacheInvalidationEvent[]> {
    // 実際のアプリケーションではバックエンドから取得
    // ここではモックデータを返す
    return [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        type: "manual",
        scope: "tag",
        target: "categories",
        reason: "User requested refresh",
        triggeredBy: "user",
        affectedPages: 5,
        duration: 123,
        success: true,
      },
    ];
  },
};

// CloudFront シミュレーションAPI
export const cloudfrontSimulationApi = {
  // エッジロケーション情報取得
  async getEdgeLocation(): Promise<{
    location: string;
    latency: number;
  }> {
    // CloudFront-Viewer-Country ヘッダーから推定
    return {
      location: "Tokyo",
      latency: 10, // ms
    };
  },

  // キャッシュヒット率シミュレーション
  async simulateHitRate(
    strategy: CacheStrategy
  ): Promise<{ hitRate: number; recommendation: string }> {
    // 戦略別の典型的なヒット率
    const hitRates: Record<CacheStrategy, number> = {
      "data-cache": 85,
      "full-route-cache": 95,
      "router-cache": 90,
      "request-memoization": 100,
      "cloudfront-cache": 80,
    };

    const hitRate = hitRates[strategy] || 0;

    let recommendation = "";
    if (hitRate < 70) {
      recommendation = "Consider increasing cache duration or using more aggressive caching";
    } else if (hitRate > 90) {
      recommendation = "Excellent cache performance. Monitor for stale data issues";
    } else {
      recommendation = "Good cache performance. Fine-tune based on your use case";
    }

    return { hitRate, recommendation };
  },
};

// キャッシュメトリクス計算関数
export function calculateCacheMetrics(responses: CacheApiResponse<unknown>[]): {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
  avgResponseTime: number;
  cacheSize: number;
  strategy?: CacheStrategy;
} {
  if (responses.length === 0) {
    return {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      avgResponseTime: 0,
      cacheSize: 0,
    };
  }

  const hits = responses.filter((r) => r.metrics.cacheHit).length;
  const misses = responses.length - hits;
  const totalRequests = responses.length;
  const hitRate = totalRequests > 0 ? Math.round((hits / totalRequests) * 100) : 0;

  const totalResponseTime = responses.reduce((sum, r) => sum + r.metrics.fetchTime, 0);
  const avgResponseTime = totalRequests > 0 ? Math.round(totalResponseTime / totalRequests) : 0;

  const cacheSize = responses.reduce((sum, r) => sum + r.metrics.dataSize, 0);

  // 最初のレスポンスの戦略を使用
  const strategy = responses.length > 0 ? responses[0].metadata.strategy : undefined;

  return {
    hits,
    misses,
    totalRequests,
    hitRate,
    avgResponseTime,
    cacheSize,
    strategy,
  };
}

export { CacheApiError };
