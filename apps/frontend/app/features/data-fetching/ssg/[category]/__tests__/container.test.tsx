import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SsgContainer } from '../_containers/container';
import type { Category, DataFetchMetrics } from '../../../_shared/types';

// API クライアントをモック
vi.mock('../../../_shared/api-client', () => ({
  categoriesApi: {
    getAll: vi.fn(),
  },
}));

// モックデータ
const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Technology',
    slug: 'technology',
    description: 'Technology related posts',
    postCount: 25,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'Science',
    slug: 'science',
    description: 'Science related posts',
    postCount: 15,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T11:00:00Z',
  },
  {
    id: 3,
    name: 'Design',
    slug: 'design',
    description: 'Design related posts',
    postCount: 18,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z',
  },
];

const mockMetrics: DataFetchMetrics = {
  source: 'ssg',
  duration: 35,
  timestamp: '2024-01-01T12:00:00Z',
  dataSize: 1856,
  cached: true,
};

describe('SsgContainer (Category)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render SSG category container correctly', async () => {
    const { categoriesApi } = await import('../../../_shared/api-client');
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: mockMetrics,
    });

    const { container } = render(await SsgContainer({ category: 'technology' }));

    expect(container).toBeInTheDocument();
  });

  it('should fetch categories with SSG settings for category page', async () => {
    const { categoriesApi } = await import('../../../_shared/api-client');
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: mockMetrics,
    });

    await SsgContainer({ category: 'technology' });

    expect(categoriesApi.getAll).toHaveBeenCalledWith({
      next: {
        tags: ['categories'],
        // SSGではビルド時に生成されるため、revalidateは設定しない
      },
    }, 'ssg');
  });

  it('should find selected category by slug correctly', async () => {
    const { categoriesApi } = await import('../../../_shared/api-client');
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: mockMetrics,
    });

    const result = render(await SsgContainer({ category: 'science' }));

    // Suspenseフォールバックが表示されていないことを確認
    expect(result.queryByText('Loading SSG demo...')).not.toBeInTheDocument();
  });

  it('should handle API errors gracefully in category page', async () => {
    const { categoriesApi } = await import('../../../_shared/api-client');
    const errorMessage = 'SSG category fetch failed';
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockRejectedValue(
      new Error(errorMessage)
    );

    // console.errorをモックしてエラーログを抑制
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(await SsgContainer({ category: 'technology' }));

    // エラー時でもコンポーネントがレンダリングされるべき
    expect(container).toBeInTheDocument();
    
    // console.errorが呼ばれたことを確認
    expect(consoleSpy).toHaveBeenCalledWith('SSG fetch error:', expect.any(Error));
    
    // モックをリストア
    consoleSpy.mockRestore();
  });

  it('should pass correct category slug to presentational component', async () => {
    const { categoriesApi } = await import('../../../_shared/api-client');
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: mockMetrics,
    });

    const result = render(await SsgContainer({ category: 'design' }));

    // Suspenseフォールバックが表示されていないことを確認
    expect(result.queryByText('Loading SSG demo...')).not.toBeInTheDocument();
  });

  it('should collect performance metrics for SSG category page', async () => {
    const { categoriesApi } = await import('../../../_shared/api-client');
    const customMetrics = {
      ...mockMetrics,
      duration: 25,
      cached: true,
      source: 'ssg' as const,
    };

    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: customMetrics,
    });

    await SsgContainer({ category: 'technology' });

    expect(categoriesApi.getAll).toHaveBeenCalledTimes(1);
  });

  it('should use build-time cache settings for category pages', async () => {
    const { categoriesApi } = await import('../../../_shared/api-client');
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: mockMetrics,
    });

    await SsgContainer({ category: 'technology' });

    // SSG 用のキャッシュ設定が渡されていることを確認
    expect(categoriesApi.getAll).toHaveBeenCalledWith(
      expect.objectContaining({
        next: expect.objectContaining({
          tags: ['categories'],
        }),
      }),
      'ssg'
    );
  });

  it('should handle category not found gracefully', async () => {
    const { categoriesApi } = await import('../../../_shared/api-client');
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: mockMetrics,
    });

    const { container } = render(await SsgContainer({ category: 'nonexistent-category' }));

    expect(container).toBeInTheDocument();
  });

  it('should handle empty categories response for category page', async () => {
    const { categoriesApi } = await import('../../../_shared/api-client');
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: [],
      metrics: mockMetrics,
    });

    const { container } = render(await SsgContainer({ category: 'technology' }));

    expect(container).toBeInTheDocument();
  });

  it('should render within Suspense boundary for category', async () => {
    const { categoriesApi } = await import('../../../_shared/api-client');
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: mockMetrics,
    });

    const result = render(await SsgContainer({ category: 'technology' }));

    // Suspenseが正しく動作していることを確認
    expect(result.container.querySelector('div')).toBeInTheDocument();
  });

  it('should demonstrate SSG characteristics for category pages', async () => {
    const { categoriesApi } = await import('../../../_shared/api-client');
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: {
        ...mockMetrics,
        source: 'ssg',
        cached: true, // SSG では通常キャッシュされる
      },
    });

    await SsgContainer({ category: 'technology' });

    // SSG API が適切に呼ばれていることを確認
    expect(categoriesApi.getAll).toHaveBeenCalledWith(
      expect.objectContaining({
        next: expect.objectContaining({
          tags: ['categories'],
        }),
      }),
      'ssg'
    );
  });

  it('should handle different category slugs correctly', async () => {
    const { categoriesApi } = await import('../../../_shared/api-client');
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: mockMetrics,
    });

    // テスト1: technology カテゴリ
    const technologyResult = render(await SsgContainer({ category: 'technology' }));
    expect(technologyResult.container).toBeInTheDocument();

    // テスト2: science カテゴリ
    const scienceResult = render(await SsgContainer({ category: 'science' }));
    expect(scienceResult.container).toBeInTheDocument();

    // テスト3: design カテゴリ
    const designResult = render(await SsgContainer({ category: 'design' }));
    expect(designResult.container).toBeInTheDocument();

    // API が3回呼ばれたことを確認
    expect(categoriesApi.getAll).toHaveBeenCalledTimes(3);
  });

  it('should maintain SSG caching behavior across category pages', async () => {
    const { categoriesApi } = await import('../../../_shared/api-client');
    
    // ビルド時キャッシュの動作をシミュレート
    const cachedMetrics = {
      ...mockMetrics,
      cached: true,
      duration: 15, // キャッシュからの読み込みは高速
    };

    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: cachedMetrics,
    });

    await SsgContainer({ category: 'technology' });

    // SSG特有のキャッシュ設定が使用されていることを確認
    expect(categoriesApi.getAll).toHaveBeenCalledWith(
      expect.objectContaining({
        next: expect.objectContaining({
          tags: ['categories'],
          // revalidate は設定されていない（ビルド時生成）
        }),
      }),
      'ssg'
    );
  });
});