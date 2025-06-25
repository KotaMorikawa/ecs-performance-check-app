'use client';

import { useEffect, useState } from 'react';
import { SegmentFeatureInfo } from '@/components/features/segment-feature-info';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedPerformanceDisplay } from '@/components/enhanced-performance-display';
import { Activity, Eye, Clock, RefreshCw, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export default function LoadingErrorPage() {
  const [renderTime, setRenderTime] = useState<number>(0);
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const startTime = performance.now();
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
  }, []);

  const simulateDataLoading = async () => {
    setLoadingState('loading');
    setErrorMessage('');
    
    try {
      // 2秒の読み込みシミュレーション
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLoadingState('success');
    } catch {
      setLoadingState('error');
      setErrorMessage('データの読み込みに失敗しました');
    }
  };

  const simulateError = () => {
    setLoadingState('error');
    setErrorMessage('意図的に発生させたエラーです。このエラーはデモ用のものです。');
  };

  const resetState = () => {
    setLoadingState('idle');
    setErrorMessage('');
  };

  const throwError = () => {
    throw new Error('このエラーはエラーバウンダリのテスト用です');
  };

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
                      onClick={simulateDataLoading}
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
                    <Button onClick={resetState} variant="outline" size="sm">
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
                      onClick={simulateError}
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      エラーを発生させる
                    </Button>
                    <Button 
                      onClick={throwError}
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