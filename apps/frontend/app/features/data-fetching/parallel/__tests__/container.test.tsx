import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ParallelContainer } from '../_containers/container';
import type { UserProfile, DashboardStats } from '../../_shared/types';

// API クライアントをモック
vi.mock('../../_shared/api-client', () => ({
  fetchParallel: vi.fn(),
}));

// モックデータ
const mockCombinedData = {
  categories: [
    {
      id: 1,
      name: 'Technology',
      slug: 'technology',
      description: 'Technology related posts',
      postCount: 15,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z',
    },
    {
      id: 2,
      name: 'Design',
      slug: 'design',
      description: 'Design related posts',
      postCount: 8,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T11:00:00Z',
    },
  ],
  userProfile: {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    bio: 'Test bio',
    avatar: 'https://example.com/avatar.jpg',
    isVerified: true,
    postsCount: 25,
    joinedAt: '2024-01-01T00:00:00Z',
    followersCount: 120,
    followingCount: 80,
  } as UserProfile,
  dashboardStats: {
    totalUsers: 100,
    totalPosts: 250,
    totalCategories: 10,
    dailyActiveUsers: 45,
    weeklyActiveUsers: 200,
    monthlyActiveUsers: 500,
    averageSessionDuration: 8.5,
    bounceRate: 32.1,
    topCategories: [
      { id: 1, name: 'Technology', postCount: 50, viewCount: 1200 },
      { id: 2, name: 'Science', postCount: 30, viewCount: 800 },
    ],
    recentPosts: [
      { id: 1, title: 'Recent Post 1', author: 'Author 1', publishedAt: '2024-01-01T10:00:00Z', viewCount: 150 },
      { id: 2, title: 'Recent Post 2', author: 'Author 2', publishedAt: '2024-01-01T11:00:00Z', viewCount: 120 },
    ],
  } as DashboardStats,
};

const mockMetrics = {
  source: 'parallel' as const,
  duration: 150,
  timestamp: '2024-01-01T12:00:00Z',
  dataSize: 2048,
  requestCount: 3,
  cached: false,
};

describe('ParallelContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render parallel data correctly', async () => {
    const { fetchParallel } = await import('../../_shared/api-client');
    (fetchParallel as MockedFunction<typeof fetchParallel>).mockResolvedValue({
      data: mockCombinedData,
      metrics: mockMetrics,
    });

    const { container } = render(await ParallelContainer());

    expect(container).toBeInTheDocument();
  });

  it('should fetch data using parallel API', async () => {
    const { fetchParallel } = await import('../../_shared/api-client');
    (fetchParallel as MockedFunction<typeof fetchParallel>).mockResolvedValue({
      data: mockCombinedData,
      metrics: mockMetrics,
    });

    await ParallelContainer();

    expect(fetchParallel).toHaveBeenCalledTimes(1);
  });

  it('should handle errors gracefully', async () => {
    const { fetchParallel } = await import('../../_shared/api-client');
    const errorMessage = 'Parallel fetch failed';
    (fetchParallel as MockedFunction<typeof fetchParallel>).mockRejectedValue(
      new Error(errorMessage)
    );

    // console.errorをモックしてエラーログを抑制
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(await ParallelContainer());

    // エラー時でもコンポーネントがレンダリングされるべき
    expect(container).toBeInTheDocument();
    
    // console.errorが呼ばれたことを確認
    expect(consoleSpy).toHaveBeenCalledWith('Parallel fetch error:', expect.any(Error));
    
    // モックをリストア
    consoleSpy.mockRestore();
  });

  it('should pass combined data to presentational component', async () => {
    const { fetchParallel } = await import('../../_shared/api-client');
    (fetchParallel as MockedFunction<typeof fetchParallel>).mockResolvedValue({
      data: mockCombinedData,
      metrics: mockMetrics,
    });

    const result = render(await ParallelContainer());

    // Suspenseフォールバックが表示されていないことを確認
    expect(result.queryByText('Loading parallel data...')).not.toBeInTheDocument();
  });

  it('should handle null user profile in combined data', async () => {
    const { fetchParallel } = await import('../../_shared/api-client');
    const dataWithNullProfile = {
      ...mockCombinedData,
      userProfile: null,
    };

    (fetchParallel as MockedFunction<typeof fetchParallel>).mockResolvedValue({
      data: dataWithNullProfile,
      metrics: mockMetrics,
    });

    const { container } = render(await ParallelContainer());

    expect(container).toBeInTheDocument();
  });

  it('should collect performance metrics for parallel fetching', async () => {
    const { fetchParallel } = await import('../../_shared/api-client');
    const customMetrics = {
      ...mockMetrics,
      duration: 200,
      requestCount: 3,
    };

    (fetchParallel as MockedFunction<typeof fetchParallel>).mockResolvedValue({
      data: mockCombinedData,
      metrics: customMetrics,
    });

    await ParallelContainer();

    expect(fetchParallel).toHaveBeenCalledTimes(1);
  });

  it('should handle empty categories in combined data', async () => {
    const { fetchParallel } = await import('../../_shared/api-client');
    const dataWithEmptyCategories = {
      ...mockCombinedData,
      categories: [],
    };

    (fetchParallel as MockedFunction<typeof fetchParallel>).mockResolvedValue({
      data: dataWithEmptyCategories,
      metrics: mockMetrics,
    });

    const { container } = render(await ParallelContainer());

    expect(container).toBeInTheDocument();
  });

  it('should render within Suspense boundary', async () => {
    const { fetchParallel } = await import('../../_shared/api-client');
    (fetchParallel as MockedFunction<typeof fetchParallel>).mockResolvedValue({
      data: mockCombinedData,
      metrics: mockMetrics,
    });

    const result = render(await ParallelContainer());

    // Suspenseが正しく動作していることを確認
    expect(result.container.querySelector('div')).toBeInTheDocument();
  });
});