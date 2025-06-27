// OnDemandRevalidationPresentational Client Componentのテスト

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnDemandRevalidationPresentational } from '../presentational';
import { revalidationApi } from '../../../_shared/cache-api-client';

// モック設定
vi.mock('../../../_shared/cache-api-client');
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}));
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));
vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder }: any) => (
    <input value={value} onChange={onChange} placeholder={placeholder} />
  ),
}));
vi.mock('@/components/ui/label', () => ({
  Label: ({ children }: any) => <label>{children}</label>,
}));
vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsContent: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children }: any) => <button>{children}</button>,
}));
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));
vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: any) => <div>{children}</div>,
  AlertDescription: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('@/components/code-display', () => ({
  CodeDisplay: ({ title }: any) => <div data-testid="code-display">{title}</div>,
}));

const mockRevalidationApi = vi.mocked(revalidationApi);

// モックデータ
const mockInitialData = [];
const mockInitialMetadata = {
  cached: true,
  cacheStatus: 'fresh' as const,
  strategy: 'data-cache' as const,
  timestamp: '2023-01-01T00:00:00Z',
  source: 'cache' as const,
  ttl: 3600,
  tags: ['revalidation-demo', 'on-demand'],
};
const mockInitialMetrics = {
  fetchTime: 30,
  dataSize: 1024,
  cacheHit: true,
};

const mockRevalidationOperation = {
  id: 'revalidation-1',
  type: 'tag' as const,
  target: 'categories',
  success: true,
  timestamp: new Date().toISOString(),
  duration: 150,
  triggeredBy: 'user',
  strategy: 'on-demand',
};

describe('OnDemandRevalidationPresentational', () => {
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
    it('should render the main title', () => {
      // Act
      render(<OnDemandRevalidationPresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText('On-demand Revalidation Demo')).toBeInTheDocument();
    });

    it('should display cache status information', () => {
      // Act
      render(<OnDemandRevalidationPresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText('CACHED')).toBeInTheDocument();
      expect(screen.getByText('revalidation-demo')).toBeInTheDocument();
      expect(screen.getByText('on-demand')).toBeInTheDocument();
    });
  });

  describe('ユーザーインタラクション', () => {
    it('should toggle code display', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<OnDemandRevalidationPresentational {...defaultProps} />);

      // Act
      const codeButton = screen.getByText('Show Code');
      await user.click(codeButton);

      // Assert
      expect(screen.getByTestId('code-display')).toBeInTheDocument();
      expect(screen.getByText('Hide Code')).toBeInTheDocument();
    });

    it('should handle tag revalidation', async () => {
      // Arrange
      const user = userEvent.setup();
      mockRevalidationApi.revalidateTag.mockResolvedValue(mockRevalidationOperation);
      render(<OnDemandRevalidationPresentational {...defaultProps} />);

      // Act
      const tagButton = screen.getByText('categories');
      await user.click(tagButton);

      // Assert
      expect(mockRevalidationApi.revalidateTag).toHaveBeenCalledWith('categories');
    });

    it('should handle batch revalidation', async () => {
      // Arrange
      const user = userEvent.setup();
      mockRevalidationApi.revalidateMultipleTags.mockResolvedValue([mockRevalidationOperation]);
      render(<OnDemandRevalidationPresentational {...defaultProps} />);

      // Act
      const batchButton = screen.getByText('Batch Revalidate');
      await user.click(batchButton);

      // Assert
      expect(mockRevalidationApi.revalidateMultipleTags).toHaveBeenCalledWith([
        'categories', 'revalidation-demo', 'on-demand'
      ]);
    });
  });

  describe('タブナビゲーション', () => {
    it('should render all tabs', () => {
      // Act
      render(<OnDemandRevalidationPresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText('Revalidation Controls')).toBeInTheDocument();
      expect(screen.getByText('Operations History')).toBeInTheDocument();
      expect(screen.getByText('Strategies')).toBeInTheDocument();
      expect(screen.getByText('How It Works')).toBeInTheDocument();
    });
  });

  describe('説明コンテンツ', () => {
    it('should display how it works section', () => {
      // Act
      render(<OnDemandRevalidationPresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText('How On-demand Revalidation Works')).toBeInTheDocument();
      expect(screen.getByText('1. Triggered Invalidation')).toBeInTheDocument();
      expect(screen.getByText('2. Selective Cache Invalidation')).toBeInTheDocument();
      expect(screen.getByText('3. External Integration')).toBeInTheDocument();
    });
  });
});