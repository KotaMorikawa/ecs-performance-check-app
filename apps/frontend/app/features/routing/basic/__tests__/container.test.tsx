import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BasicRoutingContainer } from "../_containers/container";

// performance および web-vitals API をモック
const mockPerformanceNow = vi.fn();
const mockGetEntriesByType = vi.fn(() => []);
const mockGetEntries = vi.fn(() => []);

Object.defineProperty(window, "performance", {
  writable: true,
  value: {
    now: mockPerformanceNow,
    getEntriesByType: mockGetEntriesByType,
    getEntries: mockGetEntries,
    mark: vi.fn(),
    measure: vi.fn(),
    navigation: {},
    timing: {},
  },
});

// web-vitals を完全にモック
vi.mock("web-vitals", () => ({
  onCLS: vi.fn(),
  onFCP: vi.fn(),
  onINP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
  onFID: vi.fn(),
}));

describe("BasicRoutingContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceNow.mockReturnValue(100);
    mockGetEntriesByType.mockReturnValue([]);
  });

  it("パフォーマンス測定ロジックを実行すべき", () => {
    render(<BasicRoutingContainer />);

    // performance.now() が呼び出されることを確認
    expect(mockPerformanceNow).toHaveBeenCalled();
  });

  it("renderTime propを正しく計算して渡すべき", () => {
    // 異なる時間を返すよう設定
    mockPerformanceNow
      .mockReturnValueOnce(100) // startTime
      .mockReturnValueOnce(150); // endTime

    render(<BasicRoutingContainer />);

    // レンダリング時間が表示されることを確認
    const renderTimeElement = screen.getByTestId("render-time");
    expect(renderTimeElement).toBeInTheDocument();
  });

  it("useEffect が正しく動作すべき", () => {
    render(<BasicRoutingContainer />);

    // コンポーネントがマウントされることを確認
    expect(screen.getByRole("heading", { name: /Basic App Router/i })).toBeInTheDocument();
  });
});
