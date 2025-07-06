// データフェッチング機能の共通型定義

// カテゴリ型
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

// ユーザープロフィール型
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  joinedAt: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isVerified: boolean;
  location?: string;
  website?: string;
  viewsToday?: number;
}

// ダッシュボード統計型
export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalCategories: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  bounceRate: number;
  topCategories: Array<{
    id: number;
    name: string;
    postCount: number;
    viewCount: number;
  }>;
  recentPosts: Array<{
    id: number;
    title: string;
    author: string;
    publishedAt: string;
    viewCount: number;
  }>;
}

// 結合データ型（parallel fetch用）
export interface CombinedData {
  categories: Category[];
  userProfile: UserProfile | null;
  dashboardStats: DashboardStats;
}

// データフェッチメトリクス型
export interface DataFetchMetrics {
  source: "ssg" | "ssr" | "isr" | "client-side" | "parallel";
  duration: number;
  timestamp: string;
  dataSize: number;
  cached?: boolean;
  requestCount?: number;
  cacheStatus?: "hit" | "miss" | "stale";
}

// フェッチオプション型
export interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  cache?: RequestCache;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

// ページネーション型
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// APIレスポンス型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// エラー型
export interface ApiError {
  message: string;
  code: string;
  statusCode?: number;
}

// パフォーマンスメトリクス型
export interface PerformanceMetrics {
  network: {
    totalRequests: number;
    avgResponseTime: number;
    cacheHitRate: number;
    totalDataTransferred: number;
    errors: number;
  };
  render: {
    serverRenderTime: number;
    clientRenderTime: number;
    totalRenderTime: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
    staleHits: number;
  };
  lastUpdated: string;
}

// ナビゲーションメニュー型
export interface NavigationItem {
  title: string;
  href: string;
  description?: string;
  badge?: string;
  isActive?: boolean;
}

// コード表示プロパティ型
export interface CodeDisplayProps {
  children: string;
  language?: string;
  title?: string;
  className?: string;
}

// パフォーマンス表示プロパティ型
export interface PerformanceDisplayProps {
  metrics: PerformanceMetrics;
  title?: string;
  className?: string;
}
