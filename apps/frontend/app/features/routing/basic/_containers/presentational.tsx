"use client";

import { Activity, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CodeDisplay } from "@/components/code-display";
import { EnhancedPerformanceDisplay } from "@/components/enhanced-performance-display";
import { SegmentFeatureInfo } from "@/components/features/segment-feature-info";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BasicRoutingPresentationalProps {
  serverData: {
    timestamp: string;
    serverRenderTime: number;
  };
}

export function BasicRoutingPresentational({ serverData }: BasicRoutingPresentationalProps) {
  const [clientRenderTime, setClientRenderTime] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    const endTime = performance.now();
    setClientRenderTime(endTime - startTime);
  }, []);
  return (
    <div className="min-h-screen bg-white p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Basic App Router</h1>
        <p className="text-lg text-gray-600">
          Next.js 15.3.4 の App Router を使用した基本的なルーティング機能のデモ
        </p>
      </header>

      {/* パフォーマンスメトリクス */}
      <section className="mb-8">
        <Card data-testid="performance-metrics">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              パフォーマンスメトリクス
            </CardTitle>
            <CardDescription>リアルタイムのCore Web Vitals測定結果</CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedPerformanceDisplay />

            <div
              data-testid="render-time"
              className="flex items-center gap-2 text-sm mt-6 pt-6 border-t"
            >
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>クライアントレンダリング時間: {clientRenderTime.toFixed(2)} ms</span>
              <span className="ml-4">サーバータイムスタンプ: {serverData.timestamp}</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ルーティング機能のナビゲーション */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>他のルーティング機能</CardTitle>
            <CardDescription>Next.js 15.3.4の様々なルーティング機能を確認できます</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto p-4 justify-start">
                <Link href="/features/routing/dynamic/demo-123">
                  <div className="text-left">
                    <div className="font-semibold">動的ルーティング</div>
                    <div className="text-sm text-muted-foreground">
                      URLパラメータに基づく動的ページ生成
                    </div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4 justify-start">
                <Link href="/features/routing/nested-layout">
                  <div className="text-left">
                    <div className="font-semibold">ネストされたレイアウト</div>
                    <div className="text-sm text-muted-foreground">
                      階層的なレイアウト組み合わせ
                    </div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4 justify-start">
                <Link href="/features/routing/loading-error">
                  <div className="text-left">
                    <div className="font-semibold">ローディング・エラー</div>
                    <div className="text-sm text-muted-foreground">loading.tsx と error.tsx</div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4 justify-start">
                <Link href="/features/routing/public" as="/features/routing/public">
                  <div className="text-left">
                    <div className="font-semibold">ルートグループ</div>
                    <div className="text-sm text-muted-foreground">URLに影響しないフォルダ構成</div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4 justify-start">
                <Link href="/features/routing/parallel-intercept">
                  <div className="text-left">
                    <div className="font-semibold">並列・インターセプト</div>
                    <div className="text-sm text-muted-foreground">高度なルーティング機能</div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4 justify-start">
                <Link href="/features/routing/basic">
                  <div className="text-left">
                    <div className="font-semibold">基本ルーティング</div>
                    <div className="text-sm text-muted-foreground">
                      現在のページ（Basic App Router）
                    </div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 機能説明セクション */}
      <SegmentFeatureInfo segmentType="routing" subType="basic" />

      {/* コード表示セクション */}
      <section className="mb-8">
        <CodeDisplay
          title="Basic App Router ソースコード"
          description="Next.js 15.3.4のApp Routerを使用した基本的なルーティング機能の実装"
          files={[
            {
              filename: "page.tsx",
              language: "tsx",
              description: "メインページコンポーネント",
              content: `import { BasicRoutingContainer } from './_containers/basic-routing.container';

export default function BasicRoutingPage() {
  return <BasicRoutingContainer />;
}`,
            },
            {
              filename: "_containers/basic-routing.container.tsx",
              language: "tsx",
              description: "クライアントロジック（パフォーマンス測定）",
              content: `'use client';

import { useEffect, useState } from 'react';
import { BasicRoutingPresentational } from '../_components/basic-routing.presentational';

export function BasicRoutingContainer() {
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
  }, []);

  return <BasicRoutingPresentational renderTime={renderTime} />;
}`,
            },
            {
              filename: "_components/basic-routing.presentational.tsx",
              language: "tsx",
              description: "プレゼンテーションレイヤー（UI表示）",
              content: `import Link from 'next/link';
import { SegmentFeatureInfo } from '@/components/features/segment-feature-info';
import { Button } from '@/components/ui/button';
// ... UI コンポーネント`,
            },
            {
              filename: "layout.tsx",
              language: "tsx",
              description: "ルートレイアウトコンポーネント",
              content: `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Basic App Router - ECS Performance Check',
  description: 'Next.js 15.3.4のApp Routerを使用した基本的なルーティング機能のデモ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}`,
            },
          ]}
        />
      </section>
    </div>
  );
}
