import { SegmentFeatureInfo } from '@/components/features/segment-feature-info';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedPerformanceDisplay } from '@/components/enhanced-performance-display';
import { CodeDisplay } from '@/components/code-display';
import { Activity, Clock, RefreshCw, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface LoadingErrorPresentationalProps {
  renderTime: number;
  loadingState: LoadingState;
  errorMessage: string;
  onSimulateDataLoading: () => void;
  onSimulateError: () => void;
  onResetState: () => void;
  onThrowError: () => void;
}

export function LoadingErrorPresentational({
  renderTime,
  loadingState,
  errorMessage,
  onSimulateDataLoading,
  onSimulateError,
  onResetState,
  onThrowError
}: LoadingErrorPresentationalProps) {
  return (
    <div className="min-h-screen bg-white p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Loading & Error Handling
        </h1>
        <p className="text-lg text-gray-600">
          Next.js 15.3.4のローディングUIとエラーバウンダリ機能のデモ
        </p>
      </header>

      {/* ローディング状態のデモ */}
      <section className="mb-8">
        <Card data-testid="loading-demo">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              ローディング状態のデモ
            </CardTitle>
            <CardDescription>
              loading.tsxによる自動ローディングUIとプログラムによるローディング状態管理
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">手動ローディング制御</h4>
                  <div className="flex flex-col space-y-3">
                    <Button 
                      onClick={onSimulateDataLoading}
                      disabled={loadingState === 'loading'}
                      className="flex items-center gap-2"
                    >
                      {loadingState === 'loading' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          読み込み中...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          データを読み込む
                        </>
                      )}
                    </Button>
                    <Button onClick={onResetState} variant="outline" size="sm">
                      リセット
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">現在の状態</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    {loadingState === 'idle' && (
                      <div className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                        待機中
                      </div>
                    )}
                    {loadingState === 'loading' && (
                      <div className="flex items-center text-blue-600">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        読み込み中...
                      </div>
                    )}
                    {loadingState === 'success' && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        データ読み込み完了
                      </div>
                    )}
                    {loadingState === 'error' && (
                      <div className="flex items-center text-red-600">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        エラーが発生しました
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">自動ローディングUI</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-700">
                    <strong>loading.tsx</strong> - このディレクトリには loading.tsx ファイルが配置されており、
                    ページナビゲーション時に自動的にローディングUIが表示されます。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* エラーハンドリングのデモ */}
      <section className="mb-8">
        <Card data-testid="error-demo">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              エラーハンドリングのデモ
            </CardTitle>
            <CardDescription>
              error.tsxによる自動エラーバウンダリとプログラムによるエラー状態管理
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">エラー発生テスト</h4>
                  <div className="flex flex-col space-y-3">
                    <Button 
                      onClick={onSimulateError}
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      エラーを発生させる
                    </Button>
                    <Button 
                      onClick={onThrowError}
                      variant="outline"
                      className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      エラーバウンダリをテスト
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">エラー状態</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    {errorMessage ? (
                      <div className="flex items-start text-red-600">
                        <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">{errorMessage}</div>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                        エラーなし
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">自動エラーバウンダリ</h4>
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-700">
                    <strong>error.tsx</strong> - このディレクトリには error.tsx ファイルが配置されており、
                    予期しないエラーが発生した際に自動的にエラーUIが表示されます。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 実装パターン */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>実装パターン</CardTitle>
            <CardDescription>
              Next.js 15.3.4でのローディング・エラーハンドリングの実装方法
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Badge className="w-fit">loading.tsx</Badge>
                <h4 className="font-medium">自動ローディングUI</h4>
                <p className="text-sm text-gray-600">
                  ページセグメントに loading.tsx を配置することで、
                  そのセグメント以下のページ読み込み時に自動表示
                </p>
              </div>
              
              <div className="space-y-3">
                <Badge className="w-fit">error.tsx</Badge>
                <h4 className="font-medium">自動エラーバウンダリ</h4>
                <p className="text-sm text-gray-600">
                  ページセグメントに error.tsx を配置することで、
                  そのセグメント以下でのエラーを自動キャッチ
                </p>
              </div>
              
              <div className="space-y-3">
                <Badge className="w-fit">useState</Badge>
                <h4 className="font-medium">プログラム制御</h4>
                <p className="text-sm text-gray-600">
                  React Stateを使用して、コンポーネント内で
                  ローディング・エラー状態を詳細に制御
                </p>
              </div>
            </div>
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
              ローディング・エラーハンドリングページのリアルタイムパフォーマンス測定結果
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
      <SegmentFeatureInfo segmentType="routing" subType="loading" />

      {/* コード表示セクション */}
      <section className="mb-8">
        <CodeDisplay
          title="Loading & Error Handling ソースコード"
          description="Next.js 15.3.4のローディングUIとエラーバウンダリ機能の実装"
          files={[
            {
              filename: "_containers/loading-error.container.tsx",
              language: "tsx",
              description: "クライアントロジック（状態管理）",
              content: `'use client';

import { useEffect, useState } from 'react';
import { LoadingErrorPresentational } from '../_components/loading-error.presentational';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export function LoadingErrorContainer() {
  const [renderTime, setRenderTime] = useState<number>(0);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 状態管理ロジック...
}`
            },
            {
              filename: "_components/loading-error.presentational.tsx",
              language: "tsx", 
              description: "プレゼンテーションレイヤー（UI表示）",
              content: `import { SegmentFeatureInfo } from '@/components/features/segment-feature-info';
import { Button } from '@/components/ui/button';
// ... UI コンポーネント`
            },
            {
              filename: "loading.tsx",
              language: "tsx",
              description: "自動ローディングUI",
              content: `export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  );
}`
            },
            {
              filename: "error.tsx",
              language: "tsx",
              description: "自動エラーバウンダリ",
              content: `'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">何かが間違っています!</h2>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => reset()}
      >
        再試行
      </button>
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