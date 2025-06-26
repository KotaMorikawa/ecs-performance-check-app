// データフェッチング機能共通の型定義

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: number;
  name: string | null;
  email: string;
  bio: string | null;
  avatar: string | null;
  role: 'USER' | 'ADMIN';
  postCount: number;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalPosts: number;
  totalUsers: number;
  totalCategories: number;
  totalViews: number;
  recentPosts: number;
  popularCategories: { name: string; count: number }[];
  userGrowth: { period: string; count: number }[];
  lastUpdated: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  cache?: RequestCache;
  headers?: Record<string, string>;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

export interface FetchError {
  message: string;
  status?: number;
  code?: string;
}

export interface DataFetchMetrics {
  source: 'ssg' | 'ssr' | 'isr' | 'parallel' | 'client-side';
  duration: number;
  timestamp: string;
  dataSize: number;
  cached?: boolean;
  requestCount?: number;
}