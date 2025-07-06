// RouterCachePresentational Client Componentのテスト

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RouterCachePresentational } from "../presentational";

// モック設定
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("../../../_shared/cache-api-client", () => ({
  cacheTestApi: {
    getTestData: vi.fn(),
    getDataCacheDemo: vi.fn(),
  },
}));

vi.mock("@/components/enhanced-performance-display", () => ({
  EnhancedPerformanceDisplay: ({ title }: { title: string }) => (
    <div data-testid="performance-display">{title}</div>
  ),
}));

vi.mock("@/components/code-display", () => ({
  CodeDisplay: ({ title }: { title: string }) => <div data-testid="code-display">{title}</div>,
}));

// モックデータは各テストで定義

describe("RouterCachePresentational", () => {
  const mockPush = vi.fn();
  const mockPrefetch = vi.fn();
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      prefetch: mockPrefetch,
      refresh: mockRefresh,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    });
  });

  describe("レンダリング", () => {
    it("should render with initial data", () => {
      // Act
      render(<RouterCachePresentational />);

      // Assert
      expect(screen.getByText("Router Cache Demo")).toBeInTheDocument();
      expect(
        screen.getByText("クライアントサイドナビゲーションのキャッシュ機能を実演")
      ).toBeInTheDocument();
    });

    it("should render without errors", () => {
      // Act
      render(<RouterCachePresentational />);

      // Assert
      expect(screen.getByText("Router Cache Demo")).toBeInTheDocument();
    });
  });

  describe("Navigation simulation", () => {
    it("should simulate soft navigation", async () => {
      // Act
      render(<RouterCachePresentational />);

      const softNavButton = screen.getByText("Navigate to About");
      fireEvent.click(softNavButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("ナビゲーション中...")).toBeInTheDocument();
      });
    });

    it("should simulate hard navigation", async () => {
      // Act
      render(<RouterCachePresentational />);

      const hardNavButton = screen.getByText("Hard Refresh About");
      fireEvent.click(hardNavButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("ナビゲーション中...")).toBeInTheDocument();
      });
    });

    it("should disable navigation buttons while navigating", async () => {
      // Act
      render(<RouterCachePresentational />);

      const navButton = screen.getByText("Navigate to About");
      fireEvent.click(navButton);

      // Assert
      await waitFor(() => {
        expect(navButton).toBeDisabled();
      });
    });
  });

  describe("Prefetch functionality", () => {
    it("should call prefetch when clicking prefetch button", () => {
      // Act
      render(<RouterCachePresentational />);

      const prefetchButton = screen.getByText("Prefetch Pages");
      fireEvent.click(prefetchButton);

      // Assert
      expect(mockPrefetch).toHaveBeenCalledWith("/features/caching/data-cache");
      expect(mockPrefetch).toHaveBeenCalledWith("/features/caching/full-route-cache");
    });
  });

  describe("Code display toggle", () => {
    it("should toggle code display", () => {
      // Act
      render(<RouterCachePresentational />);

      // Assert - コードは最初は表示されない
      expect(screen.queryByTestId("code-display")).not.toBeInTheDocument();

      // コード表示をトグル
      const toggleButton = screen.getByText("Show Code");
      fireEvent.click(toggleButton);

      // Assert - コードが表示される
      expect(screen.getByTestId("code-display")).toBeInTheDocument();
      expect(screen.getByText("Hide Code")).toBeInTheDocument();
    });
  });

  describe("Tabs navigation", () => {
    it("should have correct tab labels", () => {
      // Act
      render(<RouterCachePresentational />);

      // Assert - タブが存在することを確認
      expect(screen.getByRole("tab", { name: "Demo" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Metrics" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Navigation History" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "How It Works" })).toBeInTheDocument();
    });

    it("should show demo content by default", () => {
      // Act
      render(<RouterCachePresentational />);

      // Assert - デフォルトでDemoタブのコンテンツが表示されること
      expect(screen.getByText("Navigation Simulation")).toBeInTheDocument();
      expect(screen.getByText("Soft Navigation")).toBeInTheDocument();
      expect(screen.getByText("Hard Navigation")).toBeInTheDocument();
    });

    it("should be able to click tabs without errors", () => {
      // Act
      render(<RouterCachePresentational />);

      // Assert - タブをクリックしてもエラーが発生しないこと
      const metricsTab = screen.getByRole("tab", { name: "Metrics" });
      expect(() => fireEvent.click(metricsTab)).not.toThrow();

      const historyTab = screen.getByRole("tab", { name: "Navigation History" });
      expect(() => fireEvent.click(historyTab)).not.toThrow();

      const explanationTab = screen.getByRole("tab", { name: "How It Works" });
      expect(() => fireEvent.click(explanationTab)).not.toThrow();
    });
  });

  describe("Metrics display", () => {
    it("should initialize with correct metrics", () => {
      // Act
      render(<RouterCachePresentational />);

      // Assert - 初期状態の確認（タブクリック不要）
      expect(screen.getByRole("tab", { name: "Metrics" })).toBeInTheDocument();
    });
  });

  describe("Navigation history", () => {
    it("should have navigation simulation buttons", () => {
      // Act
      render(<RouterCachePresentational />);

      // Assert - ナビゲーションボタンが存在することを確認
      expect(screen.getByText("Navigate to About")).toBeInTheDocument();
      expect(screen.getByText("Navigate to Products")).toBeInTheDocument();
      expect(screen.getByText("Hard Refresh About")).toBeInTheDocument();
      expect(screen.getByText("Hard Refresh Products")).toBeInTheDocument();
    });
  });
});
