// Caching メインページのテスト

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CachingPage from "../page";

// Linkコンポーネントのモック
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("CachingPage", () => {
  describe("レンダリング", () => {
    it("should render the page with correct title", () => {
      // Act
      render(<CachingPage />);

      // Assert
      expect(screen.getByRole("heading", { name: "キャッシュとリバリデート" })).toBeInTheDocument();
      expect(screen.getByText(/Next.js 15の多層キャッシュシステムを完全解説/)).toBeInTheDocument();
    });

    it("should render all key features", () => {
      // Act
      render(<CachingPage />);

      // Assert
      expect(screen.getByText("4層キャッシュシステム")).toBeInTheDocument();
      expect(screen.getAllByText("CloudFront統合").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("リアルタイムメトリクス")).toBeInTheDocument();
      expect(screen.getByText("インテリジェント無効化")).toBeInTheDocument();
    });

    it("should render all cache strategies", () => {
      // Act
      render(<CachingPage />);

      // Assert
      expect(screen.getByText("Data Cache")).toBeInTheDocument();
      expect(screen.getByText("Full Route Cache")).toBeInTheDocument();
      expect(screen.getByText("Router Cache")).toBeInTheDocument();
      expect(screen.getByText("On-demand Revalidation")).toBeInTheDocument();
      expect(screen.getByText("Cache Strategy Comparison")).toBeInTheDocument();
    });
  });

  describe("Navigation links", () => {
    it("should have correct links for each cache strategy", () => {
      // Act
      render(<CachingPage />);

      // Assert
      const links = screen.getAllByRole("link", { name: /デモを体験/ });
      expect(links).toHaveLength(5);

      // 各リンクのhref属性を確認
      const hrefs = links.map((link) => link.getAttribute("href"));
      expect(hrefs).toContain("/features/caching/data-cache");
      expect(hrefs).toContain("/features/caching/full-route-cache");
      expect(hrefs).toContain("/features/caching/router-cache");
      expect(hrefs).toContain("/features/caching/on-demand-revalidation");
      expect(hrefs).toContain("/features/caching/comparison");
    });
  });

  describe("Cache strategy cards", () => {
    it("should display badges for each strategy", () => {
      // Act
      render(<CachingPage />);

      // Assert
      expect(screen.getByText("Core")).toBeInTheDocument();
      expect(screen.getByText("Page Level")).toBeInTheDocument();
      expect(screen.getByText("Client Side")).toBeInTheDocument();
      expect(screen.getByText("Dynamic")).toBeInTheDocument();
      expect(screen.getByText("Analysis")).toBeInTheDocument();
    });

    it("should display strategy descriptions", () => {
      // Act
      render(<CachingPage />);

      // Assert
      expect(screen.getByText(/Next.js fetch APIのキャッシュ機能/)).toBeInTheDocument();
      expect(screen.getByText(/完全なページレンダリング結果をキャッシュ/)).toBeInTheDocument();
      expect(screen.getByText(/クライアントサイドナビゲーションのキャッシュ/)).toBeInTheDocument();
      expect(screen.getByText(/必要に応じてキャッシュを無効化/)).toBeInTheDocument();
      expect(screen.getByText(/各キャッシュ戦略のパフォーマンス比較/)).toBeInTheDocument();
    });

    it("should display strategy features", () => {
      // Act
      render(<CachingPage />);

      // Assert
      // Data Cache features
      expect(screen.getByText("自動キャッシュ")).toBeInTheDocument();
      expect(screen.getByText("タグベース無効化")).toBeInTheDocument();
      expect(screen.getByText("リクエスト重複排除")).toBeInTheDocument();

      // Full Route Cache features
      expect(screen.getByText("HTML全体キャッシュ")).toBeInTheDocument();
      expect(screen.getByText("ISR対応")).toBeInTheDocument();
      expect(screen.getByText("ビルド時生成")).toBeInTheDocument();

      // Router Cache features
      expect(screen.getByText("プリフェッチ")).toBeInTheDocument();
      expect(screen.getByText("ソフトナビゲーション")).toBeInTheDocument();
      expect(screen.getByText("インスタント遷移")).toBeInTheDocument();

      // On-demand Revalidation features
      expect(screen.getByText("パス/タグ指定")).toBeInTheDocument();
      expect(screen.getByText("Webhook連携")).toBeInTheDocument();
      expect(screen.getByText("バックエンド通知")).toBeInTheDocument();

      // Comparison features
      expect(screen.getByText("性能比較")).toBeInTheDocument();
      expect(screen.getAllByText("CloudFront統合").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("最適化提案")).toBeInTheDocument();
    });
  });

  describe("Implementation points section", () => {
    it("should display implementation points", () => {
      // Act
      render(<CachingPage />);

      // Assert
      expect(screen.getByText("実装のポイント")).toBeInTheDocument();
      expect(screen.getByText("パフォーマンス最適化")).toBeInTheDocument();
      expect(screen.getByText("監視とデバッグ")).toBeInTheDocument();
    });

    it("should display optimization tips", () => {
      // Act
      render(<CachingPage />);

      // Assert
      expect(screen.getByText(/適切なrevalidate時間の設定/)).toBeInTheDocument();
      expect(screen.getByText(/タグベースの選択的無効化/)).toBeInTheDocument();
      expect(screen.getByText(/CloudFrontとの連携設定/)).toBeInTheDocument();
      expect(screen.getByText(/キャッシュウォーミング戦略/)).toBeInTheDocument();
    });

    it("should display monitoring tips", () => {
      // Act
      render(<CachingPage />);

      // Assert
      expect(screen.getByText(/リアルタイムキャッシュメトリクス/)).toBeInTheDocument();
      expect(screen.getByText(/ヒット率の継続的監視/)).toBeInTheDocument();
      expect(screen.getByText(/パフォーマンス改善提案/)).toBeInTheDocument();
      expect(screen.getByText(/キャッシュヘルスチェック/)).toBeInTheDocument();
    });

    it("should display hint section", () => {
      // Act
      render(<CachingPage />);

      // Assert
      expect(
        screen.getByText(/各デモページでは実際のキャッシュ動作を確認でき/)
      ).toBeInTheDocument();
    });
  });

  describe("Icons rendering", () => {
    it("should render icons for each strategy", () => {
      // Act
      const { container } = render(<CachingPage />);

      // Assert
      // SVG要素の存在を確認（Lucideアイコンはsvgとしてレンダリングされる）
      const svgElements = container.querySelectorAll("svg");
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });
});
