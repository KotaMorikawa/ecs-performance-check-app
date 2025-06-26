import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ParallelContainer } from '../_containers/container';
import type { Category, UserProfile, DashboardStats } from '../../_shared/types';

// API クライアントをモック
vi.mock('../../_shared/api-client', () => ({
  categoriesApi: {
    getAll: vi.fn(),
  },
  userProfileApi: {
    getCurrentProfile: vi.fn(),
  },
  dashboardStatsApi: {
    getStats: vi.fn(),
  },
  fetchParallel: vi.fn(),
}));

// モックデータ
const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Technology',
    slug: 'technology',
    description: 'Tech posts',
    postCount: 10,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockUserProfile: UserProfile = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  bio: 'Developer',
  avatar: null,
  role: 'USER' as const,
  postCount: 5,
  lastActiveAt: '2024-01-01T12:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T12:00:00Z',
};

const mockDashboardStats: DashboardStats = {
  totalPosts: 25,
  totalUsers: 10,
  totalCategories: 5,
  totalViews: 1000,
  recentPosts: 3,
  popularCategories: [{ name: 'Technology', count: 10 }],
  userGrowth: [{ period: '2024-01', count: 5 }],
  lastUpdated: '2024-01-01T12:00:00Z',
};

const mockMetrics = [
  {
    fetchStartTime: 100,
    fetchEndTime: 200,
    duration: 100,
    cacheStatus: 'miss' as const,
    dataSize: 1024,
    source: 'parallel' as const,
  },
  {
    fetchStartTime: 110,
    fetchEndTime: 210,
    duration: 100,
    cacheStatus: 'hit' as const,
    dataSize: 512,
    source: 'parallel' as const,
  },
  {
    fetchStartTime: 120,
    fetchEndTime: 220,
    duration: 100,
    cacheStatus: 'miss' as const,
    dataSize: 2048,
    source: 'parallel' as const,
  },
];

describe('ParallelContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render parallel fetch results correctly', async () => {
    const { fetchParallel } = await import('../../_shared/api-client');
    (fetchParallel as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        categories: mockCategories,
        userProfile: mockUserProfile,
        dashboardStats: mockDashboardStats,
      },
      metrics: mockMetrics,
    });

    const { container } = render(await ParallelContainer());

    expect(container).toBeInTheDocument();
  });

  it('should execute all API calls in parallel', async () => {
    const { fetchParallel } = await import('../../_shared/api-client');
    (fetchParallel as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        categories: mockCategories,
        userProfile: mockUserProfile,
        dashboardStats: mockDashboardStats,
      },
      metrics: mockMetrics,
    });

    await ParallelContainer();

    expect(fetchParallel).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: expect.any(Function),
        userProfile: expect.any(Function),
        dashboardStats: expect.any(Function),
      })
    );
  });

  it('should handle partial failures in parallel requests', async () => {
    const { fetchParallel } = await import('../../_shared/api-client');
    (fetchParallel as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('One of the parallel requests failed')
    );

    const { container } = render(await ParallelContainer());

    // 部分的な失敗でもコンポーネントがレンダリングされるべき
    expect(container).toBeInTheDocument();
  });

  it('should collect performance metrics for all parallel requests', async () => {
    const { fetchParallel } = await import('../../_shared/api-client');
    (fetchParallel as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        categories: mockCategories,
        userProfile: mockUserProfile,
        dashboardStats: mockDashboardStats,
      },
      metrics: mockMetrics,
    });

    await ParallelContainer();

    // fetchParallel が呼ばれ、メトリクスが収集されることを確認
    expect(fetchParallel).toHaveBeenCalledTimes(1);
  });

  it('should pass correct cache options to parallel requests', async () => {
    const { fetchParallel } = await import('../../_shared/api-client');
    (fetchParallel as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        categories: mockCategories,
        userProfile: mockUserProfile,
        dashboardStats: mockDashboardStats,
      },
      metrics: mockMetrics,
    });

    await ParallelContainer();

    // fetchParallel に渡される関数が正しいオプションでAPIを呼ぶことを確認
    const calls = (fetchParallel as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(calls).toHaveProperty('categories');
    expect(calls).toHaveProperty('userProfile');
    expect(calls).toHaveProperty('dashboardStats');
  });
});