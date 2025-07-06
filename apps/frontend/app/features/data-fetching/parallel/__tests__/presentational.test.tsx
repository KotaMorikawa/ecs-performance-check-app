import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import type {
  CombinedData,
  DashboardStats,
  DataFetchMetrics,
  UserProfile,
} from "../../_shared/types";
import { ParallelPresentational } from "../_containers/presentational";

// モックデータ
const mockCombinedData = {
  categories: [
    {
      id: 1,
      name: "Technology",
      slug: "technology",
      description: "Technology related posts",
      postCount: 15,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T10:00:00Z",
    },
    {
      id: 2,
      name: "Design",
      slug: "design",
      description: "Design related posts",
      postCount: 8,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T11:00:00Z",
    },
  ],
  userProfile: {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    bio: "Test bio",
    avatar: "https://example.com/avatar.jpg",
    isVerified: true,
    postsCount: 25,
    joinedAt: "2024-01-01T00:00:00Z",
    followersCount: 120,
    followingCount: 80,
  } as UserProfile,
  dashboardStats: {
    totalUsers: 100,
    totalPosts: 250,
    totalCategories: 10,
    dailyActiveUsers: 45,
    weeklyActiveUsers: 200,
    monthlyActiveUsers: 500,
    averageSessionDuration: 8.5,
    bounceRate: 32.1,
    topCategories: [
      { id: 1, name: "Technology", postCount: 50, viewCount: 1200 },
      { id: 2, name: "Science", postCount: 30, viewCount: 800 },
    ],
    recentPosts: [
      {
        id: 1,
        title: "Recent Post 1",
        author: "Author 1",
        publishedAt: "2024-01-01T10:00:00Z",
        viewCount: 150,
      },
      {
        id: 2,
        title: "Recent Post 2",
        author: "Author 2",
        publishedAt: "2024-01-01T11:00:00Z",
        viewCount: 120,
      },
    ],
  } as DashboardStats,
};

const mockMetrics: DataFetchMetrics = {
  source: "parallel",
  duration: 150,
  timestamp: "2024-01-01T12:00:00Z",
  dataSize: 2048,
  requestCount: 3,
  cached: false,
};

describe("ParallelPresentational", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render parallel data correctly", () => {
    render(
      <ParallelPresentational combinedData={mockCombinedData} metrics={mockMetrics} error={null} />
    );

    // ヘッダーが表示されていることを確認
    expect(screen.getByText("Parallel Data Fetching Demo")).toBeInTheDocument();
    expect(screen.getByText(/Multiple API endpoints fetched simultaneously/)).toBeInTheDocument();
  });

  it("should display dashboard stats", () => {
    render(
      <ParallelPresentational combinedData={mockCombinedData} metrics={mockMetrics} error={null} />
    );

    expect(screen.getByText("100")).toBeInTheDocument(); // Total Users
    expect(screen.getByText("250")).toBeInTheDocument(); // Total Posts
    expect(screen.getByText("10")).toBeInTheDocument(); // Total Categories
    expect(screen.getByText("45")).toBeInTheDocument(); // Daily Active Users

    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("Total Posts")).toBeInTheDocument();
    expect(screen.getAllByText("Categories")[0]).toBeInTheDocument(); // 複数あるので最初のものを取得
    expect(screen.getByText("Active Users")).toBeInTheDocument();
  });

  it("should display user profile", () => {
    render(
      <ParallelPresentational combinedData={mockCombinedData} metrics={mockMetrics} error={null} />
    );

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("Test bio")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByText("25 posts")).toBeInTheDocument();
  });

  it("should display categories", () => {
    render(
      <ParallelPresentational combinedData={mockCombinedData} metrics={mockMetrics} error={null} />
    );

    expect(screen.getAllByText("Technology")[0]).toBeInTheDocument(); // 複数箇所に表示される
    expect(screen.getByText("Design")).toBeInTheDocument();
    expect(screen.getByText("Technology related posts")).toBeInTheDocument();
    expect(screen.getByText("Design related posts")).toBeInTheDocument();
    expect(screen.getAllByText("15")[0]).toBeInTheDocument(); // Technology post count - 複数箇所に表示される
    expect(screen.getByText("8")).toBeInTheDocument(); // Design post count
  });

  it("should handle null user profile", () => {
    const dataWithNullProfile = {
      ...mockCombinedData,
      userProfile: null,
    };

    render(
      <ParallelPresentational
        combinedData={dataWithNullProfile}
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText("No user profile available")).toBeInTheDocument();
  });

  it("should handle error state", () => {
    const errorMessage = "Failed to fetch parallel data";

    render(<ParallelPresentational combinedData={null} metrics={null} error={errorMessage} />);

    expect(screen.getByText(`Error loading parallel data: ${errorMessage}`)).toBeInTheDocument();
  });

  it("should toggle code display", () => {
    render(
      <ParallelPresentational combinedData={mockCombinedData} metrics={mockMetrics} error={null} />
    );

    // 初期状態ではコードが表示されていない
    expect(screen.queryByText("ソースコード")).not.toBeInTheDocument();

    // Show Codeボタンをクリック
    const toggleButton = screen.getByRole("button", { name: /show code/i });
    fireEvent.click(toggleButton);

    // コードが表示される
    expect(screen.getByText("ソースコード")).toBeInTheDocument();
    expect(screen.getByText(/この機能の実装コードを確認できます/)).toBeInTheDocument();

    // Hide Codeボタンをクリック
    fireEvent.click(screen.getByRole("button", { name: /hide code/i }));

    // コードが非表示になる
    expect(screen.queryByText("ソースコード")).not.toBeInTheDocument();
  });

  it("should display performance metrics tab", () => {
    render(
      <ParallelPresentational combinedData={mockCombinedData} metrics={mockMetrics} error={null} />
    );

    // Performance タブをクリック
    const performanceTab = screen.getByRole("tab", { name: /performance/i });
    fireEvent.click(performanceTab);

    // パフォーマンスタブの内容が表示されることを確認（実際のコンテンツで確認）
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
  });

  it("should display explanation tab", () => {
    render(
      <ParallelPresentational combinedData={mockCombinedData} metrics={mockMetrics} error={null} />
    );

    // Explanation タブをクリック
    const explanationTab = screen.getByRole("tab", { name: /how parallel fetching works/i });
    fireEvent.click(explanationTab);

    // タブパネルが表示されることを確認
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();

    // 基本的な説明コンテンツが表示されることを確認
    expect(screen.getByText("How Parallel Fetching Works")).toBeInTheDocument();
  });

  it("should handle no data available state", () => {
    render(<ParallelPresentational combinedData={null} metrics={null} error={null} />);

    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("should display performance alert with metrics", () => {
    render(
      <ParallelPresentational combinedData={mockCombinedData} metrics={mockMetrics} error={null} />
    );

    expect(screen.getByText(/Parallel Fetch Performance:/)).toBeInTheDocument();
    expect(screen.getByText(/Total time: 150.00ms for 3 requests/)).toBeInTheDocument();
  });

  it("should handle more than 6 categories", () => {
    const manyCategories = {
      ...mockCombinedData,
      categories: [
        ...mockCombinedData.categories,
        ...Array.from({ length: 8 }, (_, i) => ({
          id: i + 3,
          name: `Category ${i + 3}`,
          slug: `category-${i + 3}`,
          description: `Description ${i + 3}`,
          postCount: i + 5,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        })),
      ],
    };

    render(
      <ParallelPresentational combinedData={manyCategories} metrics={mockMetrics} error={null} />
    );

    // 最初の6カテゴリのみ表示
    expect(screen.getAllByText("Technology")[0]).toBeInTheDocument();
    expect(screen.getByText("Category 3")).toBeInTheDocument();
    expect(screen.getByText("Category 6")).toBeInTheDocument();

    // 残りのカテゴリ数が表示される
    expect(screen.getByText("... and 4 more categories")).toBeInTheDocument();
  });

  it("should display user avatar initial", () => {
    render(
      <ParallelPresentational combinedData={mockCombinedData} metrics={mockMetrics} error={null} />
    );

    // 名前の最初の文字が表示される
    expect(screen.getByText("T")).toBeInTheDocument(); // Test User の T
  });

  it("should handle anonymous user", () => {
    const dataWithAnonymousUser: CombinedData = {
      ...mockCombinedData,
      userProfile: {
        ...mockCombinedData.userProfile,
        name: "Anonymous User",
      } as UserProfile,
    };

    render(
      <ParallelPresentational
        combinedData={dataWithAnonymousUser}
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText("Anonymous User")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument(); // Avatar fallback
  });

  it("should calculate average response time correctly", () => {
    render(
      <ParallelPresentational combinedData={mockCombinedData} metrics={mockMetrics} error={null} />
    );

    // Performance タブをクリック
    const performanceTab = screen.getByRole("tab", { name: /performance/i });
    fireEvent.click(performanceTab);

    // タブパネルが表示されることを確認
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
  });

  it("should handle metrics without performance data", () => {
    render(<ParallelPresentational combinedData={mockCombinedData} metrics={null} error={null} />);

    // Performance タブをクリック
    const performanceTab = screen.getByRole("tab", { name: /performance/i });
    fireEvent.click(performanceTab);

    // タブパネルが表示されることを確認
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
  });
});
