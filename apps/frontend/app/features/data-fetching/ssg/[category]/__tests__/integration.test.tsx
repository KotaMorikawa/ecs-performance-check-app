import { beforeEach, describe, expect, it, type MockedFunction, vi } from "vitest";
import { generateStaticParams } from "../page";

// モックAPIレスポンス
const mockCategories = [
  {
    id: 1,
    name: "Technology",
    slug: "technology",
    description: "Tech-related posts",
    postCount: 10,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Design",
    slug: "design",
    description: "Design-related posts",
    postCount: 5,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

// fetchをモック
global.fetch = vi.fn();

describe("SSG Data Fetching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // fetchのモック設定
    (global.fetch as MockedFunction<typeof global.fetch>).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: mockCategories,
        }),
        {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        }
      )
    );
  });

  describe("generateStaticParams", () => {
    it("should generate static params for all categories", async () => {
      const params = await generateStaticParams();

      expect(params).toEqual([{ category: "technology" }, { category: "design" }]);
    });

    it("should handle API errors gracefully", async () => {
      // APIエラーをシミュレート
      (global.fetch as MockedFunction<typeof global.fetch>).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Internal Server Error" }), {
          status: 500,
          statusText: "Internal Server Error",
        })
      );

      const params = await generateStaticParams();

      // エラー時は空配列を返すべき
      expect(params).toEqual([]);
    });

    it("should handle network errors", async () => {
      // ネットワークエラーをシミュレート
      (global.fetch as MockedFunction<typeof global.fetch>).mockRejectedValueOnce(
        new Error("Network error")
      );

      const params = await generateStaticParams();

      // エラー時は空配列を返すべき
      expect(params).toEqual([]);
    });

    it("should call categories API with correct URL", async () => {
      await generateStaticParams();

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/categories",
        expect.objectContaining({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
    });
  });
});
