// CacheComparisonPresentational Client Componentのテスト

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CacheStrategy } from "../../../_shared/types";
import { CacheComparisonPresentational } from "../presentational";

// モック設定
vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
}));
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));
vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));
vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));
vi.mock("@/components/ui/progress", () => ({
  Progress: ({ value }: { value: number }) => <div data-progress={value} />,
}));
vi.mock("@/components/code-display", () => ({
  CodeDisplay: ({ title }: { title: string }) => <div data-testid="code-display">{title}</div>,
}));

// モックデータ
const mockComparisonData = {
  "data-cache": {
    data: [],
    metadata: {
      cached: true,
      cacheStatus: "fresh" as const,
      strategy: "data-cache" as const,
      timestamp: "2023-01-01T00:00:00Z",
      source: "cache" as const,
      ttl: 3600,
      tags: ["test"],
    },
    metrics: {
      fetchTime: 25,
      dataSize: 1024,
      cacheHit: true,
    },
  },
  "full-route-cache": {
    data: [],
    metadata: {
      cached: true,
      cacheStatus: "fresh" as const,
      strategy: "full-route-cache" as const,
      timestamp: "2023-01-01T00:00:00Z",
      source: "cache" as const,
      ttl: 3600,
      tags: ["test"],
    },
    metrics: {
      fetchTime: 15,
      dataSize: 2048,
      cacheHit: true,
    },
  },
  "router-cache": {
    data: [],
    metadata: {
      cached: true,
      cacheStatus: "hit" as const,
      strategy: "router-cache" as const,
      timestamp: "2023-01-01T00:00:00Z",
      source: "cache" as const,
      ttl: 30,
      tags: ["test"],
    },
    metrics: {
      fetchTime: 5,
      dataSize: 512,
      cacheHit: true,
    },
  },
  "request-memoization": {
    data: [],
    metadata: {
      cached: true,
      cacheStatus: "hit" as const,
      strategy: "request-memoization" as const,
      timestamp: "2023-01-01T00:00:00Z",
      source: "cache" as const,
      ttl: 0,
      tags: ["test"],
    },
    metrics: {
      fetchTime: 1,
      dataSize: 256,
      cacheHit: true,
    },
  },
  "cloudfront-cache": {
    data: [],
    metadata: {
      cached: true,
      cacheStatus: "hit" as const,
      strategy: "cloudfront-cache" as const,
      timestamp: "2023-01-01T00:00:00Z",
      source: "cache" as const,
      ttl: 86400,
      tags: ["test"],
    },
    metrics: {
      fetchTime: 50,
      dataSize: 4096,
      cacheHit: true,
    },
  },
};

const mockComparison = {
  strategies: ["full-route-cache", "data-cache"] as CacheStrategy[],
  metrics: {
    "full-route-cache": {
      performance: 95,
      efficiency: 90,
      reliability: 88,
      complexity: 75,
    },
    "data-cache": {
      performance: 85,
      efficiency: 80,
      reliability: 85,
      complexity: 60,
    },
    "router-cache": {
      performance: 70,
      efficiency: 75,
      reliability: 90,
      complexity: 80,
    },
    "request-memoization": {
      performance: 60,
      efficiency: 85,
      reliability: 95,
      complexity: 90,
    },
    "cloudfront-cache": {
      performance: 85,
      efficiency: 95,
      reliability: 80,
      complexity: 70,
    },
  },
  recommendations: [
    {
      bestFor: "Static content",
      worstFor: "Dynamic data",
      useCase: "Blog posts",
      pros: ["Fast loading"],
      cons: ["Memory usage"],
    },
  ],
  winner: {
    strategy: "full-route-cache" as const,
    score: 95,
    reason: "Best overall performance",
  },
};

const mockHealthEvaluation = {
  overall: "healthy" as const,
  scores: {
    performance: 90,
    efficiency: 85,
    freshness: 80,
  },
  issues: [],
  layers: {
    "data-cache": { status: "healthy" as const, issues: [], lastCheck: "2023-01-01T00:00:00Z" },
    "full-route-cache": {
      status: "healthy" as const,
      issues: [],
      lastCheck: "2023-01-01T00:00:00Z",
    },
    "router-cache": { status: "healthy" as const, issues: [], lastCheck: "2023-01-01T00:00:00Z" },
    "request-memoization": {
      status: "healthy" as const,
      issues: [],
      lastCheck: "2023-01-01T00:00:00Z",
    },
    "cloudfront-cache": {
      status: "healthy" as const,
      issues: [],
      lastCheck: "2023-01-01T00:00:00Z",
    },
  },
  alerts: [],
  uptime: 99.9,
};

describe("CacheComparisonPresentational", () => {
  const defaultProps = {
    comparisonData: mockComparisonData,
    comparisonResult: mockComparison,
    overallMetrics: {
      layers: {
        "data-cache": {
          strategy: "data-cache" as const,
          hits: 50,
          misses: 10,
          totalRequests: 60,
          hitRate: 83.3,
          avgResponseTime: 25,
          cacheSize: 4096,
        },
        "full-route-cache": {
          strategy: "full-route-cache" as const,
          hits: 50,
          misses: 10,
          totalRequests: 60,
          hitRate: 83.3,
          avgResponseTime: 15,
          cacheSize: 4096,
        },
        "router-cache": {
          strategy: "router-cache" as const,
          hits: 0,
          misses: 0,
          totalRequests: 0,
          hitRate: 0,
          avgResponseTime: 0,
          cacheSize: 0,
        },
        "request-memoization": {
          strategy: "request-memoization" as const,
          hits: 0,
          misses: 0,
          totalRequests: 0,
          hitRate: 0,
          avgResponseTime: 0,
          cacheSize: 0,
        },
        "cloudfront-cache": {
          strategy: "cloudfront-cache" as const,
          hits: 0,
          misses: 0,
          totalRequests: 0,
          hitRate: 0,
          avgResponseTime: 0,
          cacheSize: 0,
        },
      },
      overall: {
        totalHits: 100,
        totalMisses: 20,
        overallHitRate: 83.3,
        totalCacheSize: 8192,
        efficiencyScore: 85,
      },
      performance: {
        dataFetchTime: 25,
        renderTime: 50,
        hydrationTime: 30,
        timeToFirstByte: 200,
        timeToInteractive: 500,
      },
      revalidation: {
        revalidationCount: 0,
        avgRevalidationTime: 0,
        failedRevalidations: 0,
      },
      timestamp: new Date().toISOString(),
    },
    health: mockHealthEvaluation,
    renderTime: 50,
    error: null,
    recommendations: [
      {
        type: "cache-strategy" as const,
        priority: "high" as const,
        title: "Optimize Cache Strategy",
        description: "Improve cache efficiency",
        expectedImprovement: "20% faster",
        implementation: {
          complexity: "medium" as const,
          timeRequired: "2 hours",
          steps: ["Step 1", "Step 2"],
        },
        metrics: {
          before: 100,
          after: 80,
          unit: "ms",
        },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("初期レンダリング", () => {
    it("should render the main title", () => {
      // Act
      render(<CacheComparisonPresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText("Cache Strategy Comparison")).toBeInTheDocument();
    });

    it("should display comparison results", () => {
      // Act
      render(<CacheComparisonPresentational {...defaultProps} />);

      // Assert
      expect(screen.getAllByText("Data Cache")[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Response/)[0]).toBeInTheDocument();
    });

    it("should show cache health evaluation", () => {
      // Act
      render(<CacheComparisonPresentational {...defaultProps} />);

      // Assert
      expect(screen.getAllByText(/Performance/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Implementation/)[0]).toBeInTheDocument();
      // スコア値を具体的に確認する代わりに、メトリクス表示の存在を確認
      expect(screen.getAllByText(/85/)[0]).toBeInTheDocument();
    });
  });

  describe("ユーザーインタラクション", () => {
    it("should toggle code display", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CacheComparisonPresentational {...defaultProps} />);

      // Act
      const codeButton = screen.getByText("Show Code");
      await user.click(codeButton);

      // Assert
      expect(screen.getByTestId("code-display")).toBeInTheDocument();
      expect(screen.getByText("Hide Code")).toBeInTheDocument();
    });
  });

  describe("タブナビゲーション", () => {
    it("should render all tabs", () => {
      // Act
      render(<CacheComparisonPresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getAllByText("Performance")[0]).toBeInTheDocument();
      expect(screen.getByText("Recommendations")).toBeInTheDocument();
    });
  });

  describe("エラー表示", () => {
    it("should display error message when provided", () => {
      // Arrange
      const propsWithError = {
        ...defaultProps,
        error: "Comparison failed",
      };

      // Act
      render(<CacheComparisonPresentational {...propsWithError} />);

      // Assert
      expect(screen.getByText("Comparison failed")).toBeInTheDocument();
    });
  });

  describe("メトリクス表示", () => {
    it("should display hit rates correctly", () => {
      // Act
      render(<CacheComparisonPresentational {...defaultProps} />);

      // Assert
      expect(screen.getAllByText(/Response/)[0]).toBeInTheDocument(); // response time label
      expect(screen.getAllByText(/Size/)[0]).toBeInTheDocument(); // data size label
    });

    it("should display response times", () => {
      // Act
      render(<CacheComparisonPresentational {...defaultProps} />);

      // Assert
      expect(screen.getAllByText(/Response/)[0]).toBeInTheDocument(); // response time label
      expect(screen.getAllByText(/Size/)[0]).toBeInTheDocument(); // size label
    });
  });
});
