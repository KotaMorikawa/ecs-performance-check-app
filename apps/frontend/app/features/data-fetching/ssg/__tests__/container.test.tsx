import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SsgContainer } from '../_containers/container';

// 共通型定義をモック
vi.mock('../../_shared/api-client', () => ({
  categoriesApi: {
    getPostsByCategory: vi.fn(),
  },
}));

// モックデータ
const mockPostsResponse = {
  success: true,
  data: [
    {
      id: 1,
      title: 'Test Post 1',
      content: 'Test content 1',
      slug: 'test-post-1',
      published: true,
      views: 100,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      },
      tags: [],
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

const mockMetrics = {
  fetchStartTime: 100,
  fetchEndTime: 200,
  duration: 100,
  cacheStatus: 'miss' as const,
  dataSize: 1024,
  source: 'ssg' as const,
};

describe('SsgContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render category posts correctly', async () => {
    // API呼び出しをモック
    const { categoriesApi } = await import('../../_shared/api-client');
    (categoriesApi.getPostsByCategory as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockPostsResponse,
      metrics: mockMetrics,
    });

    const { container } = render(
      await SsgContainer({ params: { category: 'technology' } })
    );

    expect(container).toBeInTheDocument();
  });

  it('should call API with correct parameters', async () => {
    const { categoriesApi } = await import('../../_shared/api-client');
    (categoriesApi.getPostsByCategory as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockPostsResponse,
      metrics: mockMetrics,
    });

    await SsgContainer({ params: { category: 'technology' } });

    expect(categoriesApi.getPostsByCategory).toHaveBeenCalledWith(
      'technology',
      1,
      10,
      expect.objectContaining({
        next: {
          tags: ['category-posts', 'technology'],
        },
      })
    );
  });

  it('should handle API errors gracefully', async () => {
    const { categoriesApi } = await import('../../_shared/api-client');
    (categoriesApi.getPostsByCategory as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('API Error')
    );

    // エラーが発生してもコンポーネントがレンダリングされるべき
    const { container } = render(
      await SsgContainer({ params: { category: 'technology' } })
    );

    expect(container).toBeInTheDocument();
  });

  it('should use correct cache tags for SSG', async () => {
    const { categoriesApi } = await import('../../_shared/api-client');
    (categoriesApi.getPostsByCategory as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockPostsResponse,
      metrics: mockMetrics,
    });

    await SsgContainer({ params: { category: 'design' } });

    expect(categoriesApi.getPostsByCategory).toHaveBeenCalledWith(
      'design',
      1,
      10,
      expect.objectContaining({
        next: {
          tags: ['category-posts', 'design'],
        },
      })
    );
  });
});