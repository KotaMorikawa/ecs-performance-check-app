// データフェッチング機能共通のAPIクライアント

import {
  Category,
  UserProfile,
  DashboardStats,
  FetchOptions,
  DataFetchMetrics,
  PaginatedResponse,
} from './types';

const API_BASE_URL = process.env.API_URL || 'http://localhost:8000';

class DataFetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'DataFetchError';
  }
}

// 汎用フェッチ関数（メトリクス付き）
async function fetchWithMetrics<T>(
  url: string,
  options: FetchOptions = {},
  source: DataFetchMetrics['source']
): Promise<{ data: T; metrics: DataFetchMetrics }> {
  const fetchStartTime = performance.now();

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      cache: options.cache,
      next: options.next,
    });

    if (!response.ok) {
      throw new DataFetchError(
        `API request failed: ${response.statusText}`,
        response.status,
        'FETCH_ERROR'
      );
    }

    const data = await response.json();
    const fetchEndTime = performance.now();

    // レスポンスサイズの計算（概算）
    const dataSize = new Blob([JSON.stringify(data)]).size;

    const metrics: DataFetchMetrics = {
      source,
      duration: fetchEndTime - fetchStartTime,
      timestamp: new Date().toISOString(),
      dataSize,
      cached: response.headers.get('x-nextjs-cache') === 'HIT',
    };

    return { data, metrics };
  } catch (error) {
    if (error instanceof DataFetchError) {
      throw error;
    }

    throw new DataFetchError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      'NETWORK_ERROR'
    );
  }
}

// カテゴリ関連API
export const categoriesApi = {
  // 全カテゴリ取得
  async getAll(
    options: FetchOptions = {},
    source: DataFetchMetrics['source'] = 'ssg'
  ): Promise<{ data: Category[]; metrics: DataFetchMetrics }> {
    const result = await fetchWithMetrics<{
      success: boolean;
      data: Category[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`${API_BASE_URL}/api/categories`, options, source);

    // バックエンドAPIのレスポンス形式に合わせて調整
    return {
      data: result.data.data || [],
      metrics: result.metrics,
    };
  },

  // カテゴリ詳細取得
  async getById(
    id: number,
    options: FetchOptions = {},
    source: DataFetchMetrics['source'] = 'ssr'
  ): Promise<{ data: Category; metrics: DataFetchMetrics }> {
    const result = await fetchWithMetrics<{
      success: boolean;
      data: Category;
    }>(`${API_BASE_URL}/api/categories/${id}`, options, source);

    return {
      data: result.data.data,
      metrics: result.metrics,
    };
  },

  // カテゴリ別投稿取得
  async getPostsByCategory(
    slug: string,
    page = 1,
    limit = 10,
    options: FetchOptions = {},
    source: DataFetchMetrics['source'] = 'ssr'
  ): Promise<{ data: PaginatedResponse<Category>; metrics: DataFetchMetrics }> {
    return fetchWithMetrics<PaginatedResponse<Category>>(
      `${API_BASE_URL}/api/categories/${slug}/posts?page=${page}&limit=${limit}`,
      options,
      source
    );
  },
};

// ユーザープロフィールAPI
export const userProfileApi = {
  // ユーザープロフィール取得
  async getProfile(
    userId: number,
    options: FetchOptions = {},
    source: DataFetchMetrics['source'] = 'ssr'
  ): Promise<{ data: UserProfile; metrics: DataFetchMetrics }> {
    const result = await fetchWithMetrics<{
      success: boolean;
      data: UserProfile;
    }>(`${API_BASE_URL}/api/user-profile/${userId}`, options, source);

    return {
      data: result.data.data,
      metrics: result.metrics,
    };
  },

  // 現在のユーザープロフィール取得
  async getCurrentProfile(
    options: FetchOptions = {},
    source: DataFetchMetrics['source'] = 'ssr'
  ): Promise<{ data: UserProfile; metrics: DataFetchMetrics }> {
    const result = await fetchWithMetrics<{
      success: boolean;
      data: UserProfile;
    }>(`${API_BASE_URL}/api/user-profile/current`, options, source);

    return {
      data: result.data.data,
      metrics: result.metrics,
    };
  },
};

// ダッシュボード統計API
export const dashboardStatsApi = {
  // 統計データ取得
  async getStats(
    options: FetchOptions = {},
    source: DataFetchMetrics['source'] = 'ssr'
  ): Promise<{ data: DashboardStats; metrics: DataFetchMetrics }> {
    const result = await fetchWithMetrics<{
      success: boolean;
      data: DashboardStats;
    }>(`${API_BASE_URL}/api/dashboard-stats`, options, source);

    return {
      data: result.data.data,
      metrics: result.metrics,
    };
  },

  // リアルタイム統計取得
  async getRealTimeStats(
    options: FetchOptions = {},
    source: DataFetchMetrics['source'] = 'client-side'
  ): Promise<{ data: DashboardStats; metrics: DataFetchMetrics }> {
    const result = await fetchWithMetrics<{
      success: boolean;
      data: DashboardStats;
    }>(
      `${API_BASE_URL}/api/dashboard-stats/realtime`,
      {
        ...options,
        cache: 'no-store', // リアルタイムなのでキャッシュしない
      },
      source
    );

    return {
      data: result.data.data,
      metrics: result.metrics,
    };
  },
};

// 並列フェッチ用のヘルパー関数
export async function fetchParallel(): Promise<{
  data: {
    categories: Category[];
    userProfile: UserProfile | null;
    dashboardStats: DashboardStats;
  };
  metrics: DataFetchMetrics;
}> {
  const startTime = performance.now();

  try {
    const [categoriesResult, userProfileResult, dashboardStatsResult] = await Promise.all([
      categoriesApi.getAll({}, 'parallel'),
      userProfileApi.getCurrentProfile({}, 'parallel'),
      dashboardStatsApi.getStats({}, 'parallel'),
    ]);

    const endTime = performance.now();
    const duration = endTime - startTime;

    return {
      data: {
        categories: categoriesResult.data,
        userProfile: userProfileResult.data,
        dashboardStats: dashboardStatsResult.data,
      },
      metrics: {
        source: 'parallel',
        duration,
        timestamp: new Date().toISOString(),
        dataSize:
          categoriesResult.metrics.dataSize +
          userProfileResult.metrics.dataSize +
          dashboardStatsResult.metrics.dataSize,
        requestCount: 3,
        cached: false,
      },
    };
  } catch (error) {
    throw new DataFetchError(
      `Parallel fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      'PARALLEL_FETCH_ERROR'
    );
  }
}

export { DataFetchError };
