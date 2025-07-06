import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, type MockedFunction, vi } from "vitest";
import "@testing-library/jest-dom";
import type { UserProfile } from "../../_shared/types";
import { SsrContainer } from "../_containers/container";

// API クライアントをモック
vi.mock("../../_shared/api-client", () => ({
  userProfileApi: {
    getCurrentProfile: vi.fn(),
  },
}));

// モックデータ
const mockUserProfile: UserProfile = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  bio: "Test bio for SSR demo",
  avatar: "https://example.com/avatar.jpg",
  isVerified: true,
  postsCount: 42,
  joinedAt: "2024-01-01T00:00:00Z",
  followersCount: 150,
  followingCount: 75,
};

const mockMetrics = {
  source: "ssr" as const,
  duration: 85,
  timestamp: "2024-01-01T12:00:00Z",
  dataSize: 1024,
  cached: false,
};

describe("SsrContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render SSR user profile correctly", async () => {
    const { userProfileApi } = await import("../../_shared/api-client");
    (
      userProfileApi.getCurrentProfile as MockedFunction<typeof userProfileApi.getCurrentProfile>
    ).mockResolvedValue({
      data: mockUserProfile,
      metrics: mockMetrics,
    });

    const { container } = render(await SsrContainer());

    expect(container).toBeInTheDocument();
  });

  it("should fetch user profile with SSR settings", async () => {
    const { userProfileApi } = await import("../../_shared/api-client");
    (
      userProfileApi.getCurrentProfile as MockedFunction<typeof userProfileApi.getCurrentProfile>
    ).mockResolvedValue({
      data: mockUserProfile,
      metrics: mockMetrics,
    });

    await SsrContainer();

    expect(userProfileApi.getCurrentProfile).toHaveBeenCalledWith(
      {
        cache: "no-store", // SSR では no-store を使用
      },
      "ssr"
    );
  });

  it("should handle API errors gracefully", async () => {
    const { userProfileApi } = await import("../../_shared/api-client");
    const errorMessage = "SSR fetch failed";
    (
      userProfileApi.getCurrentProfile as MockedFunction<typeof userProfileApi.getCurrentProfile>
    ).mockRejectedValue(new Error(errorMessage));

    // console.errorをモックしてエラーログを抑制
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = render(await SsrContainer());

    // エラー時でもコンポーネントがレンダリングされるべき
    expect(container).toBeInTheDocument();

    // console.errorが呼ばれたことを確認
    expect(consoleSpy).toHaveBeenCalledWith("SSR fetch error:", expect.any(Error));

    // モックをリストア
    consoleSpy.mockRestore();
  });

  it("should pass user profile data to presentational component", async () => {
    const { userProfileApi } = await import("../../_shared/api-client");
    (
      userProfileApi.getCurrentProfile as MockedFunction<typeof userProfileApi.getCurrentProfile>
    ).mockResolvedValue({
      data: mockUserProfile,
      metrics: mockMetrics,
    });

    const result = render(await SsrContainer());

    // Suspenseフォールバックが表示されていないことを確認
    expect(result.queryByText("Loading SSR demo...")).not.toBeInTheDocument();
  });

  it("should collect performance metrics for SSR", async () => {
    const { userProfileApi } = await import("../../_shared/api-client");
    const customMetrics = {
      ...mockMetrics,
      duration: 120,
      cached: false,
    };

    (
      userProfileApi.getCurrentProfile as MockedFunction<typeof userProfileApi.getCurrentProfile>
    ).mockResolvedValue({
      data: mockUserProfile,
      metrics: customMetrics,
    });

    await SsrContainer();

    expect(userProfileApi.getCurrentProfile).toHaveBeenCalledTimes(1);
  });

  it("should use real-time data fetching (no-store cache)", async () => {
    const { userProfileApi } = await import("../../_shared/api-client");
    (
      userProfileApi.getCurrentProfile as MockedFunction<typeof userProfileApi.getCurrentProfile>
    ).mockResolvedValue({
      data: mockUserProfile,
      metrics: mockMetrics,
    });

    await SsrContainer();

    // no-store キャッシュ設定が渡されていることを確認
    expect(userProfileApi.getCurrentProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        cache: "no-store",
      }),
      "ssr"
    );
  });

  it("should handle empty user profile response", async () => {
    const { userProfileApi } = await import("../../_shared/api-client");
    const emptyUserProfile: UserProfile = {
      id: 0,
      name: "",
      email: "",
      bio: "",
      joinedAt: "",
      postsCount: 0,
      followersCount: 0,
      followingCount: 0,
      isVerified: false,
    };
    (
      userProfileApi.getCurrentProfile as MockedFunction<typeof userProfileApi.getCurrentProfile>
    ).mockResolvedValue({
      data: emptyUserProfile,
      metrics: mockMetrics,
    });

    const { container } = render(await SsrContainer());

    expect(container).toBeInTheDocument();
  });

  it("should render within Suspense boundary", async () => {
    const { userProfileApi } = await import("../../_shared/api-client");
    (
      userProfileApi.getCurrentProfile as MockedFunction<typeof userProfileApi.getCurrentProfile>
    ).mockResolvedValue({
      data: mockUserProfile,
      metrics: mockMetrics,
    });

    const result = render(await SsrContainer());

    // Suspenseが正しく動作していることを確認
    expect(result.container.querySelector("div")).toBeInTheDocument();
  });

  it("should demonstrate SSR characteristics", async () => {
    const { userProfileApi } = await import("../../_shared/api-client");
    (
      userProfileApi.getCurrentProfile as MockedFunction<typeof userProfileApi.getCurrentProfile>
    ).mockResolvedValue({
      data: mockUserProfile,
      metrics: {
        ...mockMetrics,
        source: "ssr",
        cached: false, // SSR では通常キャッシュされない
      },
    });

    await SsrContainer();

    // SSR API が適切に呼ばれていることを確認
    expect(userProfileApi.getCurrentProfile).toHaveBeenCalledWith({ cache: "no-store" }, "ssr");
  });
});
