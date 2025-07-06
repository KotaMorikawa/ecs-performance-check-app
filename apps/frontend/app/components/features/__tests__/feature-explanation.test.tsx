import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeatureExplanation } from "../feature-explanation";

// TDD: 機能説明コンポーネントのテスト
describe("FeatureExplanation", () => {
  const mockFeatureData = {
    title: "App Router基本機能",
    description: "Next.js 15.3.4のApp Routerによる基本的なルーティング機能",
    capabilities: [
      "ファイルベースルーティング",
      "Server Components",
      "Client Components",
      "Nested Layouts",
    ],
    verificationSteps: [
      {
        step: "URLアクセス",
        description: "/features/routing/basic にアクセス",
        expected: "ページが正常に表示される",
      },
      {
        step: "パフォーマンス確認",
        description: "ブラウザDevToolsのPerformanceタブを開く",
        expected: "LCP, FID, CLS, INPメトリクスが表示される",
      },
    ],
    technicalDetails: [
      "App Directory構造の活用",
      "React 18 Suspenseとの連携",
      "TypeScript型安全性の確保",
    ],
  };

  it("機能タイトルを表示すべき", () => {
    render(<FeatureExplanation feature={mockFeatureData} />);

    expect(screen.getByText(/App Router基本機能/i)).toBeInTheDocument();
  });

  it("機能の説明を表示すべき", () => {
    render(<FeatureExplanation feature={mockFeatureData} />);

    expect(
      screen.getByText(/Next.js 15.3.4のApp Routerによる基本的なルーティング機能/i)
    ).toBeInTheDocument();
  });

  it("実現可能な機能リストを表示すべき", () => {
    render(<FeatureExplanation feature={mockFeatureData} />);

    expect(screen.getByText("実現可能な機能")).toBeInTheDocument();
    expect(screen.getByText("ファイルベースルーティング")).toBeInTheDocument();
    expect(screen.getByText("Server Components")).toBeInTheDocument();
    expect(screen.getByText("Client Components")).toBeInTheDocument();
    expect(screen.getByText("Nested Layouts")).toBeInTheDocument();
  });

  it("確認方法セクションを表示すべき", () => {
    render(<FeatureExplanation feature={mockFeatureData} />);

    expect(screen.getByText("確認方法")).toBeInTheDocument();
    expect(screen.getByText("URLアクセス")).toBeInTheDocument();
    expect(screen.getByText("/features/routing/basic にアクセス")).toBeInTheDocument();
    expect(screen.getByText("ページが正常に表示される")).toBeInTheDocument();
  });

  it("技術的詳細を展開・折りたたみできるべき", () => {
    render(<FeatureExplanation feature={mockFeatureData} />);

    const toggleButton = screen.getByRole("button", { name: /技術的詳細を表示/i });

    // 初期状態では技術的詳細は非表示
    expect(screen.queryByText("App Directory構造の活用")).not.toBeInTheDocument();

    // ボタンクリックで表示
    fireEvent.click(toggleButton);
    expect(screen.getByText("App Directory構造の活用")).toBeInTheDocument();
    expect(screen.getByText("React 18 Suspenseとの連携")).toBeInTheDocument();

    // 再度クリックで非表示
    fireEvent.click(toggleButton);
    expect(screen.queryByText("App Directory構造の活用")).not.toBeInTheDocument();
  });

  it("各確認ステップが正しい構造で表示されるべき", () => {
    render(<FeatureExplanation feature={mockFeatureData} />);

    // 確認ステップのタイトル
    expect(screen.getByText("URLアクセス")).toBeInTheDocument();
    expect(screen.getByText("パフォーマンス確認")).toBeInTheDocument();

    // 確認ステップの説明
    expect(screen.getByText("/features/routing/basic にアクセス")).toBeInTheDocument();
    expect(screen.getByText("ブラウザDevToolsのPerformanceタブを開く")).toBeInTheDocument();

    // 期待される結果
    expect(screen.getByText("ページが正常に表示される")).toBeInTheDocument();
    expect(screen.getByText("LCP, FID, CLS, INPメトリクスが表示される")).toBeInTheDocument();
  });

  it("データが空の場合でもエラーにならないべき", () => {
    const emptyFeature = {
      title: "",
      description: "",
      capabilities: [],
      verificationSteps: [],
      technicalDetails: [],
    };

    render(<FeatureExplanation feature={emptyFeature} />);

    // コンポーネントがレンダリングされることを確認
    expect(screen.getByRole("region")).toBeInTheDocument();
  });
});
