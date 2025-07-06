"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import type React from "react";
import { Component, type ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  goHome: () => void;
}

// デフォルトのエラー表示コンポーネント
function DefaultErrorFallback({ error, resetError, goHome }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen bg-white p-8 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            Server Actions でエラーが発生しました
          </CardTitle>
          <CardDescription>
            予期しないエラーが発生しました。以下の方法をお試しください。
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* エラーメッセージ */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">エラーの詳細:</div>
              <div className="text-sm break-words">{error.message || "Unknown error occurred"}</div>
            </AlertDescription>
          </Alert>

          {/* 開発環境でのスタックトレース表示 */}
          {isDevelopment && (
            <Alert>
              <AlertDescription>
                <div className="font-medium mb-2">Stack Trace (開発環境のみ):</div>
                <pre className="text-xs overflow-auto max-h-32 bg-muted p-2 rounded">
                  {error.stack}
                </pre>
              </AlertDescription>
            </Alert>
          )}

          {/* 復旧オプション */}
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">以下の方法で問題を解決できる可能性があります：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>ページを再読み込みする</li>
                <li>ブラウザのキャッシュをクリアする</li>
                <li>しばらく時間をおいてから再試行する</li>
                <li>ホームページに戻って最初からやり直す</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button onClick={resetError} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                ページを再読み込み
              </Button>
              <Button onClick={goHome} variant="outline" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                ホームに戻る
              </Button>
            </div>
          </div>

          {/* Progressive Enhancement に関する注意 */}
          <Alert>
            <AlertDescription>
              <div className="font-medium mb-2">💡 ヒント:</div>
              <p className="text-sm">
                このアプリケーションはProgressive Enhancementに対応しています。
                JavaScriptを無効にしてもServer Actionsの基本機能は動作します。
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Server Actions用のError Boundary
 *
 * Features:
 * - React 18のエラーバウンダリー機能を活用
 * - Server Actionsでの予期しないエラーをキャッチ
 * - 開発環境では詳細なエラー情報を表示
 * - ユーザーフレンドリーなエラー回復オプション
 * - Progressive Enhancementのガイダンス
 */
export class ServerActionsErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // エラーログを送信（プロダクション環境では外部サービスに送信）
    console.error("Server Actions Error Boundary caught an error:", error, errorInfo);

    // 開発環境では詳細ログを出力
    if (process.env.NODE_ENV === "development") {
      console.group("🚨 Server Actions Error Details");
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.error("Component Stack:", errorInfo.componentStack);
      console.groupEnd();
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    // ページを再読み込み
    window.location.reload();
  };

  goHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          goHome={this.goHome}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * HOC: コンポーネントをError Boundaryでラップ
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>
) {
  const WrappedComponent = (props: P) => (
    <ServerActionsErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ServerActionsErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export type { ErrorFallbackProps };
