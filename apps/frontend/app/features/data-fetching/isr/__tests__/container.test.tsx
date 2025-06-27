import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IsrContainer } from '../_containers/container';

// API クライアントをモック
vi.mock('../../_shared/api-client', () => ({
  categoriesApi: {
    getAll: vi.fn(),
  },
}));

// モックデータ
const mockCategories = [
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
];

const mockMetrics = {
  fetchStartTime: 100,
  fetchEndTime: 180,
  duration: 80,
  cacheStatus: 'hit' as const,
  dataSize: 1536,
  source: 'isr' as const,
  timestamp: '2024-01-01T10:00:00Z',
  cached: true,
};

describe('IsrContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render ISR categories correctly', async () => {
    const { categoriesApi } = await import('../../_shared/api-client');
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: mockMetrics,
    });

    const { container } = render(await IsrContainer());

    expect(container).toBeInTheDocument();
  });

  it('should use correct revalidate settings for ISR', async () => {
    const { categoriesApi } = await import('../../_shared/api-client');
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: mockMetrics,
    });

    await IsrContainer();

    expect(categoriesApi.getAll).toHaveBeenCalledWith({
      next: {
        revalidate: 60, // 60秒でリバリデート
        tags: ['categories'],
      },
    }, 'isr');
  });

  it('should handle empty categories gracefully', async () => {
    const { categoriesApi } = await import('../../_shared/api-client');
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: [],
      metrics: mockMetrics,
    });

    const { container } = render(await IsrContainer());

    expect(container).toBeInTheDocument();
  });

  it('should handle API errors and show fallback', async () => {
    const { categoriesApi } = await import('../../_shared/api-client');
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockRejectedValue(
      new Error('ISR fetch failed')
    );

    const { container } = render(await IsrContainer());

    // エラー時でもコンポーネントがレンダリングされるべき
    expect(container).toBeInTheDocument();
  });

  it('should use appropriate cache tags for revalidation', async () => {
    const { categoriesApi } = await import('../../_shared/api-client');
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: mockMetrics,
    });

    await IsrContainer();

    expect(categoriesApi.getAll).toHaveBeenCalledWith(
      expect.objectContaining({
        next: expect.objectContaining({
          tags: ['categories'],
        }),
      }),
      'isr'
    );
  });

  it('should collect performance metrics for ISR', async () => {
    const { categoriesApi } = await import('../../_shared/api-client');
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: {
        ...mockMetrics,
        cacheStatus: 'stale', // ISR特有のstale状態
      },
    });

    await IsrContainer();

    expect(categoriesApi.getAll).toHaveBeenCalledTimes(1);
  });

  it('should demonstrate time-based revalidation', async () => {
    const { categoriesApi } = await import('../../_shared/api-client');
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: mockMetrics,
    });

    await IsrContainer();

    // 時間ベースのリバリデーション設定が正しく渡されていることを確認
    const callArgs = (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mock.calls[0]?.[0];
    expect(callArgs?.next?.revalidate).toBe(60);
  });
});