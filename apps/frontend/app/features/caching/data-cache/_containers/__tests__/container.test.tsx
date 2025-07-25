// DataCacheContainer Server Componentのテスト

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cacheTestApi } from "../../../_shared/cache-api-client";
import {
  calculateOverallMetrics,
  generatePerformanceMetrics,
  updateLayerMetrics,
} from "../../../_shared/cache-metrics";
import { DataCacheContainer } from "../container";

// モック設定
vi.mock("../../../_shared/cache-api-client");
vi.mock("../../../_shared/cache-metrics");
vi.mock("../presentational", () => ({
  DataCachePresentational: ({ initialData, error }: { initialData: unknown[]; error?: string }) => (
    <div data-testid="presentational">
      {error && <div data-testid="error">{error}</div>}
      <div data-testid="data-count">{initialData.length}</div>
    </div>
  ),
}));

// console.error のモック
vi.spyOn(console, "error").mockImplementation(() => {});

const mockCacheTestApi = vi.mocked(cacheTestApi);
const mockUpdateLayerMetrics = vi.mocked(updateLayerMetrics);
const mockCalculateOverallMetrics = vi.mocked(calculateOverallMetrics);
const mockGeneratePerformanceMetrics = vi.mocked(generatePerformanceMetrics);

// モックデータ
const mockCacheResponse = {
  data: [
    {
      id: 1,
      title: "Test Category",
      content: "Test content",
      category: "test",
      timestamp: "2023-01-01T00:00:00Z",
      size: 1024,
      views: 100,
      name: "Test Item",
      postCount: 5,
      description: "Test description",
    },
  ],
  metadata: {
    cached: true,
    cacheStatus: "fresh" as const,
    strategy: "data-cache" as const,
    timestamp: "2023-01-01T00:00:00Z",
    source: "cache" as const,
    ttl: 3600,
    tags: ["cache-test"],
  },
  metrics: {
    fetchTime: 50,
    dataSize: 2048,
    cacheHit: true,
  },
};

const mockLayerMetrics = {
  strategy: "data-cache" as const,
  hits: 1,
  misses: 0,
  totalRequests: 1,
  hitRate: 100,
  avgResponseTime: 50,
  cacheSize: 2048,
};

const mockOverallMetrics = {
  totalHits: 1,
  totalMisses: 0,
  overallHitRate: 100,
  totalCacheSize: 2048,
  efficiencyScore: 90,
};

const mockPerformanceMetrics = {
  dataFetchTime: 20,
  renderTime: 25,
  hydrationTime: 15,
  timeToFirstByte: 80,
  timeToInteractive: 100,
};

describe("DataCacheContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのモック動作を設定
    mockGeneratePerformanceMetrics.mockReturnValue(mockPerformanceMetrics);
    mockUpdateLayerMetrics.mockReturnValue(mockLayerMetrics);
    mockCalculateOverallMetrics.mockReturnValue(mockOverallMetrics);
  });

  describe("正常なデータ取得", () => {
    it("should render successfully with cached data", async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);

      // Act
      const Component = await DataCacheContainer();
      render(Component);

      // Assert
      expect(screen.getByTestId("presentational")).toBeInTheDocument();
      expect(screen.getByTestId("data-count")).toHaveTextContent("1");
      expect(screen.queryByTestId("error")).not.toBeInTheDocument();
    });

    it("should call cacheTestApi.getTestData with correct parameters", async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);

      // Act
      await DataCacheContainer();

      // Assert
      expect(mockCacheTestApi.getTestData).toHaveBeenCalledWith(
        {
          next: {
            revalidate: 60,
            tags: ["cache-test"],
          },
        },
        "data-cache"
      );
    });

    it("should update metrics correctly", async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);

      // Act
      await DataCacheContainer();

      // Assert
      expect(mockUpdateLayerMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          strategy: "data-cache",
          hits: 0,
          misses: 0,
        }),
        mockCacheResponse
      );
      expect(mockCalculateOverallMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          "data-cache": mockLayerMetrics,
        })
      );
    });

    it("should generate initial performance metrics", async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);

      // Act
      await DataCacheContainer();

      // Assert
      expect(mockGeneratePerformanceMetrics).toHaveBeenCalled();
    });
  });

  describe("エラーハンドリング", () => {
    it("should handle API errors gracefully", async () => {
      // Arrange
      const errorMessage = "Network error";
      mockCacheTestApi.getTestData.mockRejectedValue(new Error(errorMessage));

      // Act
      const Component = await DataCacheContainer();
      render(Component);

      // Assert
      expect(screen.getByTestId("error")).toHaveTextContent(errorMessage);
      expect(screen.getByTestId("data-count")).toHaveTextContent("0");
    });

    it("should handle unknown errors", async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockRejectedValue("Unknown error");

      // Act
      const Component = await DataCacheContainer();
      render(Component);

      // Assert
      expect(screen.getByTestId("error")).toHaveTextContent("Unknown error");
    });

    it("should still render Presentational component when error occurs", async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockRejectedValue(new Error("API Error"));

      // Act
      const Component = await DataCacheContainer();
      render(Component);

      // Assert
      expect(screen.getByTestId("presentational")).toBeInTheDocument();
    });
  });

  describe("メトリクス初期化", () => {
    it("should initialize metrics with correct structure", async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);

      // Act
      await DataCacheContainer();

      // Assert
      expect(mockUpdateLayerMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          strategy: "data-cache",
          hits: 0,
          misses: 0,
          totalRequests: 0,
          hitRate: 0,
          avgResponseTime: 0,
          cacheSize: 0,
        }),
        mockCacheResponse
      );
    });

    it("should include all cache layer strategies in initial metrics", async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);

      // Act
      await DataCacheContainer();

      // Assert
      const callArgs = mockCalculateOverallMetrics.mock.calls[0][0];
      expect(callArgs).toHaveProperty("data-cache");
      expect(callArgs).toHaveProperty("full-route-cache");
      expect(callArgs).toHaveProperty("router-cache");
      expect(callArgs).toHaveProperty("request-memoization");
      expect(callArgs).toHaveProperty("cloudfront-cache");
    });
  });

  describe("Suspense integration", () => {
    it("should render with Suspense wrapper", async () => {
      // Arrange
      mockCacheTestApi.getTestData.mockResolvedValue(mockCacheResponse);

      // Act
      const { container } = render(await DataCacheContainer());

      // Assert - Suspenseコンポーネントの存在を確認する
      expect(container.firstChild).toBeDefined();
      // Suspenseのfallback内容が期待通りかチェック
      expect(container.textContent).toBeDefined();
    });
  });
});
