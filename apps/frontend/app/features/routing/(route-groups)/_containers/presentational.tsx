import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedPerformanceDisplay } from '@/components/enhanced-performance-display';
import { CodeDisplay } from '@/components/code-display';
import { Users, Globe, Activity, Clock } from 'lucide-react';

interface PublicPresentationalProps {
  renderTime: number;
}

export function PublicPresentational({ renderTime }: PublicPresentationalProps) {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <Users className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Public Area</h1>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <Badge variant="outline">Route Group</Badge>
              <Badge variant="secondary">Public Access</Badge>
            </div>
          </div>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          ルートグループ <code className="bg-gray-100 px-2 py-1 rounded text-sm">(route-groups)</code> 内の
          パブリックエリア。URLパスは <code className="bg-gray-100 px-2 py-1 rounded text-sm">/features/routing/public</code> になります。
        </p>
      </header>

      {/* 現在のルート情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            ルート情報
          </CardTitle>
          <CardDescription>
            Route Groupsによるファイル構成とURL構造の関係
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">ファイル構成</h4>
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                <div className="text-gray-600">📁 app/features/routing/</div>
                <div className="text-blue-600 ml-4">📁 (route-groups)/</div>
                <div className="text-green-600 ml-8">📁 public/</div>
                <div className="text-gray-800 ml-12">📄 page.tsx</div>
                <div className="text-purple-600 ml-8">📁 admin/</div>
                <div className="text-gray-800 ml-12">📄 page.tsx</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">実際のURL</h4>
              <div className="space-y-2">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-medium text-green-800">現在のページ</div>
                  <div className="text-green-600 font-mono">/features/routing/public</div>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="text-sm font-medium text-purple-800">管理エリア</div>
                  <div className="text-purple-600 font-mono">/features/routing/admin</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 機能デモ */}
      <Card>
        <CardHeader>
          <CardTitle>Public Area 機能</CardTitle>
          <CardDescription>
            一般ユーザー向けの機能とコンテンツ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">ユーザー登録</h3>
              <p className="text-sm text-gray-600">
                新規ユーザーのアカウント作成機能
              </p>
            </div>
            
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <Globe className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">コンテンツ閲覧</h3>
              <p className="text-sm text-gray-600">
                公開されているコンテンツの閲覧
              </p>
            </div>
            
            <div className="text-center p-6 bg-orange-50 rounded-lg">
              <Activity className="h-12 w-12 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">フィードバック</h3>
              <p className="text-sm text-gray-600">
                ユーザーからのフィードバック送信
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* パフォーマンスメトリクス */}
      <Card data-testid="performance-metrics">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            パフォーマンスメトリクス
          </CardTitle>
          <CardDescription>
            Route Groups Public Pageのリアルタイムパフォーマンス測定結果
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

      {/* コード表示セクション */}
      <CodeDisplay
        title="Route Groups (Public) ソースコード"
        description="ルートグループ内のパブリックページの実装"
        files={[
          {
            filename: "_containers/public.container.tsx",
            language: "tsx",
            description: "クライアントロジック（パフォーマンス測定）",
            content: `'use client';

import { useEffect, useState } from 'react';
import { PublicPresentational } from '../_components/public.presentational';

export function PublicContainer() {
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
  }, []);

  return <PublicPresentational renderTime={renderTime} />;
}`
          },
          {
            filename: "_components/public.presentational.tsx",
            language: "tsx",
            description: "プレゼンテーションレイヤー（UI表示）",
            content: `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// ... UI コンポーネント`
          },
          {
            filename: "page.tsx",
            language: "tsx",
            description: "メインページコンポーネント",
            content: `import { PublicContainer } from '../_containers/public.container';

export default function PublicPage() {
  return <PublicContainer />;
}`
          },
          {
            filename: "layout.tsx",
            language: "tsx", 
            description: "Route Groups共通レイアウト",
            content: `import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface RouteGroupLayoutProps {
  children: ReactNode;
}

export default function RouteGroupLayout({ children }: RouteGroupLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h1 className="text-xl font-semibold">Route Groups Demo</h1>
            <Badge variant="outline">(route-groups)</Badge>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {children}
        </div>
      </main>
    </div>
  );
}`
          }
        ]}
      />
    </div>
  );
}