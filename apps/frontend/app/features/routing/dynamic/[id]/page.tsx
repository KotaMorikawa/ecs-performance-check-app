'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SegmentFeatureInfo } from '@/components/features/segment-feature-info';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedPerformanceDisplay } from '@/components/enhanced-performance-display';
import { CodeDisplay } from '@/components/code-display';
import { Activity, Clock, Hash, Database, RefreshCw } from 'lucide-react';

interface DynamicData {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  metadata: {
    type: string;
    category: string;
    tags: string[];
  };
}

export default function DynamicRoutingPage() {
  const params = useParams();
  const [renderTime, setRenderTime] = useState<number>(0);
  const [dynamicData, setDynamicData] = useState<DynamicData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const startTime = performance.now();
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
  }, []);

  // 動的データの模擬読み込み
  useEffect(() => {
    const loadDynamicData = async () => {
      setIsLoading(true);
      
      // 実際のAPIコールの代わりに、2秒の遅延をシミュレート
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockData: DynamicData = {
        id: params.id as string,
        title: `動的コンテンツ: ${params.id}`,
        content: `これは ID "${params.id}" に対応する動的に生成されたコンテンツです。実際のアプリケーションでは、この ID を使用してデータベースやAPIからデータを取得します。`,
        timestamp: new Date().toISOString(),
        metadata: {
          type: 'dynamic-content',
          category: Array.from(params.id as string)[0]?.toUpperCase() + '系',
          tags: ['dynamic', 'routing', 'nextjs', 'demo']
        }
      };
      
      setDynamicData(mockData);
      setIsLoading(false);
    };

    if (params.id) {
      loadDynamicData();
    }
  }, [params.id]);

  const handleRefreshData = () => {
    setDynamicData(null);
    setIsLoading(true);
    
    // データを再読み込み
    setTimeout(() => {
      if (params.id) {
        const refreshedData: DynamicData = {
          id: params.id as string,
          title: `更新された動的コンテンツ: ${params.id}`,
          content: `これは更新された ID "${params.id}" のコンテンツです。タイムスタンプ: ${new Date().toLocaleString()}`,
          timestamp: new Date().toISOString(),
          metadata: {
            type: 'refreshed-content',
            category: Array.from(params.id as string)[0]?.toUpperCase() + '系',
            tags: ['dynamic', 'routing', 'nextjs', 'refreshed']
          }
        };
        setDynamicData(refreshedData);
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Dynamic Routing
        </h1>
        <p className="text-lg text-gray-600">
          URLパラメータに基づいて動的にページを生成するNext.js 15.3.4の動的ルーティング機能のデモ
        </p>
      </header>

      {/* パラメータ情報 */}
      <section className="mb-8">
        <Card data-testid="parameter-info">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              パラメータ情報
            </CardTitle>
            <CardDescription>
              現在のURLパラメータと動的ルーティングの状態
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">ID パラメータ</div>
                <div className="text-2xl font-bold text-blue-600">{params.id}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">ルートパターン</div>
                <div className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
                  /features/routing/dynamic/[id]
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 動的データ */}
      <section className="mb-8">
        <Card data-testid="dynamic-data">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              動的データ
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefreshData}
                disabled={isLoading}
                className="ml-auto"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                更新
              </Button>
            </CardTitle>
            <CardDescription>
              パラメータに基づいて読み込まれる動的コンテンツ
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                データを読み込み中...
              </div>
            ) : dynamicData ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{dynamicData.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{dynamicData.content}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Badge variant="secondary">{dynamicData.metadata.category}</Badge>
                  {dynamicData.metadata.tags.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
                
                <div className="text-xs text-gray-500 pt-2">
                  最終更新: {new Date(dynamicData.timestamp).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                データの読み込みに失敗しました
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* パフォーマンスメトリクス */}
      <section className="mb-8">
        <Card data-testid="performance-metrics">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              パフォーマンスメトリクス
            </CardTitle>
            <CardDescription>
              動的ルーティングページのリアルタイムパフォーマンス測定結果
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
      <SegmentFeatureInfo segmentType="routing" subType="dynamic" />

      {/* コード表示セクション */}
      <section className="mb-8">
        <CodeDisplay
          title="Dynamic Routing ソースコード"
          description="URLパラメータを使用した動的ページ生成機能の実装"
          files={[
            {
              filename: "page.tsx",
              language: "tsx",
              description: "動的ルーティングページコンポーネント",
              content: `'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SegmentFeatureInfo } from '@/components/features/segment-feature-info';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedPerformanceDisplay } from '@/components/enhanced-performance-display';
import { Activity, Clock, Hash, Database, RefreshCw } from 'lucide-react';

interface DynamicData {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  metadata: {
    type: string;
    category: string;
    tags: string[];
  };
}

export default function DynamicRoutingPage() {
  const params = useParams();
  const [renderTime, setRenderTime] = useState<number>(0);
  const [dynamicData, setDynamicData] = useState<DynamicData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const startTime = performance.now();
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
  }, []);

  // 動的データの模擬読み込み
  useEffect(() => {
    const loadDynamicData = async () => {
      setIsLoading(true);
      
      // 実際のAPIコールの代わりに、2秒の遅延をシミュレート
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockData: DynamicData = {
        id: params.id as string,
        title: \`動的コンテンツ: \${params.id}\`,
        content: \`これは ID "\${params.id}" に対応する動的に生成されたコンテンツです。実際のアプリケーションでは、この ID を使用してデータベースやAPIからデータを取得します。\`,
        timestamp: new Date().toISOString(),
        metadata: {
          type: 'dynamic-content',
          category: Array.from(params.id as string)[0]?.toUpperCase() + '系',
          tags: ['dynamic', 'routing', 'nextjs', 'demo']
        }
      };
      
      setDynamicData(mockData);
      setIsLoading(false);
    };

    if (params.id) {
      loadDynamicData();
    }
  }, [params.id]);

  return (
    <div className="min-h-screen bg-white p-8">
      {/* パラメータ情報 */}
      <section className="mb-8">
        <Card data-testid="parameter-info">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              パラメータ情報
            </CardTitle>
            <CardDescription>
              現在のURLパラメータと動的ルーティングの状態
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">ID パラメータ</div>
                <div className="text-2xl font-bold text-blue-600">{params.id}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">ルートパターン</div>
                <div className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
                  /features/routing/dynamic/[id]
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}`
            },
            {
              filename: "generateStaticParams.ts",
              language: "typescript",
              description: "静的パラメータ生成（ビルド時）",
              content: `export async function generateStaticParams() {
  // ビルド時に事前生成するパラメータを指定
  return [
    { id: 'sample-1' },
    { id: 'sample-2' },
    { id: 'sample-3' },
    { id: 'demo' },
    { id: 'test' },
  ];
}

// TypeScript型定義
interface Params {
  id: string;
}

export type { Params };`
            },
            {
              filename: "layout.tsx", 
              language: "tsx",
              description: "動的ルーティング用レイアウト",
              content: `import type { Metadata } from 'next';

type Props = {
  params: { id: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: \`Dynamic Route: \${params.id} - ECS Performance Check\`,
    description: \`動的ルーティングのデモページ ID: \${params.id}\`,
  };
}

export default function DynamicLayout({
  children,
  params,
}: Props) {
  return (
    <div className="dynamic-route-layout">
      <div className="mb-4 text-sm text-gray-500">
        現在のID: {params.id}
      </div>
      {children}
    </div>
  );
}`
            }
          ]}
        />
      </section>
    </div>
  );
}