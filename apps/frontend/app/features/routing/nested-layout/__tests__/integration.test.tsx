import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NestedLayoutPage from "../page";

describe("Nested Layout Page", () => {
  it("ページタイトルを表示すべき", () => {
    render(<NestedLayoutPage />);

    expect(screen.getByRole("heading", { name: /Nested Layout/i })).toBeInTheDocument();
  });

  it("ネストされたレイアウトの説明を表示すべき", () => {
    render(<NestedLayoutPage />);

    expect(
      screen.getByText(
        /複数のレイアウトを階層的に組み合わせるNext.js 15.3.4のネストされたレイアウト機能のデモ/i
      )
    ).toBeInTheDocument();
  });

  it("レイアウト階層の可視化を表示すべき", () => {
    render(<NestedLayoutPage />);

    expect(screen.getByTestId("layout-hierarchy")).toBeInTheDocument();
    expect(screen.getByText("レイアウト階層")).toBeInTheDocument();
  });

  it("レイアウト機能のデモセクションを表示すべき", () => {
    render(<NestedLayoutPage />);

    expect(screen.getByText("レイアウト機能のデモ")).toBeInTheDocument();
    expect(screen.getByText("共通要素の継承")).toBeInTheDocument();
    expect(screen.getByText("パフォーマンス最適化")).toBeInTheDocument();
  });

  it("パフォーマンスメトリクスを表示すべき", () => {
    render(<NestedLayoutPage />);

    expect(screen.getByTestId("performance-metrics")).toBeInTheDocument();

    // Core Web Vitalsセクションの確認（複数要素があるため getAllByText を使用）
    const coreWebVitalsElements = screen.getAllByText("Core Web Vitals");
    expect(coreWebVitalsElements.length).toBeGreaterThan(0);
  });

  it("機能説明セクションを表示すべき", () => {
    render(<NestedLayoutPage />);

    expect(screen.getByText("実現可能な機能")).toBeInTheDocument();
    expect(screen.getByText("確認方法")).toBeInTheDocument();
    expect(screen.getByText("Nested Layouts")).toBeInTheDocument();
  });
});
