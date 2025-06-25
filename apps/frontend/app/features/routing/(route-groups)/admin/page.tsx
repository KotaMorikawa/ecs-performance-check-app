'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnhancedPerformanceDisplay } from '@/components/enhanced-performance-display';
import { CodeDisplay } from '@/components/code-display';
import { Shield, Settings, Users, BarChart3, Activity, Clock, AlertTriangle } from 'lucide-react';

export default function AdminPage() {
  const [renderTime, setRenderTime] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const startTime = performance.now();
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
  }, []);

  const handleAuth = () => {
    setIsAuthenticated(!isAuthenticated);
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="p-4 bg-red-100 rounded-full w-20 h-20 mx-auto mb-6">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">管理エリア</h1>
          <p className="text-gray-600 mb-6">
            このエリアにアクセスするには認証が必要です
          </p>
          <Button onClick={handleAuth} className="flex items-center gap-2 mx-auto">
            <Shield className="h-4 w-4" />
            管理者として認証 (デモ)
          </Button>
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-yellow-800">
              <strong>Route Groups Demo:</strong> このページは実際には認証を実装していません。
              デモ用の表示です。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Area</h1>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <Badge variant="outline">Route Group</Badge>
              <Badge variant="destructive">Admin Access</Badge>
            </div>
          </div>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          ルートグループ <code className="bg-gray-100 px-2 py-1 rounded text-sm">(route-groups)</code> 内の
          管理エリア。URLパスは <code className="bg-gray-100 px-2 py-1 rounded text-sm">/features/routing/admin</code> になります。
        </p>
        <Button 
          onClick={handleAuth} 
          variant="outline" 
          size="sm" 
          className="mt-4"
        >
          ログアウト (デモ)
        </Button>
      </header>

      {/* 管理ダッシュボード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">月間訪問者</p>
                <p className="text-2xl font-bold text-gray-900">45,678</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">アクティブセッション</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">システム状態</p>
                <p className="text-2xl font-bold text-green-600">正常</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 管理機能 */}
      <Card>
        <CardHeader>
          <CardTitle>管理機能</CardTitle>
          <CardDescription>
            システム管理者専用の機能とツール
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-red-50 rounded-lg">
              <Users className="h-12 w-12 text-red-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">ユーザー管理</h3>
              <p className="text-sm text-gray-600 mb-4">
                ユーザーアカウントの作成・編集・削除
              </p>
              <Button size="sm" variant="outline">
                管理画面へ
              </Button>
            </div>
            
            <div className="text-center p-6 bg-orange-50 rounded-lg">
              <Settings className="h-12 w-12 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">システム設定</h3>
              <p className="text-sm text-gray-600 mb-4">
                アプリケーション設定の管理
              </p>
              <Button size="sm" variant="outline">
                設定画面へ
              </Button>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">分析・レポート</h3>
              <p className="text-sm text-gray-600 mb-4">
                使用状況の分析とレポート生成
              </p>
              <Button size="sm" variant="outline">
                レポート画面へ
              </Button>
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
            Route Groups Admin Pageのリアルタイムパフォーマンス測定結果
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
        title="Route Groups (Admin) ソースコード"
        description="ルートグループ内の管理ページの実装"
        files={[
          {
            filename: "page.tsx",
            language: "tsx",
            description: "Route Groups内の管理ページ",
            content: `'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Settings, Users, BarChart3, AlertTriangle } from 'lucide-react';

export default function AdminPage() {
  const [renderTime, setRenderTime] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const startTime = performance.now();
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
  }, []);

  const handleAuth = () => {
    setIsAuthenticated(!isAuthenticated);
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="p-4 bg-red-100 rounded-full w-20 h-20 mx-auto mb-6">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">管理エリア</h1>
          <p className="text-gray-600 mb-6">
            このエリアにアクセスするには認証が必要です
          </p>
          <Button onClick={handleAuth} className="flex items-center gap-2 mx-auto">
            <Shield className="h-4 w-4" />
            管理者として認証 (デモ)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 管理ダッシュボード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}`
          }
        ]}
      />
    </div>
  );
}