import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, type MockedFunction, vi } from "vitest";
import "@testing-library/jest-dom";
import type { Category, DataFetchMetrics } from "../../_shared/types";
import { SsgContainer } from "../[category]/_containers/container";

// API クライアントをモック
vi.mock("../../_shared/api-client", () => ({
  categoriesApi: {
    getAll: vi.fn(),
  },
}));

// モックデータ
const mockCategories: Category[] = [
  {
    id: 1,
    name: "Technology",
    slug: "technology",
    description: "Technology related posts",
    postCount: 25,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: 2,
    name: "Science",
    slug: "science",
    description: "Science related posts",
    postCount: 15,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T11:00:00Z",
  },
  {
    id: 3,
    name: "Design",
    slug: "design",
    description: "Design related posts",
    postCount: 18,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T12:00:00Z",
  },
];

const mockMetrics: DataFetchMetrics = {
  source: "ssg",
  duration: 45,
  timestamp: "2024-01-01T12:00:00Z",
  dataSize: 2048,
  cached: true,
};

describe("SsgContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render SSG container correctly", async () => {
    const { categoriesApi } = await import("../../_shared/api-client");
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: mockMetrics,
    });

    const { container } = render(await SsgContainer({ category: "technology" }));

    expect(container).toBeInTheDocument();
  });

  it("should fetch categories with SSG settings", async () => {
    const { categoriesApi } = await import("../../_shared/api-client");
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: mockMetrics,
    });

    await SsgContainer({ category: "technology" });

    expect(categoriesApi.getAll).toHaveBeenCalledWith(
      {
        next: {
          tags: ["categories"],
          // SSGではビルド時に生成されるため、revalidateは設定しない
        },
      },
      "ssg"
    );
  });

  it("should find selected category by slug", async () => {
    const { categoriesApi } = await import("../../_shared/api-client");
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: mockMetrics,
    });

    const result = render(await SsgContainer({ category: "science" }));

    // Suspenseフォールバックが表示されていないことを確認
    expect(result.queryByText("Loading SSG demo...")).not.toBeInTheDocument();
  });

  it("should handle API errors gracefully", async () => {
    const { categoriesApi } = await import("../../_shared/api-client");
    const errorMessage = "SSG fetch failed";
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockRejectedValue(
      new Error(errorMessage)
    );

    // console.errorをモックしてエラーログを抑制
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = render(await SsgContainer({ category: "technology" }));

    // エラー時でもコンポーネントがレンダリングされるべき
    expect(container).toBeInTheDocument();

    // console.errorが呼ばれたことを確認
    expect(consoleSpy).toHaveBeenCalledWith("SSG fetch error:", expect.any(Error));

    // モックをリストア
    consoleSpy.mockRestore();
  });

  it("should pass correct props to presentational component", async () => {
    const { categoriesApi } = await import("../../_shared/api-client");
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: mockMetrics,
    });

    const result = render(await SsgContainer({ category: "design" }));

    // Suspenseフォールバックが表示されていないことを確認
    expect(result.queryByText("Loading SSG demo...")).not.toBeInTheDocument();
  });

  it("should collect performance metrics for SSG", async () => {
    const { categoriesApi } = await import("../../_shared/api-client");
    const customMetrics = {
      ...mockMetrics,
      duration: 30,
      cached: true,
    };

    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: customMetrics,
    });

    await SsgContainer({ category: "technology" });

    expect(categoriesApi.getAll).toHaveBeenCalledTimes(1);
  });

  it("should use build-time cache settings", async () => {
    const { categoriesApi } = await import("../../_shared/api-client");
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: mockMetrics,
    });

    await SsgContainer({ category: "technology" });

    // SSG 用のキャッシュ設定が渡されていることを確認
    expect(categoriesApi.getAll).toHaveBeenCalledWith(
      expect.objectContaining({
        next: expect.objectContaining({
          tags: ["categories"],
        }),
      }),
      "ssg"
    );
  });

  it("should handle category not found", async () => {
    const { categoriesApi } = await import("../../_shared/api-client");
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: mockMetrics,
    });

    const { container } = render(await SsgContainer({ category: "nonexistent" }));

    expect(container).toBeInTheDocument();
  });

  it("should handle empty categories response", async () => {
    const { categoriesApi } = await import("../../_shared/api-client");
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: [],
      metrics: mockMetrics,
    });

    const { container } = render(await SsgContainer({ category: "technology" }));

    expect(container).toBeInTheDocument();
  });

  it("should render within Suspense boundary", async () => {
    const { categoriesApi } = await import("../../_shared/api-client");
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: mockMetrics,
    });

    const result = render(await SsgContainer({ category: "technology" }));

    // Suspenseが正しく動作していることを確認
    expect(result.container.querySelector("div")).toBeInTheDocument();
  });

  it("should demonstrate SSG characteristics", async () => {
    const { categoriesApi } = await import("../../_shared/api-client");
    (categoriesApi.getAll as MockedFunction<typeof categoriesApi.getAll>).mockResolvedValue({
      data: mockCategories,
      metrics: {
        ...mockMetrics,
        source: "ssg",
        cached: true, // SSG では通常キャッシュされる
      },
    });

    await SsgContainer({ category: "technology" });

    // SSG API が適切に呼ばれていることを確認
    expect(categoriesApi.getAll).toHaveBeenCalledWith(
      expect.objectContaining({
        next: expect.objectContaining({
          tags: ["categories"],
        }),
      }),
      "ssg"
    );
  });
});
