'use client';

import { useEffect, useState } from 'react';
import { SegmentFeatureInfo } from '@/components/features/segment-feature-info';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedPerformanceDisplay } from '@/components/enhanced-performance-display';
import { Activity, Eye, Clock, Layers, Layout, ChevronRight } from 'lucide-react';

export default function NestedLayoutPage() {
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
  }, []);

  const layoutHierarchy = [
    {
      name: 'Root Layout',
      path: 'app/layout.tsx',
      level: 1,
      description: 'HTML, Body, グローバルスタイルを提供'
    },
    {
      name: 'Features Layout',
      path: 'app/features/layout.tsx',
      level: 2,
      description: '機能共通のナビゲーションやスタイル'
    },
    {
      name: 'Routing Layout',
      path: 'app/features/routing/layout.tsx',
      level: 3,
      description: 'ルーティング機能専用のレイアウト'
    },
    {
      name: 'Nested Layout',
      path: 'app/features/routing/nested-layout/layout.tsx',
      level: 4,
      description: 'ネストされたページ専用のサイドバーとヘッダー'
    },
    {
      name: 'Page Component',
      path: 'app/features/routing/nested-layout/page.tsx',
      level: 5,
      description: '実際のページコンテンツ'
    }
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Nested Layout
        </h1>
        <p className="text-lg text-gray-600">
          複数のレイアウトを階層的に組み合わせるNext.js 15.3.4のネストされたレイアウト機能のデモ
        </p>
      </header>

      {/* レイアウト階層の可視化 */}
      <section>
        <Card data-testid="layout-hierarchy">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              レイアウト階層
            </CardTitle>
            <CardDescription>
              現在のページで使用されているレイアウトの階層構造
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {layoutHierarchy.map((layout, index) => (
                <div key={layout.path} className="flex items-center">
                  <div className="flex items-center flex-1">
                    <div className="flex items-center">
                      {Array.from({ length: layout.level - 1 }).map((_, i) => (
                        <div key={i} className="w-6 flex justify-center">
                          <div className="w-px h-6 bg-gray-300"></div>
                        </div>
                      ))}
                      <Layout className="h-4 w-4 text-blue-600 mr-3" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{layout.name}</span>
                        <Badge variant="outline" className="text-xs">Level {layout.level}</Badge>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{layout.description}</div>
                      <div className="text-xs text-gray-400 font-mono mt-1">{layout.path}</div>
                    </div>
                  </div>
                  {index < layoutHierarchy.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-gray-400 ml-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* レイアウト機能のデモ */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              レイアウト機能のデモ
            </CardTitle>
            <CardDescription>
              ネストされたレイアウトで実現される機能
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">共通要素の継承</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    ヘッダーナビゲーション（継承）
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    サイドバーメニュー（継承）
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    ページ固有コンテンツ（個別）
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">パフォーマンス最適化</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    レイアウトコンポーネントの再利用
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    部分的な再レンダリング
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    状態の保持
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* パフォーマンスメトリクス */}
      <section>
        <Card data-testid="performance-metrics">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              パフォーマンスメトリクス
            </CardTitle>
            <CardDescription>
              ネストされたレイアウトページのリアルタイムパフォーマンス測定結果
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedPerformanceDisplay />
            
            <div data-testid="render-time" className="flex items-center gap-2 text-sm mt-6 pt-6 border-t">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>レンダリング時間: {renderTime.toFixed(2)} ms</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 機能説明セクション */}
      <SegmentFeatureInfo segmentType="routing" subType="nested" />

      {/* コード表示ボタン */}
      <section>
        <Button className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          コードを表示
        </Button>
      </section>
    </div>
  );
}