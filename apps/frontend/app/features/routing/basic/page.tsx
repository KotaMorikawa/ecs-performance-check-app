'use client';

import { useEffect, useState } from 'react';
import { SegmentFeatureInfo } from '@/components/features/segment-feature-info';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Eye, Clock } from 'lucide-react';

export default function BasicRoutingPage() {
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
  }, []);


  return (
    <div className="min-h-screen bg-white p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Basic App Router
        </h1>
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
            <CardDescription>
              リアルタイムのCore Web Vitals測定結果
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <Badge variant="outline" className="mb-2 w-full justify-center">
                  <Zap className="h-3 w-3 mr-1" />
                  LCP
                </Badge>
                <div className="text-sm text-muted-foreground">測定中...</div>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="mb-2 w-full justify-center">
                  <Eye className="h-3 w-3 mr-1" />
                  FID
                </Badge>
                <div className="text-sm text-muted-foreground">測定中...</div>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="mb-2 w-full justify-center">
                  <Activity className="h-3 w-3 mr-1" />
                  CLS
                </Badge>
                <div className="text-sm text-muted-foreground">測定中...</div>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="mb-2 w-full justify-center">
                  <Clock className="h-3 w-3 mr-1" />
                  INP
                </Badge>
                <div className="text-sm text-muted-foreground">測定中...</div>
              </div>
            </div>
            
            <div data-testid="render-time" className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>レンダリング時間: {renderTime.toFixed(2)} ms</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 機能説明セクション */}
      <SegmentFeatureInfo segmentType="routing" subType="basic" />

      {/* コード表示ボタン */}
      <section className="mb-8">
        <Button className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          コードを表示
        </Button>
      </section>
    </div>
  );
}