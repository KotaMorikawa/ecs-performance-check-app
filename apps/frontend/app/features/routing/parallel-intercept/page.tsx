'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnhancedPerformanceDisplay } from '@/components/enhanced-performance-display';
import { CodeDisplay } from '@/components/code-display';
import { 
  Split, 
  Layers, 
  Activity, 
  Clock, 
  ArrowDown, 
  ArrowRight,
  Eye,
  Shuffle,
  GitBranch
} from 'lucide-react';

export default function ParallelInterceptPage() {
  const [renderTime, setRenderTime] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [parallelContent, setParallelContent] = useState<'analytics' | 'team' | 'settings'>('analytics');

  useEffect(() => {
    const startTime = performance.now();
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
  }, []);

  return (
    <div className="min-h-screen bg-white p-8">
      <header className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-indigo-100 rounded-full">
            <Split className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Parallel & Intercepting Routes</h1>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline">App Router</Badge>
              <Badge>Advanced Features</Badge>
            </div>
          </div>
        </div>
        <p className="text-lg text-gray-600">
          Next.js 15.3.4の並列ルート（Parallel Routes）とインターセプトルート（Intercepting Routes）機能のデモ
        </p>
      </header>

      {/* 並列ルートのデモ */}
      <section className="mb-8">
        <Card data-testid="parallel-routes-demo">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              並列ルート（Parallel Routes）デモ
            </CardTitle>
            <CardDescription>
              複数のスロットを同時にレンダリングする並列ルート機能
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* スロット切り替えボタン */}
              <div className="flex space-x-2">
                <Button
                  variant={parallelContent === 'analytics' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setParallelContent('analytics')}
                >
                  Analytics
                </Button>
                <Button
                  variant={parallelContent === 'team' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setParallelContent('team')}
                >
                  Team
                </Button>
                <Button
                  variant={parallelContent === 'settings' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setParallelContent('settings')}
                >
                  Settings
                </Button>
              </div>

              {/* 並列コンテンツの表示 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* メインコンテンツ */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">メインコンテンツ (@children)</h4>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Default Slot</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      これは常に表示されるメインコンテンツです。並列ルートと組み合わせて使用されます。
                    </p>
                  </div>
                </div>

                {/* 並列スロット */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">並列スロット (@{parallelContent})</h4>
                  {parallelContent === 'analytics' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">Analytics Slot</span>
                      </div>
                      <div className="space-y-2 text-sm text-green-700">
                        <div>訪問者数: 1,234</div>
                        <div>ページビュー: 5,678</div>
                        <div>直帰率: 45%</div>
                      </div>
                    </div>
                  )}
                  {parallelContent === 'team' && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Split className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-purple-800">Team Slot</span>
                      </div>
                      <div className="space-y-2 text-sm text-purple-700">
                        <div>チームメンバー: 8人</div>
                        <div>アクティブユーザー: 5人</div>
                        <div>今日のタスク: 12個</div>
                      </div>
                    </div>
                  )}
                  {parallelContent === 'settings' && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shuffle className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-orange-800">Settings Slot</span>
                      </div>
                      <div className="space-y-2 text-sm text-orange-700">
                        <div>言語: 日本語</div>
                        <div>タイムゾーン: JST</div>
                        <div>通知: 有効</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* インターセプトルートのデモ */}
      <section className="mb-8">
        <Card data-testid="intercepting-routes-demo">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              インターセプトルート（Intercepting Routes）デモ
            </CardTitle>
            <CardDescription>
              特定のルートをインターセプトしてモーダルなどで表示する機能
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  画像をモーダルで表示
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => alert('通常のページ遷移をシミュレート')}
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  通常のページ遷移
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={() => alert('インターセプト無効化をシミュレート')}
                  className="flex items-center gap-2"
                >
                  <ArrowDown className="h-4 w-4" />
                  インターセプト無効
                </Button>
              </div>

              {/* インターセプトルートの説明 */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h5 className="font-medium text-indigo-900 mb-2">インターセプトルートの仕組み</h5>
                <div className="space-y-2 text-sm text-indigo-800">
                  <div>• (.) - 同じレベルのセグメントをインターセプト</div>
                  <div>• (..) - 1つ上のレベルのセグメントをインターセプト</div>
                  <div>• (..)(..) - 2つ上のレベルのセグメントをインターセプト</div>
                  <div>• (...) - ルートレベルのセグメントをインターセプト</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* モーダルのシミュレーション */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">インターセプトルートモーダル</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                ×
              </Button>
            </div>
            <div className="space-y-4">               
              <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">画像プレースホルダー</span>
              </div>
              <p className="text-sm text-gray-600">
                このモーダルはインターセプトルートによって表示されています。
                通常のページ遷移の代わりに、同じページ内でコンテンツを表示します。
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  閉じる
                </Button>
                <Button onClick={() => alert('詳細ページに遷移')}>
                  詳細を見る
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 実装のポイント */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>実現可能な機能</CardTitle>
            <CardDescription>
              並列ルートとインターセプトルートで実現できる高度な機能
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">並列ルート</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <ArrowRight className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>ダッシュボードの複数セクション同時表示</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>コンテンツの条件分岐表示</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>ローディング状態の独立管理</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>エラー処理の分離</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">インターセプトルート</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <ArrowRight className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>画像ギャラリーのモーダル表示</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>商品詳細のオーバーレイ</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>ログインフォームのポップアップ</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>ディープリンクとの共存</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 確認方法 */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>確認方法</CardTitle>
            <CardDescription>
              実装した機能を確認するための方法
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">並列ルート (@slot)</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• フォルダ名を @analytics, @team で作成</li>
                    <li>• layout.tsx で {'{children}'} と {'{analytics}'} を配置</li>
                    <li>• 各スロットで独立したローディング・エラー処理</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h5 className="font-medium text-green-900 mb-2">インターセプト (.) (..) (...)</h5>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• (.)photo フォルダでインターセプト</li>
                    <li>• モーダル表示とページ遷移の切り替え</li>
                    <li>• URLの共有可能性を保持</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* パフォーマンスメトリクス */}
      <Card data-testid="performance-metrics">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            パフォーマンスメトリクス
          </CardTitle>
          <CardDescription>
            Parallel & Intercepting Routesのリアルタイムパフォーマンス測定結果
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
        title="並列・インターセプトルート ソースコード"
        description="高度なルーティング機能の実装例"
        files={[
          {
            filename: "page.tsx",
            language: "tsx",
            description: "並列・インターセプトルートのデモページ",
            content: `'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Split, Eye, GitBranch, Activity } from 'lucide-react';

export default function ParallelInterceptPage() {
  const [parallelContent, setParallelContent] = useState<'analytics' | 'team' | 'settings'>('analytics');
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-8">
      {/* 並列ルートデモ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            並列ルート（Parallel Routes）デモ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button
              variant={parallelContent === 'analytics' ? 'default' : 'outline'}
              onClick={() => setParallelContent('analytics')}
            >
              Analytics
            </Button>
            <Button
              variant={parallelContent === 'team' ? 'default' : 'outline'}
              onClick={() => setParallelContent('team')}
            >
              Team
            </Button>
          </div>
          
          {/* 並列コンテンツの表示 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <span className="font-medium">メインコンテンツ (@children)</span>
              <p className="text-sm text-blue-700 mt-2">
                常に表示されるメインコンテンツ
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <span className="font-medium">並列スロット (@{parallelContent})</span>
              {parallelContent === 'analytics' && (
                <div className="text-sm text-green-700 mt-2">
                  <div>訪問者数: 1,234</div>
                  <div>ページビュー: 5,678</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* インターセプトルートデモ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            インターセプトルート（Intercepting Routes）デモ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            画像をモーダルで表示
          </Button>
          
          {/* モーダル */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">インターセプトルートモーダル</h3>
                <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-500">画像プレースホルダー</span>
                </div>
                <Button onClick={() => setShowModal(false)}>閉じる</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}`
          },
          {
            filename: "layout.tsx (並列ルート用)",
            language: "tsx",
            description: "並列ルート用のレイアウトファイル例",
            content: `interface LayoutProps {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
  settings: React.ReactNode;
}

export default function ParallelLayout({
  children,
  analytics,
  team,
  settings
}: LayoutProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* メインコンテンツ */}
      <div className="space-y-6">
        {children}
      </div>
      
      {/* 並列スロット */}
      <div className="space-y-6">
        {analytics}
        {team}
        {settings}
      </div>
    </div>
  );
}`
          },
          {
            filename: "(.)photo/page.tsx (インターセプト用)",
            language: "tsx",
            description: "インターセプトルート用のページファイル例",
            content: `'use client';

import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';

interface PhotoPageProps {
  params: { id: string };
}

export default function InterceptedPhotoPage({ params }: PhotoPageProps) {
  const router = useRouter();

  return (
    <Modal onClose={() => router.back()}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">写真 #{params.id}</h2>
        <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">写真 #{params.id}</span>
        </div>
        <p className="text-sm text-gray-600">
          このモーダルはインターセプトルートによって表示されています。
          URLは /photo/{params.id} ですが、モーダル形式で表示されます。
        </p>
      </div>
    </Modal>
  );
}`
          }
        ]}
      />
    </div>
  );
}