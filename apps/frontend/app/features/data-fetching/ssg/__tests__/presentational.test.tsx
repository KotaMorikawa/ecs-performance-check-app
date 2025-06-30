import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SsgPresentational } from '../[category]/_containers/presentational';
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
  {
    id: 3,
    name: 'Science',
    slug: 'science',
    description: 'Science related posts',
    postCount: 12,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T09:00:00Z',
  },
];

const mockSelectedCategory = mockCategories[0]; // Technology

const mockMetrics: DataFetchMetrics = {
  source: 'ssg',
  duration: 0, // SSG では build time で実行されるため
  timestamp: '2024-01-01T12:00:00Z',
  dataSize: 2048,
  cached: true,
};

describe('SsgPresentational', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render SSG demo correctly', () => {
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={mockSelectedCategory}
        currentSlug="technology"
        metrics={mockMetrics}
        error={null}
      />
    );

    // ヘッダーが表示されていることを確認
    expect(screen.getByText('SSG Category: technology')).toBeInTheDocument();
    expect(screen.getByText(/Static Site Generation with build-time data pre-rendering/)).toBeInTheDocument();
  });

  it('should display selected category information', () => {
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={mockSelectedCategory}
        currentSlug="technology"
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getAllByText('Technology').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Technology related posts').length).toBeGreaterThan(0);
    expect(screen.getAllByText('15 posts').length).toBeGreaterThan(0); // Post count
  });

  it('should display all available categories', () => {
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={mockSelectedCategory}
        currentSlug="technology"
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getAllByText('Technology').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Design').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Science').length).toBeGreaterThan(0);
  });

  it('should handle missing selected category', () => {
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={null}
        currentSlug="nonexistent"
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText(/Category "nonexistent" not found/)).toBeInTheDocument();
  });

  it('should handle error state', () => {
    const errorMessage = 'Failed to load category data';

    render(
      <SsgPresentational
        categories={[]}
        selectedCategory={null}
        currentSlug="technology"
        metrics={null}
        error={errorMessage}
      />
    );

    expect(screen.getByText(`Error loading SSG content: ${errorMessage}`)).toBeInTheDocument();
  });

  it('should toggle code display', () => {
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={mockSelectedCategory}
        currentSlug="technology"
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
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={mockSelectedCategory}
        currentSlug="technology"
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
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={mockSelectedCategory}
        currentSlug="technology"
        metrics={mockMetrics}
        error={null}
      />
    );

    // Explanation タブをクリック
    const explanationTab = screen.getByRole('tab', { name: /how ssg works/i });
    fireEvent.click(explanationTab);

    // タブパネルが表示されることを確認
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();

    // 基本的な説明コンテンツが表示されることを確認
    expect(screen.getByText('How SSG Works')).toBeInTheDocument();
  });

  it('should highlight current category', () => {
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={mockSelectedCategory}
        currentSlug="technology"
        metrics={mockMetrics}
        error={null}
      />
    );

    // 現在のカテゴリが強調表示されることを確認（border-blue-500 クラスで強調）
    expect(screen.getByText(/Showing category: Technology/)).toBeInTheDocument();
  });

  it('should display build-time generation info', () => {
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={mockSelectedCategory}
        currentSlug="technology"
        metrics={mockMetrics}
        error={null}
      />
    );

    // SSGの特徴が表示されることを確認
    expect(screen.getByText(/Current Category:/)).toBeInTheDocument();
  });

  it('should display all category stats correctly', () => {
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={mockSelectedCategory}
        currentSlug="technology"
        metrics={mockMetrics}
        error={null}
      />
    );

    // 各カテゴリのpost countが表示されることを確認
    expect(screen.getAllByText('15 posts').length).toBeGreaterThan(0); // Technology
    expect(screen.getByText('8 posts')).toBeInTheDocument();  // Design
    expect(screen.getByText('12 posts')).toBeInTheDocument(); // Science
  });

  it('should handle empty categories list', () => {
    render(
      <SsgPresentational
        categories={[]}
        selectedCategory={null}
        currentSlug="technology"
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText(/Category "technology" not found/)).toBeInTheDocument();
  });

  it('should display tabs correctly', () => {
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={mockSelectedCategory}
        currentSlug="technology"
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByRole('tab', { name: /content/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /performance/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /how ssg works/i })).toBeInTheDocument();
  });

  it('should handle metrics without performance data', () => {
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={mockSelectedCategory}
        currentSlug="technology"
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

  it('should show static generation characteristics', () => {
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={mockSelectedCategory}
        currentSlug="technology"
        metrics={mockMetrics}
        error={null}
      />
    );

    // 静的生成の特徴が表示されることを確認
    expect(screen.getByText(/This content was pre-rendered at build time/)).toBeInTheDocument();
  });

  it('should display category creation dates', () => {
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={mockSelectedCategory}
        currentSlug="technology"
        metrics={mockMetrics}
        error={null}
      />
    );

    // カテゴリの作成日が表示されることを確認
    expect(screen.getAllByText(/Created:/).length).toBeGreaterThan(0);
  });

  it('should show category descriptions for all categories', () => {
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={mockSelectedCategory}
        currentSlug="technology"
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getAllByText('Technology related posts').length).toBeGreaterThan(0);
    expect(screen.getByText('Design related posts')).toBeInTheDocument();
    expect(screen.getByText('Science related posts')).toBeInTheDocument();
  });
});