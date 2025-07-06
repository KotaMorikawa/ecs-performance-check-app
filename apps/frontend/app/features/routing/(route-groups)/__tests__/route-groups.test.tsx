import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AdminPage from "../admin/page";
import PublicPage from "../public/page";

describe("Route Groups", () => {
  describe("Public Page", () => {
    it("ページタイトルを表示すべき", () => {
      render(<PublicPage />);

      expect(screen.getByRole("heading", { name: /Public Area/i })).toBeInTheDocument();
    });

    it("Route Group のバッジを表示すべき", () => {
      render(<PublicPage />);

      expect(screen.getByText("Route Group")).toBeInTheDocument();
      expect(screen.getByText("Public Access")).toBeInTheDocument();
    });

    it("ルート情報カードを表示すべき", () => {
      render(<PublicPage />);

      expect(screen.getByText("ルート情報")).toBeInTheDocument();
      expect(screen.getByText("ファイル構成")).toBeInTheDocument();
      expect(screen.getByText("実際のURL")).toBeInTheDocument();
    });

    it("パブリック機能を表示すべき", () => {
      render(<PublicPage />);

      expect(screen.getByText("Public Area 機能")).toBeInTheDocument();
      expect(screen.getByText("ユーザー登録")).toBeInTheDocument();
      expect(screen.getByText("コンテンツ閲覧")).toBeInTheDocument();
      expect(screen.getByText("フィードバック")).toBeInTheDocument();
    });

    it("パフォーマンスメトリクスを表示すべき", () => {
      render(<PublicPage />);

      expect(screen.getByTestId("performance-metrics")).toBeInTheDocument();
      expect(screen.getByTestId("render-time")).toBeInTheDocument();
    });
  });

  describe("Admin Page", () => {
    it("未認証時に認証画面を表示すべき", () => {
      render(<AdminPage />);

      expect(screen.getByText("管理エリア")).toBeInTheDocument();
      expect(screen.getByText("このエリアにアクセスするには認証が必要です")).toBeInTheDocument();
      expect(screen.getByText("管理者として認証 (デモ)")).toBeInTheDocument();
    });

    it("認証後に管理画面を表示すべき", () => {
      render(<AdminPage />);

      const authButton = screen.getByText("管理者として認証 (デモ)");
      fireEvent.click(authButton);

      expect(screen.getByRole("heading", { name: /Admin Area/i })).toBeInTheDocument();
      expect(screen.getByText("Route Group")).toBeInTheDocument();
      expect(screen.getByText("Admin Access")).toBeInTheDocument();
    });

    it("認証後に管理ダッシュボードを表示すべき", () => {
      render(<AdminPage />);

      const authButton = screen.getByText("管理者として認証 (デモ)");
      fireEvent.click(authButton);

      expect(screen.getByText("総ユーザー数")).toBeInTheDocument();
      expect(screen.getByText("1,234")).toBeInTheDocument();
      expect(screen.getByText("月間訪問者")).toBeInTheDocument();
      expect(screen.getByText("45,678")).toBeInTheDocument();
    });

    it("認証後に管理機能を表示すべき", () => {
      render(<AdminPage />);

      const authButton = screen.getByText("管理者として認証 (デモ)");
      fireEvent.click(authButton);

      expect(screen.getByText("管理機能")).toBeInTheDocument();
      expect(screen.getByText("ユーザー管理")).toBeInTheDocument();
      expect(screen.getByText("システム設定")).toBeInTheDocument();
      expect(screen.getByText("分析・レポート")).toBeInTheDocument();
    });

    it("認証後にログアウトボタンを表示すべき", () => {
      render(<AdminPage />);

      const authButton = screen.getByText("管理者として認証 (デモ)");
      fireEvent.click(authButton);

      expect(screen.getByText("ログアウト (デモ)")).toBeInTheDocument();
    });
  });
});
