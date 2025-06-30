import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  categoriesApi,
  userProfileApi,
  dashboardStatsApi,
  fetchParallel,
  DataFetchError,
} from '../api-client';

// Global fetch のモック
const mockFetch = vi.fn();

// Performance API のモック
const mockPerformanceNow = vi.fn();

// Response モック作成ヘルパー
const createMockResponse = (
  data: unknown,
  options: {
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
  } = {}
): Response => {
  const {
    status = 200,
    statusText = 'OK',
    headers = {},
  } = options;

  return new Response(
    JSON.stringify(data),
    {
      status,
      statusText,
      headers: new Headers(headers),
    }
  );
};

// モックデータ
const mockCategories = [
  {
    id: 1,
    name: 'Technology',
    slug: 'technology',
    description: 'Tech-related posts',
    postCount: 10,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z',
  },
  {
    id: 2,
    name: 'Science',
    slug: 'science',
    description: 'Science-related posts',
    postCount: 5,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T12:00:00Z',
  },
];

const mockUserProfile = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  bio: 'Test bio',
  avatarUrl: 'https://example.com/avatar.jpg',
  isVerified: true,
  postsCount: 25,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T12:00:00Z',
};

const mockDashboardStats = {
  totalUsers: 100,
  totalPosts: 250,
  totalCategories: 10,
  dailyActiveUsers: 45,
  weeklyGrowth: 5.2,
  popularCategories: [
    { id: 1, name: 'Technology', postCount: 50 },
    { id: 2, name: 'Science', postCount: 30 },
  ],
  timestamp: '2024-01-01T12:00:00Z',
};

describe('Data Fetching API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
    global.performance.now = mockPerformanceNow;
    mockPerformanceNow.mockReturnValue(1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('categoriesApi', () => {
    describe('getAll', () => {
      it('should fetch all categories successfully', async () => {
        const mockResponse = createMockResponse(
          {
            success: true,
            data: mockCategories,
          },
          {
            headers: { 'x-nextjs-cache': 'MISS' },
          }
        );
        mockFetch.mockResolvedValueOnce(mockResponse);

        const result = await categoriesApi.getAll();

        expect(result.data).toEqual(mockCategories);
        expect(result.metrics).toMatchObject({
          source: 'ssg',
          duration: expect.any(Number),
          timestamp: expect.any(String),
          dataSize: expect.any(Number),
          cached: false,
        });
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/categories',
          expect.objectContaining({
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        );
      });

      it('should handle API errors correctly', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        });

        try {
          await categoriesApi.getAll();
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeInstanceOf(DataFetchError);
          expect((error as DataFetchError).message).toBe('API request failed: Internal Server Error');
          expect((error as DataFetchError).status).toBe(500);
          expect((error as DataFetchError).code).toBe('FETCH_ERROR');
        }
      });

      it('should handle network errors', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        try {
          await categoriesApi.getAll();
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeInstanceOf(DataFetchError);
          expect((error as DataFetchError).message).toBe('Network error: Network error');
          expect((error as DataFetchError).code).toBe('NETWORK_ERROR');
        }
      });

      it('should pass custom options correctly', async () => {
        const mockResponse = createMockResponse({
          success: true,
          data: mockCategories,
        });
        mockFetch.mockResolvedValueOnce(mockResponse);

        await categoriesApi.getAll({
          next: { revalidate: 60, tags: ['categories'] },
        }, 'isr');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/categories',
          expect.objectContaining({
            next: { revalidate: 60, tags: ['categories'] },
          })
        );
      });

      it('should calculate metrics correctly', async () => {
        mockPerformanceNow
          .mockReturnValueOnce(1000) // start time
          .mockReturnValueOnce(1080); // end time

        const mockResponse = createMockResponse(
          {
            success: true,
            data: mockCategories,
          },
          {
            headers: { 'x-nextjs-cache': 'HIT' },
          }
        );
        mockFetch.mockResolvedValueOnce(mockResponse);

        const result = await categoriesApi.getAll();

        expect(result.metrics.duration).toBe(80);
        expect(result.metrics.cached).toBe(true);
        expect(result.metrics.source).toBe('ssg');
      });
    });

    describe('getById', () => {
      it('should fetch category by id', async () => {
        const mockResponse = createMockResponse({
          success: true,
          data: mockCategories[0],
        });
        mockFetch.mockResolvedValueOnce(mockResponse);

        const result = await categoriesApi.getById(1);

        expect(result.data).toEqual(mockCategories[0]);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/categories/1',
          expect.any(Object)
        );
      });
    });

    describe('getPostsByCategory', () => {
      it('should fetch posts by category with pagination', async () => {
        const mockPaginatedResponse = {
          items: mockCategories,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
          },
        };

        const mockResponse = createMockResponse(mockPaginatedResponse);
        mockFetch.mockResolvedValueOnce(mockResponse);

        const result = await categoriesApi.getPostsByCategory('technology', 1, 10);

        expect(result.data).toEqual(mockPaginatedResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/categories/technology/posts?page=1&limit=10',
          expect.any(Object)
        );
      });
    });
  });

  describe('userProfileApi', () => {
    describe('getProfile', () => {
      it('should fetch user profile by id', async () => {
        const mockResponse = createMockResponse({
          success: true,
          data: mockUserProfile,
        });
        mockFetch.mockResolvedValueOnce(mockResponse);

        const result = await userProfileApi.getProfile(1);

        expect(result.data).toEqual(mockUserProfile);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/user-profile/1',
          expect.any(Object)
        );
      });
    });

    describe('getCurrentProfile', () => {
      it('should fetch current user profile', async () => {
        const mockResponse = createMockResponse({
          success: true,
          data: mockUserProfile,
        });
        mockFetch.mockResolvedValueOnce(mockResponse);

        const result = await userProfileApi.getCurrentProfile();

        expect(result.data).toEqual(mockUserProfile);
        expect(result.metrics.source).toBe('ssr');
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/user-profile/current',
          expect.any(Object)
        );
      });

      it('should use no-store cache for SSR', async () => {
        const mockResponse = createMockResponse({
          success: true,
          data: mockUserProfile,
        });
        mockFetch.mockResolvedValueOnce(mockResponse);

        await userProfileApi.getCurrentProfile({ cache: 'no-store' }, 'ssr');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/user-profile/current',
          expect.objectContaining({
            cache: 'no-store',
          })
        );
      });
    });
  });

  describe('dashboardStatsApi', () => {
    describe('getStats', () => {
      it('should fetch dashboard stats', async () => {
        const mockResponse = createMockResponse({
          success: true,
          data: mockDashboardStats,
        });
        mockFetch.mockResolvedValueOnce(mockResponse);

        const result = await dashboardStatsApi.getStats();

        expect(result.data).toEqual(mockDashboardStats);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/dashboard-stats',
          expect.any(Object)
        );
      });
    });

    describe('getRealTimeStats', () => {
      it('should fetch real-time stats with no-store cache', async () => {
        const mockResponse = createMockResponse({
          success: true,
          data: mockDashboardStats,
        });
        mockFetch.mockResolvedValueOnce(mockResponse);

        const result = await dashboardStatsApi.getRealTimeStats();

        expect(result.data).toEqual(mockDashboardStats);
        expect(result.metrics.source).toBe('client-side');
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/dashboard-stats/realtime',
          expect.objectContaining({
            cache: 'no-store',
          })
        );
      });
    });
  });

  describe('fetchParallel', () => {
    it('should fetch multiple endpoints in parallel', async () => {
      mockPerformanceNow
        .mockReturnValueOnce(1000) // fetchParallel start time
        .mockReturnValueOnce(1010) // categoriesApi start time
        .mockReturnValueOnce(1050) // categoriesApi end time
        .mockReturnValueOnce(1020) // userProfileApi start time  
        .mockReturnValueOnce(1060) // userProfileApi end time
        .mockReturnValueOnce(1030) // dashboardStatsApi start time
        .mockReturnValueOnce(1070) // dashboardStatsApi end time
        .mockReturnValueOnce(1150); // fetchParallel end time

      // モック all API responses
      const categoriesResponse = createMockResponse({
        success: true,
        data: mockCategories,
      });
      const userProfileResponse = createMockResponse({
        success: true,
        data: mockUserProfile,
      });
      const dashboardStatsResponse = createMockResponse({
        success: true,
        data: mockDashboardStats,
      });
      
      mockFetch
        .mockResolvedValueOnce(categoriesResponse)
        .mockResolvedValueOnce(userProfileResponse)
        .mockResolvedValueOnce(dashboardStatsResponse);

      const result = await fetchParallel();

      expect(result.data).toEqual({
        categories: mockCategories,
        userProfile: mockUserProfile,
        dashboardStats: mockDashboardStats,
      });

      expect(result.metrics).toMatchObject({
        source: 'parallel',
        duration: 150,
        requestCount: 3,
        cached: false,
        timestamp: expect.any(String),
        dataSize: expect.any(Number),
      });

      // 3つのAPIが呼ばれたことを確認
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should handle errors in parallel fetch', async () => {
      const categoriesResponse = createMockResponse({
        success: true,
        data: mockCategories,
      });
      const dashboardStatsResponse = createMockResponse({
        success: true,
        data: mockDashboardStats,
      });
      
      mockFetch
        .mockResolvedValueOnce(categoriesResponse)
        .mockRejectedValueOnce(new Error('User profile fetch failed'))
        .mockResolvedValueOnce(dashboardStatsResponse);

      await expect(fetchParallel()).rejects.toThrow(DataFetchError);
      await expect(fetchParallel()).rejects.toThrow('Parallel fetch failed');
    });

    it('should aggregate data sizes correctly', async () => {
      mockPerformanceNow
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1100);

      // 各レスポンスで異なるデータサイズを設定
      const categoriesSize = JSON.stringify({ success: true, data: mockCategories }).length;
      const userProfileSize = JSON.stringify({ success: true, data: mockUserProfile }).length;
      const dashboardStatsSize = JSON.stringify({ success: true, data: mockDashboardStats }).length;

      const categoriesResponse = createMockResponse({
        success: true,
        data: mockCategories,
      });
      const userProfileResponse = createMockResponse({
        success: true,
        data: mockUserProfile,
      });
      const dashboardStatsResponse = createMockResponse({
        success: true,
        data: mockDashboardStats,
      });
      
      mockFetch
        .mockResolvedValueOnce(categoriesResponse)
        .mockResolvedValueOnce(userProfileResponse)
        .mockResolvedValueOnce(dashboardStatsResponse);

      const result = await fetchParallel();

      // データサイズが合計されていることを確認
      expect(result.metrics.dataSize).toBeGreaterThan(0);
      expect(result.metrics.dataSize).toBe(
        categoriesSize + userProfileSize + dashboardStatsSize
      );
    });
  });

  describe('DataFetchError', () => {
    it('should create error with status and code', () => {
      const error = new DataFetchError('Test error', 404, 'NOT_FOUND');

      expect(error.message).toBe('Test error');
      expect(error.status).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.name).toBe('DataFetchError');
    });

    it('should handle error without status', () => {
      const error = new DataFetchError('Network error');

      expect(error.message).toBe('Network error');
      expect(error.status).toBeUndefined();
      expect(error.code).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty response data', async () => {
      const mockResponse = createMockResponse({
        success: true,
        data: [],
      });
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await categoriesApi.getAll();

      expect(result.data).toEqual([]);
    });

    it('should handle malformed JSON response', async () => {
      const mockResponse = new Response('invalid json', {
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
      });
      // Responseオブジェクトのjsonメソッドを上書き
      vi.spyOn(mockResponse, 'json').mockRejectedValue(new Error('Invalid JSON'));
      mockFetch.mockResolvedValueOnce(mockResponse);

      await expect(categoriesApi.getAll()).rejects.toThrow(DataFetchError);
    });

    it('should use environment variable for API base URL', async () => {
      const originalEnv = process.env.API_URL;
      process.env.API_URL = 'https://api.example.com';

      // APIクライアントを再インポート
      vi.resetModules();
      const { categoriesApi: newCategoriesApi } = await import('../api-client');

      const mockResponse = createMockResponse({
        success: true,
        data: mockCategories,
      });
      mockFetch.mockResolvedValueOnce(mockResponse);

      await newCategoriesApi.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/categories',
        expect.any(Object)
      );

      // 環境変数を元に戻す
      process.env.API_URL = originalEnv;
    });
  });
});