// キャッシュAPIクライアントのテスト

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cacheStatsApi,
  calculateCacheMetrics,
  cloudfrontSimulationApi,
  revalidationApi,
} from "../_shared/cache-api-client";
import type { CacheApiResponse, CacheTestData } from "../_shared/types";

// モックレスポンスデータ
const mockCacheResponse: CacheApiResponse<CacheTestData[]> = {
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
    cacheStatus: "fresh",
    strategy: "data-cache",
    timestamp: "2023-01-01T00:00:00Z",
    source: "cache",
    ttl: 3600,
    tags: ["test"],
  },
  metrics: {
    fetchTime: 50,
    dataSize: 2048,
    cacheHit: true,
  },
};

// モック設定
vi.mock("../_shared/cache-api-client", async () => {
  const actual = await vi.importActual("../_shared/cache-api-client");
  return {
    ...actual,
    // fetchWithCacheをモック化するために再エクスポート
  };
});

// グローバルfetchのモック
const fetchMock = vi.fn();
global.fetch = fetchMock as unknown as typeof fetch;

describe("Cache API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("revalidationApi", () => {
    it("should handle revalidateTag API calls", async () => {
      // Arrange
      const mockResponse = {
        success: true,
        message: "Cache invalidated successfully",
        revalidated: true,
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      // Act
      const result = await revalidationApi.revalidateTag("categories");

      // Assert
      expect(result.type).toBe("tag");
      expect(result.target).toBe("categories");
      expect(result.strategy).toBe("on-demand");
      expect(result.triggeredBy).toBe("user");
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/revalidate"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tag: "categories" }),
        })
      );
    });

    it("should handle revalidatePath API calls", async () => {
      // Arrange
      const mockResponse = {
        success: true,
        message: "Cache invalidated successfully",
        revalidated: true,
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      // Act
      const result = await revalidationApi.revalidatePath("/features/caching");

      // Assert
      expect(result.type).toBe("path");
      expect(result.target).toBe("/features/caching");
      expect(result.strategy).toBe("on-demand");
      expect(result.triggeredBy).toBe("user");
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/revalidate"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: "/features/caching" }),
        })
      );
    });
  });

  describe("cacheStatsApi", () => {
    it("should fetch cache status", async () => {
      // Arrange
      const mockStats = {
        layers: {
          "data-cache": { enabled: true, size: 1024 },
          "full-route-cache": { enabled: true, size: 2048 },
          "router-cache": { enabled: true, size: 512 },
          "request-memoization": { enabled: true, size: 256 },
          "cloudfront-cache": { enabled: false, size: 0 },
        },
        timestamp: new Date().toISOString(),
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStats),
      } as Response);

      // Act
      const result = await cacheStatsApi.getCacheStatus();

      // Assert
      expect(result).toEqual(mockStats);
      expect(fetchMock).toHaveBeenCalledWith("/api/cache-status");
    });
  });

  describe("cloudfrontSimulationApi", () => {
    it("should get edge location", async () => {
      // Act
      const result = await cloudfrontSimulationApi.getEdgeLocation();

      // Assert
      expect(result).toEqual({
        location: "Tokyo",
        latency: 10,
      });
    });

    it("should simulate hit rate", async () => {
      // Act
      const result = await cloudfrontSimulationApi.simulateHitRate("data-cache");

      // Assert
      expect(result.hitRate).toBe(85);
      expect(result.recommendation).toBeDefined();
    });
  });

  describe("calculateCacheMetrics", () => {
    it("should calculate metrics from cache responses", () => {
      const responses = [mockCacheResponse];
      const metrics = calculateCacheMetrics(responses);

      expect(metrics.hits).toBe(1);
      expect(metrics.misses).toBe(0);
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.hitRate).toBe(100);
      expect(metrics.avgResponseTime).toBe(50);
      expect(metrics.cacheSize).toBe(2048);
      expect(metrics.strategy).toBe("data-cache");
    });

    it("should handle multiple responses", () => {
      const missResponse = {
        ...mockCacheResponse,
        metadata: {
          ...mockCacheResponse.metadata,
          cached: false,
        },
        metrics: {
          ...mockCacheResponse.metrics,
          cacheHit: false,
          fetchTime: 150,
        },
      };

      const responses = [mockCacheResponse, missResponse];
      const metrics = calculateCacheMetrics(responses);

      expect(metrics.hits).toBe(1);
      expect(metrics.misses).toBe(1);
      expect(metrics.totalRequests).toBe(2);
      expect(metrics.hitRate).toBe(50);
      expect(metrics.avgResponseTime).toBe(100); // (50 + 150) / 2
      expect(metrics.cacheSize).toBe(4096); // 2048 * 2
    });

    it("should handle empty responses", () => {
      const metrics = calculateCacheMetrics([]);

      expect(metrics.hits).toBe(0);
      expect(metrics.misses).toBe(0);
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.hitRate).toBe(0);
      expect(metrics.avgResponseTime).toBe(0);
      expect(metrics.cacheSize).toBe(0);
    });
  });
});
