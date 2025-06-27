// 並行データフェッチング用の型定義

export interface ParallelFetchResult {
  categories: import('@/features/data-fetching/_shared/types').Category[];
  userProfile: import('@/features/data-fetching/_shared/types').UserProfile | null;
  dashboardStats: import('@/features/data-fetching/_shared/types').DashboardStats;
}

export interface ParallelFetchMetrics {
  source: 'parallel';
  duration: number;
  timestamp: string;
  dataSize: number;
  requestCount: number;
  cached: boolean;
}

export interface ParallelFetchResponse {
  data: ParallelFetchResult;
  metrics: ParallelFetchMetrics;
}