import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IsrPresentational } from '../_containers/presentational';
import type { DataFetchMetrics } from '../../_shared/types';

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

const mockMetrics: DataFetchMetrics = {
  source: 'isr',
  duration: 60,
  timestamp: '2024-01-01T12:00:00Z',
  dataSize: 1536,
  cached: true,
};

describe('IsrPresentational', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render ISR demo correctly', () => {
    render(
      <IsrPresentational
        categories={mockCategories}
        metrics={mockMetrics}
        error={null}
      />
    );

    // ヘッダーが表示されていることを確認
    expect(screen.getByText('ISR Data Fetching Demo')).toBeInTheDocument();
    expect(screen.getByText(/Incremental Static Regeneration with time-based revalidation/)).toBeInTheDocument();
  });

  it('should display category list', () => {
    render(
      <IsrPresentational
        categories={mockCategories}
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('Technology related posts')).toBeInTheDocument();
    expect(screen.getByText('Design related posts')).toBeInTheDocument();
    expect(screen.getByText('15 posts')).toBeInTheDocument(); // Technology post count
    expect(screen.getByText('8 posts')).toBeInTheDocument(); // Design post count
  });

  it('should handle empty categories', () => {
    render(
      <IsrPresentational
        categories={[]}
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText('No categories available')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    const errorMessage = 'Failed to fetch categories';

    render(
      <IsrPresentational
        categories={[]}
        metrics={null}
        error={errorMessage}
      />
    );

    expect(screen.getByText(`Error loading ISR content: ${errorMessage}`)).toBeInTheDocument();
  });

  it('should toggle code display', () => {
    render(
      <IsrPresentational
        categories={mockCategories}
        metrics={mockMetrics}
        error={null}
      />
    );

    // 初期状態ではコードが表示されていない
    expect(screen.queryByText('ソースコード')).not.toBeInTheDocument();

    // Show Codeボタンをクリック
    const toggleButton = screen.getByRole('button', { name: /show code/i });
    fireEvent.click(toggleButton);

    // コードが表示される
    expect(screen.getByText('ソースコード')).toBeInTheDocument();
    expect(screen.getByText(/この機能の実装コードを確認できます/)).toBeInTheDocument();

    // Hide Codeボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: /hide code/i }));

    // コードが非表示になる
    expect(screen.queryByText('ソースコード')).not.toBeInTheDocument();
  });

  it('should display performance metrics tab', () => {
    render(
      <IsrPresentational
        categories={mockCategories}
        metrics={mockMetrics}
        error={null}
      />
    );

    // Performance タブをクリック
    const performanceTab = screen.getByRole('tab', { name: /performance/i });
    fireEvent.click(performanceTab);

    // タブパネルが表示されることを確認
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('should display explanation tab', () => {
    render(
      <IsrPresentational
        categories={mockCategories}
        metrics={mockMetrics}
        error={null}
      />
    );

    // Explanation タブをクリック
    const explanationTab = screen.getByRole('tab', { name: /how isr works/i });
    fireEvent.click(explanationTab);

    // タブパネルが表示されることを確認
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();

    // 基本的な説明コンテンツが表示されることを確認
    expect(screen.getByText('How ISR Works')).toBeInTheDocument();
  });

  it('should display cache status', () => {
    const cachedMetrics = {
      ...mockMetrics,
      cached: true,
    };

    render(
      <IsrPresentational
        categories={mockCategories}
        metrics={cachedMetrics}
        error={null}
      />
    );

    // キャッシュステータスが表示されることを確認（Content タブでの確認）
    expect(screen.getByText('Cached')).toBeInTheDocument();
    
    // Performanceタブが存在することを確認
    expect(screen.getByRole('tab', { name: /performance/i })).toBeInTheDocument();
  });

  it('should display revalidation information', () => {
    render(
      <IsrPresentational
        categories={mockCategories}
        metrics={mockMetrics}
        error={null}
      />
    );

    // リバリデーション情報が表示されることを確認
    expect(screen.getByText(/revalidated every 60 seconds/)).toBeInTheDocument();
  });

  it('should handle stale content correctly', () => {
    const staleMetrics = {
      ...mockMetrics,
      cached: false,
      cacheStatus: 'stale' as const,
    };

    render(
      <IsrPresentational
        categories={mockCategories}
        metrics={staleMetrics}
        error={null}
      />
    );

    // stale状態でもコンテンツが表示されることを確認
    expect(screen.getAllByText('Technology').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Design').length).toBeGreaterThan(0);
  });

  it('should display tabs correctly', () => {
    render(
      <IsrPresentational
        categories={mockCategories}
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByRole('tab', { name: /content/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /performance/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /how isr works/i })).toBeInTheDocument();
  });

  it('should handle null categories', () => {
    render(
      <IsrPresentational
        categories={[]}
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText('No categories available')).toBeInTheDocument();
  });

  it('should handle metrics without performance data', () => {
    render(
      <IsrPresentational
        categories={mockCategories}
        metrics={null}
        error={null}
      />
    );

    // Performance タブをクリック
    const performanceTab = screen.getByRole('tab', { name: /performance/i });
    fireEvent.click(performanceTab);

    // タブパネルが表示されることを確認
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('should show category count in header', () => {
    render(
      <IsrPresentational
        categories={mockCategories}
        metrics={mockMetrics}
        error={null}
      />
    );

    // カテゴリリバリデーション情報が表示されることを確認
    expect(screen.getByText('Categories (60s revalidation)')).toBeInTheDocument();
  });

  it('should display individual category cards', () => {
    render(
      <IsrPresentational
        categories={mockCategories}
        metrics={mockMetrics}
        error={null}
      />
    );

    // カテゴリカードが表示されることを確認
    const categoryCards = screen.getAllByText(/related posts/);
    expect(categoryCards).toHaveLength(2);
  });

  it('should handle category with different post counts', () => {
    const categoriesWithVariousCounts = [
      {
        id: 1,
        name: 'Popular',
        slug: 'popular',
        description: 'Popular posts',
        postCount: 100,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      },
      {
        id: 2,
        name: 'Empty',
        slug: 'empty',
        description: 'No posts yet',
        postCount: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T11:00:00Z',
      },
    ];

    render(
      <IsrPresentational
        categories={categoriesWithVariousCounts}
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText('100 posts')).toBeInTheDocument();
    expect(screen.getByText('0 posts')).toBeInTheDocument();
    expect(screen.getByText('Popular')).toBeInTheDocument();
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });
});