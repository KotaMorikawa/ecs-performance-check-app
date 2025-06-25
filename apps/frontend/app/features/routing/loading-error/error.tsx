'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // エラーログ（実際のアプリケーションではログサービスに送信）
    console.error('Error boundary caught an error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-lg border-red-200">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-red-700">エラーが発生しました</CardTitle>
              <CardDescription>
                ページの読み込み中に問題が発生しました。Next.js 15.3.4のエラーバウンダリが自動的にこの画面を表示しています。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-red-700 mb-2">エラー詳細:</h4>
                <p className="text-sm text-red-600 font-mono">{error.message}</p>
                {error.digest && (
                  <p className="text-xs text-red-500 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={reset} 
                  className="flex items-center gap-2 flex-1"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4" />
                  再試行
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="flex items-center gap-2 flex-1"
                >
                  <Home className="h-4 w-4" />
                  ホームに戻る
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 text-center pt-4 border-t">
                <p>このエラー画面は app/features/routing/loading-error/error.tsx で定義されています</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}