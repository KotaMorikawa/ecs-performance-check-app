import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import type { Category } from "../../_shared/types";
import { ClientSidePresentational } from "../_containers/presentational";

// Global fetch のモック
const mockFetch = vi.fn();

// Response モック作成ヘルパー
const createMockResponse = (
  data: unknown,
  options: {
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
  } = {}
): Response => {
  const { status = 200, statusText = "OK", headers = {} } = options;

  return new Response(JSON.stringify(data), {
    status,
    statusText,
    headers: new Headers(headers),
  });
};

// モックデータ
const mockCategories: Category[] = [
  {
    id: 1,
    name: "Technology",
    slug: "technology",
    description: "Tech-related posts",
    postCount: 10,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T12:00:00Z",
  },
  {
    id: 2,
    name: "Science",
    slug: "science",
    description: "Science-related posts",
    postCount: 5,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T12:00:00Z",
  },
];

const mockApiResponse = {
  data: mockCategories,
  success: true,
};

describe("ClientSidePresentational", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Global fetch をモック
    global.fetch = mockFetch;
    // Performance API のモック
    global.performance.now = vi.fn().mockReturnValue(1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show loading state initially", () => {
    // fetch が pending の状態をシミュレート
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<ClientSidePresentational />);

    expect(screen.getByText(/loading categories/i)).toBeInTheDocument();
  });

  it("should display data when loaded successfully", async () => {
    const mockResponse = createMockResponse(mockApiResponse);
    mockFetch.mockResolvedValueOnce(mockResponse);

    await act(async () => {
      render(<ClientSidePresentational />);
    });

    await waitFor(
      () => {
        expect(screen.getByText("Technology")).toBeInTheDocument();
        expect(screen.getByText("Science")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(screen.getByText("10 posts")).toBeInTheDocument();
    expect(screen.getByText("5 posts")).toBeInTheDocument();
  });

  it("should show error state when fetch fails", async () => {
    const errorMessage = "Failed to fetch data";
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));

    await act(async () => {
      render(<ClientSidePresentational />);
    });

    await waitFor(
      () => {
        expect(screen.getByText(/error loading client-side content/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // エラー詳細メッセージを部分一致で確認
    expect(screen.getByText(new RegExp(errorMessage, "i"))).toBeInTheDocument();
  });

  it("should display basic UI elements", async () => {
    const mockResponse = createMockResponse(mockApiResponse);
    mockFetch.mockResolvedValueOnce(mockResponse);

    await act(async () => {
      render(<ClientSidePresentational />);
    });

    // データが読み込まれるまで待機
    await waitFor(
      () => {
        expect(screen.getByText("Technology")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // 基本的なUIエレメントの存在確認
    expect(screen.getByRole("tab", { name: /content/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /performance/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /how client-side fetching works/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /show code/i })).toBeInTheDocument();
  });

  it("should toggle code display", async () => {
    const mockResponse = createMockResponse(mockApiResponse);
    mockFetch.mockResolvedValueOnce(mockResponse);

    await act(async () => {
      render(<ClientSidePresentational />);
    });

    await waitFor(
      () => {
        expect(screen.getByText("Technology")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // 初期状態ではコードが表示されていない
    expect(screen.queryByText("ソースコード")).not.toBeInTheDocument();

    // Show Codeボタンをクリック
    const toggleButton = screen.getByRole("button", { name: /show code/i });
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    // コードが表示される
    expect(screen.getByText("ソースコード")).toBeInTheDocument();

    // Hide Codeボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /hide code/i }));
    });

    // コードが非表示になる
    expect(screen.queryByText("ソースコード")).not.toBeInTheDocument();
  });

  it("should handle empty categories response", async () => {
    const mockResponse = createMockResponse({ success: true, data: [] });
    mockFetch.mockResolvedValueOnce(mockResponse);

    await act(async () => {
      render(<ClientSidePresentational />);
    });

    await waitFor(
      () => {
        expect(screen.getByText("No categories available")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("should allow manual refresh", async () => {
    // 初回の fetch をモック
    const mockResponse = createMockResponse(mockApiResponse);
    mockFetch.mockResolvedValue(mockResponse);

    await act(async () => {
      render(<ClientSidePresentational />);
    });

    // 初回データが読み込まれるまで待機
    await waitFor(
      () => {
        expect(screen.getByText("Technology")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    const refreshButton = screen.getByRole("button", { name: /refresh/i });

    await act(async () => {
      fireEvent.click(refreshButton);
    });

    // fetch が2回呼ばれることを確認（初回 + リフレッシュ）
    await waitFor(
      () => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      },
      { timeout: 10000 }
    );
  });

  it("should display fetch API call parameters", async () => {
    const mockResponse = createMockResponse(mockApiResponse);
    mockFetch.mockResolvedValue(mockResponse);

    await act(async () => {
      render(<ClientSidePresentational />);
    });

    // コンポーネントが正常にマウントされ、初回データ取得が行われることを確認
    await waitFor(
      () => {
        expect(screen.getByText("Technology")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // 初回のfetch呼び出しを確認
    expect(mockFetch).toHaveBeenCalledWith("/api/categories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    });
  });

  it("should display client-side characteristics", async () => {
    const mockResponse = createMockResponse(mockApiResponse);
    mockFetch.mockResolvedValueOnce(mockResponse);

    await act(async () => {
      render(<ClientSidePresentational />);
    });

    await waitFor(
      () => {
        expect(
          screen.getByText(/This data is fetched in the browser after the page loads/)
        ).toBeInTheDocument();
        expect(screen.getByText("Every 30s")).toBeInTheDocument(); // Auto-refresh interval
        expect(screen.getByText("Browser")).toBeInTheDocument(); // Data source
      },
      { timeout: 10000 }
    );
  });

  it("should display performance tab correctly", async () => {
    const mockPerformanceNow = vi.fn();
    global.performance.now = mockPerformanceNow;
    mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(1200);

    const mockResponse = createMockResponse(mockApiResponse);
    mockFetch.mockResolvedValueOnce(mockResponse);

    await act(async () => {
      render(<ClientSidePresentational />);
    });

    await waitFor(
      () => {
        expect(screen.getByText("Technology")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Performance タブをクリック
    const performanceTab = screen.getByRole("tab", { name: /performance/i });
    await act(async () => {
      fireEvent.click(performanceTab);
    });

    // タブパネルが表示されることを確認
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
  });
});
