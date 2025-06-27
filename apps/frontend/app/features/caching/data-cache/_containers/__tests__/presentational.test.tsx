// DataCachePresentational Client Componentのテスト

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataCachePresentational } from '../presentational';
import { cacheTestApi, revalidationApi } from '../../../_shared/cache-api-client';

// モック設定
vi.mock('../../../_shared/cache-api-client');
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}));
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-variant={variant}>{children}</span>
  ),
}));
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));
vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsContent: ({ children, value }: any) => <div data-tab-content={value}>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children, value }: any) => <button data-tab={value}>{children}</button>,
}));
vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant }: any) => <div data-alert-variant={variant}>{children}</div>,
  AlertDescription: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: any) => <div data-progress={value} />,
}));
vi.mock('@/components/enhanced-performance-display', () => ({
  EnhancedPerformanceDisplay: ({ title }: any) => <div data-testid="performance-display">{title}</div>,
}));
vi.mock('@/components/code-display', () => ({
  CodeDisplay: ({ title }: any) => <div data-testid="code-display">{title}</div>,
}));

const mockCacheTestApi = vi.mocked(cacheTestApi);
const mockRevalidationApi = vi.mocked(revalidationApi);

// モックデータ
const mockInitialData = [
  {
    id: 1,
    title: 'Test Category 1',
    content: 'Test content 1',
    category: 'test',
    timestamp: '2023-01-01T00:00:00Z',
    size: 1024,
    views: 100,
    name: 'Test Item 1',
    postCount: 5,
    description: 'Test description 1',
  },
  {
    id: 2,
    title: 'Test Category 2',
    content: 'Test content 2',
    category: 'test',
    timestamp: '2023-01-02T00:00:00Z',
    size: 2048,
    views: 200,
    name: 'Test Item 2',
    postCount: 3,
    description: 'Test description 2',
  },
];

const mockInitialMetadata = {
  cached: true,
  cacheStatus: 'fresh' as const,
  strategy: 'data-cache' as const,
  timestamp: '2023-01-01T00:00:00Z',
  source: 'cache' as const,
  ttl: 3600,
  tags: ['cache-test'],
};

const mockInitialMetrics = {
  fetchTime: 50,
  dataSize: 2048,
  cacheHit: true,
};

const mockRefreshResponse = {
  data: [
    {
      id: 3,
      title: 'New Category',
      content: 'New content',
      category: 'new',
      timestamp: '2023-01-03T00:00:00Z',
      size: 1500,
      views: 150,
      name: 'New Item',
      postCount: 2,
      description: 'New description',
    },
  ],
  metadata: mockInitialMetadata,
  metrics: mockInitialMetrics,
};

const mockRevalidationOperation = {
  id: 'revalidation-1',
  type: 'tag' as const,
  target: 'categories',
  success: true,
  timestamp: new Date().toISOString(),
  duration: 150,
};

describe('DataCachePresentational', () => {
  const defaultProps = {
    initialData: mockInitialData,
    initialMetadata: mockInitialMetadata,
    initialMetrics: mockInitialMetrics,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初期レンダリング', () => {
    it('should render with initial data', () => {
      // Act
      render(<DataCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText('Data Cache Demo')).toBeInTheDocument();
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
      expect(screen.getByText('5 posts')).toBeInTheDocument();
      expect(screen.getByText('3 posts')).toBeInTheDocument();
    });

    it('should display cache status correctly', () => {
      // Act
      render(<DataCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText('HIT')).toBeInTheDocument();
      expect(screen.getByText('cache')).toBeInTheDocument();
      expect(screen.getByText('3600s')).toBeInTheDocument();
      expect(screen.getByText('cache-test')).toBeInTheDocument();
    });

    it('should show error when provided', () => {
      // Arrange
      const propsWithError = {
        ...defaultProps,
        error: 'Test error message',
      };

      // Act
      render(<DataCachePresentational {...propsWithError} />);

      // Assert
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should handle empty data', () => {
      // Arrange
      const propsWithEmptyData = {
        ...defaultProps,
        initialData: [],
      };

      // Act
      render(<DataCachePresentational {...propsWithEmptyData} />);

      // Assert
      expect(screen.getByText('No cached data available')).toBeInTheDocument();
    });
  });

  describe('ユーザーインタラクション', () => {
    it('should toggle code display', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<DataCachePresentational {...defaultProps} />);

      // Act
      const codeButton = screen.getByText('Show Code');
      await user.click(codeButton);

      // Assert
      expect(screen.getByTestId('code-display')).toBeInTheDocument();
      expect(screen.getByText('Hide Code')).toBeInTheDocument();
    });

    it('should refresh data when refresh button clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      mockCacheTestApi.getDataCacheDemo.mockResolvedValue(mockRefreshResponse);
      render(<DataCachePresentational {...defaultProps} />);

      // Act
      const refreshButton = screen.getByText('Refresh Data');
      await user.click(refreshButton);

      // Assert
      await waitFor(() => {
        expect(mockCacheTestApi.getDataCacheDemo).toHaveBeenCalledWith(['cache-demo', 'categories']);
      });
    });

    it('should disable refresh button while loading', async () => {
      // Arrange
      const user = userEvent.setup();
      mockCacheTestApi.getDataCacheDemo.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockRefreshResponse), 100))
      );
      render(<DataCachePresentational {...defaultProps} />);

      // Act
      const refreshButton = screen.getByText('Refresh Data');
      await user.click(refreshButton);

      // Assert
      expect(refreshButton).toBeDisabled();
    });

    it('should handle revalidation button clicks', async () => {
      // Arrange
      const user = userEvent.setup();
      mockRevalidationApi.revalidateTag.mockResolvedValue(mockRevalidationOperation);
      mockCacheTestApi.getDataCacheDemo.mockResolvedValue(mockRefreshResponse);
      render(<DataCachePresentational {...defaultProps} />);

      // Act
      const revalidateButton = screen.getByText('Revalidate "categories"');
      await user.click(revalidateButton);

      // Assert
      await waitFor(() => {
        expect(mockRevalidationApi.revalidateTag).toHaveBeenCalledWith('categories');
      });
    });
  });

  describe('メトリクス表示', () => {
    it('should calculate and display hit rate correctly', () => {
      // Act
      render(<DataCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText('100.0%')).toBeInTheDocument();
      expect(screen.getByText('Hits: 1')).toBeInTheDocument();
      expect(screen.getByText('Misses: 0')).toBeInTheDocument();
    });

    it('should display cache metrics with miss scenario', () => {
      // Arrange
      const propsWithMiss = {
        ...defaultProps,
        initialMetadata: {
          ...mockInitialMetadata,
          cached: false,
        },
      };

      // Act
      render(<DataCachePresentational {...propsWithMiss} />);

      // Assert
      expect(screen.getByText('MISS')).toBeInTheDocument();
      expect(screen.getByText('0.0%')).toBeInTheDocument();
      expect(screen.getByText('Hits: 0')).toBeInTheDocument();
      expect(screen.getByText('Misses: 1')).toBeInTheDocument();
    });

    it('should display performance metrics', () => {
      // Act
      render(<DataCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByTestId('performance-display')).toBeInTheDocument();
      expect(screen.getByText('Data Cache Performance')).toBeInTheDocument();
    });
  });

  describe('リバリデーション操作', () => {
    it('should add revalidation to history after successful operation', async () => {
      // Arrange
      const user = userEvent.setup();
      mockRevalidationApi.revalidateTag.mockResolvedValue(mockRevalidationOperation);
      mockCacheTestApi.getDataCacheDemo.mockResolvedValue(mockRefreshResponse);
      render(<DataCachePresentational {...defaultProps} />);

      // Act - Operationsタブに切り替え（テスト環境では直接アクセス）
      const operationsTab = screen.getByText('Operations');
      await user.click(operationsTab);
      
      // revalidationを実行
      const revalidateButton = screen.getByText('Revalidate "categories"');
      await user.click(revalidateButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Tag: categories')).toBeInTheDocument();
        expect(screen.getByText('Success')).toBeInTheDocument();
      });
    });

    it('should show empty state when no revalidations', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<DataCachePresentational {...defaultProps} />);

      // Act
      const operationsTab = screen.getByText('Operations');
      await user.click(operationsTab);

      // Assert
      expect(screen.getByText('No revalidation operations yet')).toBeInTheDocument();
    });
  });

  describe('エラーハンドリング', () => {
    it('should handle refresh errors gracefully', async () => {
      // Arrange
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockCacheTestApi.getDataCacheDemo.mockRejectedValue(new Error('Network error'));
      render(<DataCachePresentational {...defaultProps} />);

      // Act
      const refreshButton = screen.getByText('Refresh Data');
      await user.click(refreshButton);

      // Assert
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Refresh error:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    it('should handle revalidation errors gracefully', async () => {
      // Arrange
      const user = userEvent.setup();
      const failedOperation = {
        ...mockRevalidationOperation,
        success: false,
      };
      mockRevalidationApi.revalidateTag.mockResolvedValue(failedOperation);
      render(<DataCachePresentational {...defaultProps} />);

      // Act
      const revalidateButton = screen.getByText('Revalidate "categories"');
      await user.click(revalidateButton);

      // Assert
      await waitFor(() => {
        // 失敗時は自動リフレッシュを実行しない
        expect(mockCacheTestApi.getDataCacheDemo).not.toHaveBeenCalled();
      });
    });
  });

  describe('タブナビゲーション', () => {
    it('should render all tabs', () => {
      // Act
      render(<DataCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText('Demo')).toBeInTheDocument();
      expect(screen.getByText('Metrics')).toBeInTheDocument();
      expect(screen.getByText('Operations')).toBeInTheDocument();
      expect(screen.getByText('How It Works')).toBeInTheDocument();
    });

    it('should display explanation content', () => {
      // Act
      render(<DataCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText('How Data Cache Works')).toBeInTheDocument();
      expect(screen.getByText('1. Automatic Caching')).toBeInTheDocument();
      expect(screen.getByText('2. Cache Tags')).toBeInTheDocument();
      expect(screen.getByText('3. Revalidation Strategies')).toBeInTheDocument();
    });
  });
});