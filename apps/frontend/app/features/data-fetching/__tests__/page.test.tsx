import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom";
import DataFetchingPage from "../page";

describe("DataFetchingPage", () => {
  it("should render data fetching overview page", () => {
    render(<DataFetchingPage />);

    // メインタイトルが表示されることを確認
    expect(screen.getByText("Data Fetching Patterns")).toBeInTheDocument();
  });

  it("should display page description", () => {
    render(<DataFetchingPage />);

    // ページの説明が表示されることを確認
    expect(screen.getByText(/Explore Next.js 15 data fetching strategies/)).toBeInTheDocument();
  });

  it("should show SSG option card", () => {
    render(<DataFetchingPage />);

    expect(screen.getByText("SSG (Static Site Generation)")).toBeInTheDocument();
    expect(
      screen.getByText(/Pre-rendered at build time with generateStaticParams/)
    ).toBeInTheDocument();
  });

  it("should show ISR option card", () => {
    render(<DataFetchingPage />);

    expect(screen.getByText("ISR (Incremental Static Regeneration)")).toBeInTheDocument();
    expect(screen.getByText(/Static generation with time-based revalidation/)).toBeInTheDocument();
  });

  it("should show SSR option card", () => {
    render(<DataFetchingPage />);

    expect(screen.getByText("SSR (Server-Side Rendering)")).toBeInTheDocument();
    expect(screen.getByText(/Rendered on each request with real-time data/)).toBeInTheDocument();
  });

  it("should show Client-side option card", () => {
    render(<DataFetchingPage />);

    expect(screen.getByText("Client-Side Fetching")).toBeInTheDocument();
    expect(screen.getByText(/Browser-based fetching with useEffect and SWR/)).toBeInTheDocument();
  });

  it("should show Parallel option card", () => {
    render(<DataFetchingPage />);

    expect(screen.getByText("Parallel Fetching")).toBeInTheDocument();
    expect(screen.getByText(/Multiple API endpoints with Promise.all/)).toBeInTheDocument();
  });

  it("should have navigation links to each demo", () => {
    render(<DataFetchingPage />);

    // 各デモページへのリンクが存在することを確認
    const demoLinks = screen.getAllByText("View Demo & Code");
    expect(demoLinks.length).toBeGreaterThanOrEqual(5);
  });

  it("should display performance comparison information", () => {
    render(<DataFetchingPage />);

    // パフォーマンス比較情報が表示されることを確認
    expect(screen.getByText(/Performance Comparison Overview/)).toBeInTheDocument();
  });

  it("should show when to use each pattern", () => {
    render(<DataFetchingPage />);

    // 使い分けのガイダンスが表示されることを確認
    expect(screen.getAllByText("Best Use Case").length).toBeGreaterThan(0);
  });

  it("should be accessible", () => {
    render(<DataFetchingPage />);

    // 基本的なアクセシビリティ要素が存在することを確認
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getAllByRole("heading").length).toBeGreaterThan(0);
  });

  it("should have proper heading hierarchy", () => {
    render(<DataFetchingPage />);

    // H1 タイトルが存在することを確認
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Data Fetching Patterns");
  });

  it("should display overview section", () => {
    render(<DataFetchingPage />);

    // 概要セクションが表示されることを確認
    expect(screen.getByText(/Each demo includes detailed performance metrics/)).toBeInTheDocument();
  });

  it("should show comparison table or grid", () => {
    render(<DataFetchingPage />);

    // 比較要素が表示されることを確認（カードグリッドまたはテーブル）
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(5); // 5つのデモページリンクが最低限存在
  });

  it("should have consistent layout structure", () => {
    render(<DataFetchingPage />);

    // レイアウト構造が一貫していることを確認
    const container = render(<DataFetchingPage />).container;
    expect(container.firstChild).toBeInTheDocument();
  });
});
