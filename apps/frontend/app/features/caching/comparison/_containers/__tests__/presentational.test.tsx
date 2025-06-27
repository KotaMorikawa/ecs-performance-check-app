// CacheComparisonPresentational Client Componentのテスト

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CacheComparisonPresentational } from '../presentational';

// モック設定
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}));
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
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
vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: any) => <div data-progress={value} />,
}));
vi.mock('@/components/code-display', () => ({
  CodeDisplay: ({ title }: any) => <div data-testid="code-display">{title}</div>,
}));

// モックデータ
const mockComparisonData = {
  'data-cache': {
    strategy: 'data-cache' as const,
    hits: 8,
    misses: 2,
    totalRequests: 10,
    hitRate: 80,
    avgResponseTime: 25,
    cacheSize: 1024,
  },
  'full-route-cache': {
    strategy: 'full-route-cache' as const,
    hits: 9,
    misses: 1,
    totalRequests: 10,
    hitRate: 90,
    avgResponseTime: 15,
    cacheSize: 2048,
  },
};

const mockComparison = {
  winner: 'full-route-cache' as const,
  rankings: ['full-route-cache', 'data-cache'],
  scores: {
    'full-route-cache': 95,
    'data-cache': 85,
  },
};

const mockRecommendations = [
  {
    strategy: 'full-route-cache' as const,
    priority: 'high' as const,
    reason: 'Best overall performance',
    impact: 'Significant performance improvement',
  },
];

const mockHealthEvaluation = {
  overall: 'good' as const,
  scores: {
    performance: 90,
    efficiency: 85,
    freshness: 80,
  },
  issues: [],
};

describe('CacheComparisonPresentational', () => {
  const defaultProps = {
    comparisonData: mockComparisonData,
    comparison: mockComparison,
    recommendations: mockRecommendations,
    healthEvaluation: mockHealthEvaluation,
    renderTime: 50,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初期レンダリング', () => {
    it('should render the main title', () => {
      // Act
      render(<CacheComparisonPresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText('Cache Strategy Comparison')).toBeInTheDocument();
    });

    it('should display comparison results', () => {
      // Act
      render(<CacheComparisonPresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText(/full-route-cache/)).toBeInTheDocument();
      expect(screen.getByText(/data-cache/)).toBeInTheDocument();
    });

    it('should show cache health evaluation', () => {
      // Act
      render(<CacheComparisonPresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText(/Performance/)).toBeInTheDocument();
      expect(screen.getByText(/Efficiency/)).toBeInTheDocument();
      expect(screen.getByText(/Freshness/)).toBeInTheDocument();
    });
  });

  describe('ユーザーインタラクション', () => {
    it('should toggle code display', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CacheComparisonPresentational {...defaultProps} />);

      // Act
      const codeButton = screen.getByText('Show Code');
      await user.click(codeButton);

      // Assert
      expect(screen.getByTestId('code-display')).toBeInTheDocument();
      expect(screen.getByText('Hide Code')).toBeInTheDocument();
    });
  });

  describe('タブナビゲーション', () => {
    it('should render all tabs', () => {
      // Act
      render(<CacheComparisonPresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Detailed Analysis')).toBeInTheDocument();
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
    });
  });

  describe('エラー表示', () => {
    it('should display error message when provided', () => {
      // Arrange
      const propsWithError = {
        ...defaultProps,
        error: 'Comparison failed',
      };

      // Act
      render(<CacheComparisonPresentational {...propsWithError} />);

      // Assert
      expect(screen.getByText('Comparison failed')).toBeInTheDocument();
    });
  });

  describe('メトリクス表示', () => {
    it('should display hit rates correctly', () => {
      // Act
      render(<CacheComparisonPresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText('80%')).toBeInTheDocument(); // data-cache hit rate
      expect(screen.getByText('90%')).toBeInTheDocument(); // full-route-cache hit rate
    });

    it('should display response times', () => {
      // Act
      render(<CacheComparisonPresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText('25ms')).toBeInTheDocument(); // data-cache response time
      expect(screen.getByText('15ms')).toBeInTheDocument(); // full-route-cache response time
    });
  });
});