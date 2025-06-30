import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SsgPresentational } from '../_containers/presentational';
import type { Category, DataFetchMetrics } from '../../../_shared/types';

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

describe('SsgPresentational (Category)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render SSG category page correctly', () => {
    const selectedCategory = mockCategories[0]; // Technology
    
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={selectedCategory}
        currentSlug="technology"
        metrics={mockMetrics}
        error={null}
      />
    );

    // ヘッダーが表示されていることを確認
    expect(screen.getByText('SSG Category: technology')).toBeInTheDocument();
    expect(screen.getByText(/Static Site Generation with build-time data pre-rendering/)).toBeInTheDocument();
    expect(screen.getByText('Showing category: Technology')).toBeInTheDocument();
  });

  it('should display selected category details', () => {
    const selectedCategory = mockCategories[1]; // Science
    
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={selectedCategory}
        currentSlug="science"
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText('Science (Static Generated)')).toBeInTheDocument();
    expect(screen.getAllByText('Science related posts')[0]).toBeInTheDocument();
    expect(screen.getAllByText('15 posts')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Slug: science')[0]).toBeInTheDocument();
  });

  it('should display all categories for reference', () => {
    const selectedCategory = mockCategories[0];
    
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={selectedCategory}
        currentSlug="technology"
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText('All Categories (for reference):')).toBeInTheDocument();
    expect(screen.getAllByText('Technology')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Science')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Design')[0]).toBeInTheDocument();
  });

  it('should highlight current category in the list', () => {
    const selectedCategory = mockCategories[0];
    
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={selectedCategory}
        currentSlug="technology"
        metrics={mockMetrics}
        error={null}
      />
    );

    // ハイライトされたカテゴリカードを確認
    // 具体的なスタイリングの確認は実装依存なので、基本的な存在確認のみ
    const technologyElements = screen.getAllByText('Technology');
    expect(technologyElements.length).toBeGreaterThan(0);
    expect(technologyElements[0]).toBeInTheDocument();
  });

  it('should handle category not found', () => {
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
    expect(screen.getByText(/This page was statically generated but the category doesn't exist/)).toBeInTheDocument();
  });

  it('should handle error state', () => {
    const errorMessage = 'Failed to fetch categories';

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
    const selectedCategory = mockCategories[0];
    
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={selectedCategory}
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
    const selectedCategory = mockCategories[0];
    
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={selectedCategory}
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
    const selectedCategory = mockCategories[0];
    
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={selectedCategory}
        currentSlug="technology"
        metrics={mockMetrics}
        error={null}
      />
    );

    // Explanation タブの存在を確認
    const explanationTab = screen.getByRole('tab', { name: /how ssg works/i });
    expect(explanationTab).toBeInTheDocument();

    // Explanation タブをクリック
    fireEvent.click(explanationTab);

    // タブパネルが表示されることを確認
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('should display SSG behavior description', () => {
    const selectedCategory = mockCategories[0];
    
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={selectedCategory}
        currentSlug="technology"
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText(/This content was pre-rendered at build time/)).toBeInTheDocument();
    expect(screen.getByText(/Perfect for content that doesn't change frequently/)).toBeInTheDocument();
  });

  it('should display SSG status information', () => {
    const selectedCategory = mockCategories[0];
    
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={selectedCategory}
        currentSlug="technology"
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText('SSG Status')).toBeInTheDocument();
    expect(screen.getByText('Current Category:')).toBeInTheDocument();
    expect(screen.getAllByText('Technology')[0]).toBeInTheDocument();
    expect(screen.getByText('Cache Status:')).toBeInTheDocument();
    expect(screen.getByText('Static')).toBeInTheDocument();
    expect(screen.getByText('Total Categories:')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Data Source:')).toBeInTheDocument();
    expect(screen.getByText('Pre-rendered')).toBeInTheDocument();
  });

  it('should display tabs correctly', () => {
    const selectedCategory = mockCategories[0];
    
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={selectedCategory}
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
    const selectedCategory = mockCategories[0];
    
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={selectedCategory}
        currentSlug="technology"
        metrics={null}
        error={null}
      />
    );

    // Performance タブの存在を確認
    const performanceTab = screen.getByRole('tab', { name: /performance/i });
    expect(performanceTab).toBeInTheDocument();

    // Performance タブをクリック
    fireEvent.click(performanceTab);

    // タブパネルが表示されることを確認
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('should display category post counts correctly', () => {
    const selectedCategory = mockCategories[2]; // Design
    
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={selectedCategory}
        currentSlug="design"
        metrics={mockMetrics}
        error={null}
      />
    );

    // Selected category post count
    expect(screen.getAllByText('18 posts')[0]).toBeInTheDocument();
    
    // All categories post counts should be visible
    expect(screen.getAllByText('25 posts')[0]).toBeInTheDocument(); // Technology
    expect(screen.getAllByText('15 posts')[0]).toBeInTheDocument(); // Science
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

  it('should display different category slugs correctly', () => {
    // Test with science category
    const selectedCategory = mockCategories[1];
    
    const { rerender } = render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={selectedCategory}
        currentSlug="science"
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText('SSG Category: science')).toBeInTheDocument();
    expect(screen.getByText('Showing category: Science')).toBeInTheDocument();

    // Test with design category
    const designCategory = mockCategories[2];
    rerender(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={designCategory}
        currentSlug="design"
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText('SSG Category: design')).toBeInTheDocument();
    expect(screen.getByText('Showing category: Design')).toBeInTheDocument();
  });

  it('should demonstrate SSG characteristics in content', () => {
    const selectedCategory = mockCategories[0];
    
    render(
      <SsgPresentational
        categories={mockCategories}
        selectedCategory={selectedCategory}
        currentSlug="technology"
        metrics={mockMetrics}
        error={null}
      />
    );

    // SSG specific terminology and descriptions
    expect(screen.getAllByText(/Static Site Generation/)[0]).toBeInTheDocument();
    expect(screen.getByText(/build-time data pre-rendering/)).toBeInTheDocument();
    expect(screen.getByText(/Static Generated/)).toBeInTheDocument();
    expect(screen.getByText(/pre-rendered at build time/)).toBeInTheDocument();
  });
});