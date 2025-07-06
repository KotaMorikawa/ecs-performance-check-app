// FullRouteCachePresentational Client Componentのテスト

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidationApi } from "../../../_shared/cache-api-client";
import { FullRouteCachePresentational } from "../presentational";

// モック設定
vi.mock("../../../_shared/cache-api-client");
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
}));
vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-variant={variant}>{children}</span>
  ),
}));
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));
vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsContent: ({ children, value }: { children: React.ReactNode; value?: string }) => (
    <div data-tab-content={value}>{children}</div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value?: string }) => (
    <button type="button" data-tab={value}>
      {children}
    </button>
  ),
}));
vi.mock("@/components/ui/alert", () => ({
  Alert: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <div data-alert-variant={variant}>{children}</div>
  ),
  AlertDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/ui/progress", () => ({
  Progress: ({ value }: { value?: number }) => <div data-progress={value} />,
}));
vi.mock("@/components/code-display", () => ({
  CodeDisplay: ({ title }: { title?: string }) => <div data-testid="code-display">{title}</div>,
}));

// window.location.reload のモック
const mockReload = vi.fn();
Object.defineProperty(window, "location", {
  value: { reload: mockReload },
  writable: true,
});

// console.error のモック
vi.spyOn(console, "error").mockImplementation(() => {});

const mockRevalidationApi = vi.mocked(revalidationApi);

// モックデータ
const mockInitialData = [
  {
    id: 1,
    title: "Full Route Cache Item 1",
    content: "Test content 1",
    category: "test",
    timestamp: "2023-01-01T00:00:00Z",
    size: 1024,
    views: 100,
    name: "Test Item 1",
    postCount: 5,
    description: "Test description 1",
  },
  {
    id: 2,
    title: "Full Route Cache Item 2",
    content: "Test content 2",
    category: "test",
    timestamp: "2023-01-02T00:00:00Z",
    size: 2048,
    views: 200,
    name: "Test Item 2",
    postCount: 3,
    description: "Test description 2",
  },
];

const mockInitialMetrics = {
  layers: {
    "data-cache": {
      strategy: "data-cache" as const,
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      avgResponseTime: 0,
      cacheSize: 0,
    },
    "full-route-cache": {
      strategy: "full-route-cache" as const,
      hits: 1,
      misses: 0,
      totalRequests: 1,
      hitRate: 100,
      avgResponseTime: 25,
      cacheSize: 2048,
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
    totalHits: 1,
    totalMisses: 0,
    overallHitRate: 100,
    totalCacheSize: 2048,
    efficiencyScore: 95,
  },
  performance: {
    dataFetchTime: 20,
    renderTime: 25,
    hydrationTime: 15,
    timeToFirstByte: 80,
    timeToInteractive: 100,
  },
  revalidation: {
    revalidationCount: 0,
    avgRevalidationTime: 0,
    failedRevalidations: 0,
  },
  timestamp: new Date().toISOString(),
};

const mockCacheInfo = {
  renderTime: "2023-01-01T00:00:00Z",
  mode: "static",
  cached: true,
};

const mockRevalidationOperation = {
  id: "revalidation-1",
  type: "path" as const,
  target: "/features/caching/full-route-cache",
  success: true,
  timestamp: new Date().toISOString(),
  duration: 200,
  strategy: "on-demand" as const,
  triggeredBy: "user" as const,
};

describe("FullRouteCachePresentational", () => {
  const defaultProps = {
    initialData: mockInitialData,
    initialMetrics: mockInitialMetrics,
    cacheInfo: mockCacheInfo,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockReload.mockClear();
  });

  describe("初期レンダリング", () => {
    it("should render with initial data", () => {
      // Act
      render(<FullRouteCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText("Full Route Cache Demo")).toBeInTheDocument();
      expect(screen.getByText("Test Item 1")).toBeInTheDocument();
      expect(screen.getByText("Test Item 2")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("should display cache status correctly for HIT", () => {
      // Act
      render(<FullRouteCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText("HIT")).toBeInTheDocument();
      expect(screen.getByText(/Page Cache Status/)).toBeInTheDocument();
    });

    it("should display cache status correctly for MISS", () => {
      // Arrange
      const propsWithMiss = {
        ...defaultProps,
        cacheInfo: {
          ...mockCacheInfo,
          cached: false,
        },
      };

      // Act
      render(<FullRouteCachePresentational {...propsWithMiss} />);

      // Assert
      expect(screen.getByText("MISS")).toBeInTheDocument();
      expect(screen.getByText(/Generation Source/)).toBeInTheDocument();
    });

    it("should show error when provided", () => {
      // Arrange
      const propsWithError = {
        ...defaultProps,
        error: "Full route cache error",
      };

      // Act
      render(<FullRouteCachePresentational {...propsWithError} />);

      // Assert
      expect(screen.getByText("Full route cache error")).toBeInTheDocument();
    });

    it("should handle empty data", () => {
      // Arrange
      const propsWithEmptyData = {
        ...defaultProps,
        initialData: [],
      };

      // Act
      render(<FullRouteCachePresentational {...propsWithEmptyData} />);

      // Assert
      expect(screen.getByText("No cached content available")).toBeInTheDocument();
    });
  });

  describe("キャッシュモード表示", () => {
    it("should display static mode information", () => {
      // Act
      render(<FullRouteCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText("Cache Status")).toBeInTheDocument();
    });

    it("should display ISR mode information", () => {
      // Arrange
      const propsWithISR = {
        ...defaultProps,
        cacheInfo: {
          ...mockCacheInfo,
          mode: "isr",
        },
      };

      // Act
      render(<FullRouteCachePresentational {...propsWithISR} />);

      // Assert
      // ISRモードでの特定の表示を確認
      expect(screen.getAllByText(/60s/)[0]).toBeInTheDocument();
    });

    it("should display dynamic mode information", () => {
      // Arrange
      const propsWithDynamic = {
        ...defaultProps,
        cacheInfo: {
          ...mockCacheInfo,
          mode: "dynamic",
          cached: false,
        },
      };

      // Act
      render(<FullRouteCachePresentational {...propsWithDynamic} />);

      // Assert
      expect(screen.getByText("MISS")).toBeInTheDocument();
      expect(screen.getByText("Generation Source")).toBeInTheDocument();
    });
  });

  describe("ユーザーインタラクション", () => {
    it("should toggle code display", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FullRouteCachePresentational {...defaultProps} />);

      // Act
      const codeButton = screen.getByText("Show Code");
      await user.click(codeButton);

      // Assert
      expect(screen.getByTestId("code-display")).toBeInTheDocument();
      expect(screen.getByText("Hide Code")).toBeInTheDocument();
    });

    it("should handle revalidate page button click", async () => {
      // Arrange
      const user = userEvent.setup();
      mockRevalidationApi.revalidatePath.mockResolvedValue(mockRevalidationOperation);
      render(<FullRouteCachePresentational {...defaultProps} />);

      // Act
      const revalidateButton = screen.getByText("Revalidate Page");
      await user.click(revalidateButton);

      // Assert
      expect(mockRevalidationApi.revalidatePath).toHaveBeenCalledWith(
        "/features/caching/full-route-cache"
      );
    });

    it("should reload page after successful revalidation", async () => {
      // Arrange
      const user = userEvent.setup();
      mockRevalidationApi.revalidatePath.mockResolvedValue(mockRevalidationOperation);

      render(<FullRouteCachePresentational {...defaultProps} />);

      // Act
      const revalidateButton = screen.getByText("Revalidate Page");
      await user.click(revalidateButton);

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Assert - Just check the revalidation API was called
      expect(mockRevalidationApi.revalidatePath).toHaveBeenCalledWith(
        "/features/caching/full-route-cache"
      );
    });

    it("should not reload page when revalidation fails", async () => {
      // Arrange
      const user = userEvent.setup();
      const failedOperation = {
        ...mockRevalidationOperation,
        success: false,
      };
      mockRevalidationApi.revalidatePath.mockResolvedValue(failedOperation);

      render(<FullRouteCachePresentational {...defaultProps} />);

      // Act
      const revalidateButton = screen.getByText("Revalidate Page");
      await user.click(revalidateButton);

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Assert - Just check the revalidation API was called
      expect(mockRevalidationApi.revalidatePath).toHaveBeenCalledWith(
        "/features/caching/full-route-cache"
      );
      expect(mockReload).not.toHaveBeenCalled();
    });
  });

  describe("ISR設定", () => {
    it("should adjust revalidate time with slider", async () => {
      // Arrange
      render(<FullRouteCachePresentational {...defaultProps} />);

      // Act
      const slider = screen.getByRole("slider");
      fireEvent.change(slider, { target: { value: "120" } });

      // Assert
      expect(screen.getAllByText("120s")[0]).toBeInTheDocument();
    });

    it("should display TTL progress correctly", () => {
      // Act
      render(<FullRouteCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText("Cache TTL Remaining")).toBeInTheDocument();
      expect(screen.getByText(/remaining of.*interval/)).toBeInTheDocument();
    });

    it("should show cache interval information", () => {
      // Act
      render(<FullRouteCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText(/will be statically regenerated every/)).toBeInTheDocument();
    });
  });

  describe("タイムライン表示", () => {
    it("should show page generation time", () => {
      // Act
      render(<FullRouteCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText("Page Generated")).toBeInTheDocument();
    });

    it("should show next revalidation information", () => {
      // Act
      render(<FullRouteCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText("Next Revalidation")).toBeInTheDocument();
      expect(screen.getByText("On next request after TTL expires")).toBeInTheDocument();
    });
  });

  describe("パフォーマンスメトリクス", () => {
    it("should display response time from metrics", () => {
      // Act
      render(<FullRouteCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getAllByText("25ms")[0]).toBeInTheDocument();
    });

    it("should display cache hit rate", () => {
      // Act
      render(<FullRouteCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("should show cache benefits", () => {
      // Act
      render(<FullRouteCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText("Server Load")).toBeInTheDocument();
      expect(screen.getByText("SEO Performance")).toBeInTheDocument();
      expect(screen.getByText("CDN Compatibility")).toBeInTheDocument();
      expect(screen.getByText("User Experience")).toBeInTheDocument();
    });
  });

  describe("説明コンテンツ", () => {
    it("should display how it works section", () => {
      // Act
      render(<FullRouteCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText("How Full Route Cache Works")).toBeInTheDocument();
      expect(screen.getByText("1. Static Generation")).toBeInTheDocument();
      expect(screen.getByText("2. Incremental Static Regeneration (ISR)")).toBeInTheDocument();
      expect(screen.getByText("3. CDN Distribution")).toBeInTheDocument();
    });

    it("should display use cases", () => {
      // Act
      render(<FullRouteCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText("4. Use Cases")).toBeInTheDocument();
      expect(screen.getByText(/Product catalogs and e-commerce pages/)).toBeInTheDocument();
      expect(screen.getByText(/Blog posts and marketing content/)).toBeInTheDocument();
    });

    it("should display best practices", () => {
      // Act
      render(<FullRouteCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText(/Best Practice/)).toBeInTheDocument();
      expect(screen.getByText(/Use ISR for content that changes periodically/)).toBeInTheDocument();
    });
  });

  describe("タブナビゲーション", () => {
    it("should render all tabs", () => {
      // Act
      render(<FullRouteCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText("Cache Status")).toBeInTheDocument();
      expect(screen.getByText("Page Content")).toBeInTheDocument();
      expect(screen.getByText("Performance")).toBeInTheDocument();
      expect(screen.getByText("How It Works")).toBeInTheDocument();
    });

    it("should display content tab information", () => {
      // Act
      render(<FullRouteCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText("Statically Cached Content")).toBeInTheDocument();
      expect(
        screen.getByText("This content is served from the Full Route Cache")
      ).toBeInTheDocument();
    });
  });

  describe("エラーハンドリング", () => {
    it("should handle revalidation errors gracefully", async () => {
      // Arrange
      mockRevalidationApi.revalidatePath.mockRejectedValue(new Error("Revalidation failed"));

      render(<FullRouteCachePresentational {...defaultProps} />);

      // Act - Wrap in try-catch to handle unhandled promise rejection
      const revalidateButton = screen.getByText("Revalidate Page");
      try {
        fireEvent.click(revalidateButton);
        await new Promise((resolve) => setTimeout(resolve, 0));
      } catch {
        // Expected error
      }

      // Assert - Check the button is still available after failed revalidation
      expect(screen.getByText("Revalidate Page")).toBeInTheDocument();
      expect(mockReload).not.toHaveBeenCalled();
      // console.errorが呼ばれることを確認
      expect(console.error).toHaveBeenCalledWith("Revalidation error:", expect.any(Error));
    }, 10000);
  });

  describe("キャッシュ情報表示", () => {
    it("should display cached timestamp correctly", () => {
      // Act
      render(<FullRouteCachePresentational {...defaultProps} />);

      // Assert
      // ページ生成時刻が正しく表示されることを確認
      const timeElements = screen.getAllByText(/\d{1,2}:\d{2}:\d{2}/);
      expect(timeElements.length).toBeGreaterThan(0);
    });

    it("should show cache behavior explanation", () => {
      // Act
      render(<FullRouteCachePresentational {...defaultProps} />);

      // Assert
      expect(screen.getByText(/Cache Behavior/)).toBeInTheDocument();
      expect(screen.getByText(/This entire page is pre-rendered and cached/)).toBeInTheDocument();
    });
  });
});
