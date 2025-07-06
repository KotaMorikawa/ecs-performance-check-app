import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BasicRoutingPresentational } from "../_containers/presentational";

describe("BasicRoutingPresentational", () => {
  const mockProps = {
    serverData: {
      timestamp: "2025-06-25T14:24:11.910Z",
      serverRenderTime: 1735140251910,
    },
  };

  it("serverData propを正しく表示すべき", () => {
    render(<BasicRoutingPresentational {...mockProps} />);

    const renderTimeElement = screen.getByTestId("render-time");
    expect(renderTimeElement).toHaveTextContent("クライアントレンダリング時間:");
    expect(renderTimeElement).toHaveTextContent("サーバータイムスタンプ: 2025-06-25T14:24:11.910Z");
  });

  it("ページタイトルとヘッダーを表示すべき", () => {
    render(<BasicRoutingPresentational {...mockProps} />);

    expect(screen.getByRole("heading", { name: /Basic App Router/i })).toBeInTheDocument();

    expect(
      screen.getByText(/Next.js 15.3.4 の App Router を使用した基本的なルーティング機能のデモ$/i)
    ).toBeInTheDocument();
  });

  it("パフォーマンスメトリクスセクションを表示すべき", () => {
    render(<BasicRoutingPresentational {...mockProps} />);

    expect(screen.getByTestId("performance-metrics")).toBeInTheDocument();
    expect(screen.getByText("パフォーマンスメトリクス")).toBeInTheDocument();
    expect(screen.getByText("リアルタイムのCore Web Vitals測定結果")).toBeInTheDocument();
  });

  it("ルーティング機能ナビゲーションを表示すべき", () => {
    render(<BasicRoutingPresentational {...mockProps} />);

    expect(screen.getByText("他のルーティング機能")).toBeInTheDocument();
    expect(screen.getByText("動的ルーティング")).toBeInTheDocument();
    expect(screen.getByText("ネストされたレイアウト")).toBeInTheDocument();
    expect(screen.getByText("ローディング・エラー")).toBeInTheDocument();
  });

  it("機能説明セクションを表示すべき", () => {
    render(<BasicRoutingPresentational {...mockProps} />);

    // SegmentFeatureInfo コンポーネントが表示されることを確認
    expect(screen.getByText("実現可能な機能")).toBeInTheDocument();
    expect(screen.getByText("確認方法")).toBeInTheDocument();
  });

  it("コード表示セクションを表示すべき", () => {
    render(<BasicRoutingPresentational {...mockProps} />);

    // CodeDisplay コンポーネントが存在することを確認
    expect(screen.getByRole("button", { name: /コードを表示/i })).toBeInTheDocument();
  });

  it("異なるタイムスタンプでも正しく表示すべき", () => {
    const customProps = {
      serverData: {
        timestamp: "2025-01-01T00:00:00.000Z",
        serverRenderTime: 1704067200000,
      },
    };
    render(<BasicRoutingPresentational {...customProps} />);

    const renderTimeElement = screen.getByTestId("render-time");
    expect(renderTimeElement).toHaveTextContent("サーバータイムスタンプ: 2025-01-01T00:00:00.000Z");
  });
});
