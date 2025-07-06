"use client";

import { AlertCircle, ArrowRight, Clock, Link2, Navigation, RefreshCw, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CodeDisplay } from "@/components/code-display";
import { EnhancedPerformanceDisplay } from "@/components/enhanced-performance-display";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CacheLayerMetrics } from "../../_shared/types";
// Note: cacheTestApi, formatCacheSize, updateLayerMetrics are not used in this component
// They would be used in a real implementation for data fetching and metrics calculation

// Note: RouterCachePresentationalProps interface removed as props are not used in this demo

export function RouterCachePresentational() {
  // Note: In a real implementation, this component would receive props for initialData, initialMetadata, initialMetrics, error
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<
    { path: string; type: "soft" | "hard"; time: string }[]
  >([]);
  const [layerMetrics, setLayerMetrics] = useState<CacheLayerMetrics>({
    strategy: "router-cache",
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRate: 0,
    avgResponseTime: 0,
    cacheSize: 0,
    lastRevalidated: undefined,
    ttl: 30,
  });

  // ナビゲーションのシミュレーション
  const simulateNavigation = (path: string, type: "soft" | "hard") => {
    setIsNavigating(true);
    const startTime = performance.now();

    // ナビゲーション履歴に追加
    setNavigationHistory((prev) => [
      {
        path,
        type,
        time: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 9),
    ]);

    // Router Cacheのヒット/ミスをシミュレート
    const isCacheHit = type === "soft" && Math.random() > 0.2; // ソフトナビゲーションは80%ヒット

    setTimeout(
      () => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        // メトリクス更新
        setLayerMetrics((prev) => ({
          ...prev,
          hits: prev.hits + (isCacheHit ? 1 : 0),
          misses: prev.misses + (isCacheHit ? 0 : 1),
          totalRequests: prev.totalRequests + 1,
          hitRate: ((prev.hits + (isCacheHit ? 1 : 0)) / (prev.totalRequests + 1)) * 100,
          avgResponseTime:
            (prev.avgResponseTime * prev.totalRequests + responseTime) / (prev.totalRequests + 1),
        }));

        setIsNavigating(false);
      },
      isCacheHit ? 50 : 300
    );
  };

  // プリフェッチのデモ
  const handlePrefetch = () => {
    router.prefetch("/features/caching/data-cache");
    router.prefetch("/features/caching/full-route-cache");
  };

  const routerCacheCode = `// Router Cache実装例
// クライアントサイドナビゲーションのキャッシュ

// 1. Link コンポーネントによる自動プリフェッチ
import Link from 'next/link';

export function Navigation() {
  return (
    <nav>
      <Link href="/about" prefetch={true}>
        About (プリフェッチ有効)
      </Link>
      <Link href="/contact" prefetch={false}>
        Contact (プリフェッチ無効)
      </Link>
    </nav>
  );
}

// 2. プログラマティックなプリフェッチ
import { useRouter } from 'next/navigation';

export function PrefetchDemo() {
  const router = useRouter();
  
  useEffect(() => {
    // ビューポートに入ったらプリフェッチ
    router.prefetch('/dashboard');
  }, []);
  
  return <button onClick={() => router.push('/dashboard')}>
    Go to Dashboard
  </button>;
}

// 3. ソフトナビゲーション vs ハードナビゲーション
// ソフトナビゲーション（Router Cache使用）
router.push('/products'); // キャッシュから高速読み込み

// ハードナビゲーション（Router Cacheバイパス）
router.refresh(); // ページ全体を再取得

// 4. Router Cacheの自動無効化
// - 30秒後に自動的に無効化
// - Server Actionの実行後
// - cookies.set/deleteの呼び出し後`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Router Cache Demo</h1>
          <p className="text-muted-foreground mt-2">
            クライアントサイドナビゲーションのキャッシュ機能を実演
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrefetch}>
            <Link2 className="h-4 w-4 mr-2" />
            Prefetch Pages
          </Button>
          <Button variant="outline" onClick={() => setShowCode(!showCode)}>
            {showCode ? "Hide Code" : "Show Code"}
          </Button>
        </div>
      </div>

      {showCode && (
        <CodeDisplay
          title="Router Cache Implementation"
          description="クライアントサイドルーティングキャッシュの実装例"
          files={[
            {
              filename: "router-cache.tsx",
              language: "typescript",
              content: routerCacheCode,
              description: "Router Cacheの様々な使用パターン",
            },
          ]}
        />
      )}

      <Tabs defaultValue="demo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="demo">Demo</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="history">Navigation History</TabsTrigger>
          <TabsTrigger value="explanation">How It Works</TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-4">
          {/* ナビゲーションデモ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Navigation Simulation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-base">Soft Navigation</CardTitle>
                    <p className="text-sm text-muted-foreground">Router Cacheを使用した高速遷移</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => simulateNavigation("/about", "soft")}
                      disabled={isNavigating}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Navigate to About
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => simulateNavigation("/products", "soft")}
                      disabled={isNavigating}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Navigate to Products
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-destructive/20">
                  <CardHeader>
                    <CardTitle className="text-base">Hard Navigation</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Router Cacheをバイパスして再取得
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => simulateNavigation("/about", "hard")}
                      disabled={isNavigating}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Hard Refresh About
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => simulateNavigation("/products", "hard")}
                      disabled={isNavigating}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Hard Refresh Products
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {isNavigating && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>ナビゲーション中...</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* リンクデモ */}
          <Card>
            <CardHeader>
              <CardTitle>Prefetch Demo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                以下のリンクはホバー時に自動的にプリフェッチされます：
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/features/caching/data-cache"
                  className="flex items-center gap-2 text-primary hover:underline"
                  prefetch={true}
                >
                  <Link2 className="h-4 w-4" />
                  Data Cache (Auto Prefetch)
                </Link>
                <Link
                  href="/features/caching/full-route-cache"
                  className="flex items-center gap-2 text-primary hover:underline"
                  prefetch={true}
                >
                  <Link2 className="h-4 w-4" />
                  Full Route Cache (Auto Prefetch)
                </Link>
                <Link
                  href="/features/caching/on-demand-revalidation"
                  className="flex items-center gap-2 text-muted-foreground hover:underline"
                  prefetch={false}
                >
                  <Link2 className="h-4 w-4" />
                  On-demand Revalidation (No Prefetch)
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Router Cache Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ヒット率 */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Cache Hit Rate</span>
                  <span className="text-sm text-muted-foreground">
                    {layerMetrics.hitRate.toFixed(1)}%
                  </span>
                </div>
                <Progress value={layerMetrics.hitRate} className="h-2" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Hits: {layerMetrics.hits}</span>
                  <span>Misses: {layerMetrics.misses}</span>
                </div>
              </div>

              {/* メトリクス詳細 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Avg Navigation Time</p>
                  <p className="text-2xl font-bold">{layerMetrics.avgResponseTime.toFixed(0)}ms</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Navigations</p>
                  <p className="text-2xl font-bold">{layerMetrics.totalRequests}</p>
                </div>
              </div>

              {/* パフォーマンス表示 */}
              <EnhancedPerformanceDisplay
                metrics={{
                  network: {
                    totalRequests: layerMetrics.totalRequests,
                    avgResponseTime: layerMetrics.avgResponseTime,
                    cacheHitRate: layerMetrics.hitRate,
                    totalDataTransferred: layerMetrics.cacheSize,
                    errors: 0,
                  },
                  render: {
                    serverRenderTime: 0,
                    clientRenderTime: layerMetrics.avgResponseTime,
                    totalRenderTime: layerMetrics.avgResponseTime,
                  },
                  cache: {
                    nextjsCacheHits: layerMetrics.hits,
                    nextjsCacheMisses: layerMetrics.misses,
                    browserCacheHits: 0,
                    browserCacheMisses: 0,
                    cacheEfficiency: layerMetrics.hitRate,
                  },
                  lastUpdated: new Date().toISOString(),
                }}
                title="Router Cache Performance"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Navigation History</CardTitle>
            </CardHeader>
            <CardContent>
              {navigationHistory.length > 0 ? (
                <div className="space-y-2">
                  {navigationHistory.map((nav, _index) => (
                    <div
                      key={`${nav.path}-${nav.time}`}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        {nav.type === "soft" ? (
                          <Zap className="h-5 w-5 text-green-600" />
                        ) : (
                          <RefreshCw className="h-5 w-5 text-orange-600" />
                        )}
                        <div>
                          <p className="font-medium">{nav.path}</p>
                          <p className="text-xs text-muted-foreground">{nav.time}</p>
                        </div>
                      </div>
                      <Badge variant={nav.type === "soft" ? "success" : "secondary"}>
                        {nav.type === "soft" ? "Cached" : "Fresh"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No navigation history yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="explanation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How Router Cache Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  1. Client-side Navigation Cache
                </h4>
                <p className="text-sm text-muted-foreground">
                  Router Cacheは、クライアントサイドでのナビゲーション時に、
                  訪問済みのルートセグメントをメモリに保存します。
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  2. Automatic Prefetching
                </h4>
                <p className="text-sm text-muted-foreground">
                  {"<Link>"}コンポーネントが表示されると、Next.jsは自動的に
                  リンク先のページをプリフェッチし、Router Cacheに保存します。
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  3. Cache Duration
                </h4>
                <p className="text-sm text-muted-foreground">
                  Router Cacheは30秒間有効です。その後、次回のナビゲーション時に
                  サーバーから最新のデータを取得します。
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4. Performance Benefits</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-green-600">✓ Instant Navigation</p>
                    <p className="text-muted-foreground">キャッシュからの即時表示</p>
                  </div>
                  <div>
                    <p className="font-medium text-green-600">✓ Reduced Bandwidth</p>
                    <p className="text-muted-foreground">ネットワーク通信の削減</p>
                  </div>
                  <div>
                    <p className="font-medium text-green-600">✓ Better UX</p>
                    <p className="text-muted-foreground">スムーズな画面遷移</p>
                  </div>
                  <div>
                    <p className="font-medium text-green-600">✓ Offline Support</p>
                    <p className="text-muted-foreground">一時的なオフライン対応</p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pro Tip:</strong> prefetch=falseを使用して、
                  重要度の低いページの自動プリフェッチを無効にすることで、 帯域幅を節約できます。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
