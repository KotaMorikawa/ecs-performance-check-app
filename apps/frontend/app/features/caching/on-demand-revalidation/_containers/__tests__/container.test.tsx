// OnDemandRevalidationContainer Server Componentのテスト

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cacheTestApi } from "../../../_shared/cache-api-client";
import { OnDemandRevalidationContainer } from "../container";

// モック設定
vi.mock("../../../_shared/cache-api-client");
vi.mock("../presentational", () => ({
  OnDemandRevalidationPresentational: ({
    initialData,
    error,
  }: {
    initialData: unknown[];
    error?: string | null;
  }) => (
    <div data-testid="presentational">
      {error && <div data-testid="error">{error}</div>}
      <div data-testid="data-count">{initialData.length}</div>
    </div>
  ),
}));

// console.error のモック
vi.spyOn(console, "error").mockImplementation(() => {});

const mockCacheTestApi = vi.mocked(cacheTestApi);

// モックデータ
const mockCacheResponse = {
  data: [
    {
      id: 1,
      title: "On-demand Test",
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
    tags: ["revalidation-demo", "on-demand"],
  },
  metrics: {
    fetchTime: 30,
    dataSize: 1024,
    cacheHit: true,
  },
};

describe("OnDemandRevalidationContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("正常なデータ取得", () => {
    it("should render successfully with cached data", async () => {
      // Arrange
      mockCacheTestApi.getDataCacheDemo.mockResolvedValue(mockCacheResponse);

      // Act
      const Component = await OnDemandRevalidationContainer();
      render(Component);

      // Assert
      expect(screen.getByTestId("presentational")).toBeInTheDocument();
      expect(screen.getByTestId("data-count")).toHaveTextContent("1");
      expect(screen.queryByTestId("error")).not.toBeInTheDocument();
    });

    it("should call cacheTestApi.getDataCacheDemo with correct tags", async () => {
      // Arrange
      mockCacheTestApi.getDataCacheDemo.mockResolvedValue(mockCacheResponse);

      // Act
      await OnDemandRevalidationContainer();

      // Assert
      expect(mockCacheTestApi.getDataCacheDemo).toHaveBeenCalledWith([
        "revalidation-demo",
        "on-demand",
      ]);
    });
  });

  describe("エラーハンドリング", () => {
    it("should handle API errors gracefully", async () => {
      // Arrange
      const errorMessage = "On-demand revalidation error";
      mockCacheTestApi.getDataCacheDemo.mockRejectedValue(new Error(errorMessage));

      // Act
      const Component = await OnDemandRevalidationContainer();
      render(Component);

      // Assert
      expect(screen.getByTestId("error")).toHaveTextContent(errorMessage);
      expect(screen.getByTestId("data-count")).toHaveTextContent("0");
    });

    it("should handle unknown errors", async () => {
      // Arrange
      mockCacheTestApi.getDataCacheDemo.mockRejectedValue("Unknown error");

      // Act
      const Component = await OnDemandRevalidationContainer();
      render(Component);

      // Assert
      expect(screen.getByTestId("error")).toHaveTextContent("Unknown error");
    });
  });

  describe("Suspense integration", () => {
    it("should render with Suspense wrapper", async () => {
      // Arrange
      mockCacheTestApi.getDataCacheDemo.mockResolvedValue(mockCacheResponse);

      // Act
      const Component = await OnDemandRevalidationContainer();

      // Assert
      expect(Component.props.fallback).toEqual(<div>Loading on-demand revalidation demo...</div>);
    });
  });
});
