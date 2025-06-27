'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { EnhancedPerformanceDisplay } from '@/components/enhanced-performance-display';
import { CodeDisplay } from '@/components/code-display';
import { 
  Database, 
  RefreshCw, 
  Clock, 
  Server,
  Tag,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import type { 
  CacheTestData, 
  CacheApiResponse,
  CacheLayerMetrics,
  RevalidationOperation 
} from '../../_shared/types';
import { 
  cacheTestApi, 
  revalidationApi
} from '../../_shared/cache-api-client';
import { 
  formatCacheSize,
  updateLayerMetrics
} from '../../_shared/cache-metrics';

interface DataCachePresentationalProps {
  initialData: CacheTestData[];
  initialMetadata: CacheApiResponse<CacheTestData[]>['metadata'] | null;
  initialMetrics: CacheApiResponse<CacheTestData[]>['metrics'] | null;
  error: string | null;
}

export function DataCachePresentational({ 
  initialData, 
  initialMetadata,
  initialMetrics,
  error 
}: DataCachePresentationalProps) {
  const [data, setData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [layerMetrics, setLayerMetrics] = useState<CacheLayerMetrics>({
    strategy: 'data-cache',
    hits: initialMetadata?.cached ? 1 : 0,
    misses: initialMetadata?.cached ? 0 : 1,
    totalRequests: 1,
    hitRate: initialMetadata?.cached ? 100 : 0,
    avgResponseTime: initialMetrics?.fetchTime || 0,
    cacheSize: initialMetrics?.dataSize || 0,
    lastRevalidated: initialMetadata?.timestamp,
    ttl: initialMetadata?.ttl,
  });
  const [revalidations, setRevalidations] = useState<RevalidationOperation[]>([]);

  // データ再取得（キャッシュテスト用）
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const response = await cacheTestApi.getDataCacheDemo(['cache-demo', 'categories']);
      setData(response.data);
      
      // メトリクスを更新
      const updatedMetrics = updateLayerMetrics(layerMetrics, response);
      setLayerMetrics(updatedMetrics);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // タグベースのリバリデート
  const handleRevalidateTag = async (tag: string) => {
    const operation = await revalidationApi.revalidateTag(tag);
    setRevalidations([operation, ...revalidations]);
    
    if (operation.success) {
      // リバリデート後にデータを再取得
      setTimeout(() => refreshData(), 1000);
    }
  };

  const dataCacheCode = `// Data Cache実装例
// Next.js 15のfetch APIキャッシュ

// 1. 基本的なData Cache（永続キャッシュ）
async function getCachedData() {
  const response = await fetch('http://localhost:8000/api/categories', {
    next: {
      tags: ['categories'], // キャッシュタグ
    },
  });
  return response.json();
}

// 2. 時間ベースのリバリデート
async function getTimedData() {
  const response = await fetch('http://localhost:8000/api/posts', {
    next: {
      revalidate: 60, // 60秒でリバリデート
    },
  });
  return response.json();
}

// 3. オンデマンドリバリデート
import { revalidateTag } from 'next/cache';

async function handleUpdate() {
  // データ更新後
  await updateData();
  
  // タグベースでキャッシュ無効化
  revalidateTag('categories');
}

// 4. キャッシュ無効化（no-store）
async function getRealtimeData() {
  const response = await fetch('http://localhost:8000/api/realtime', {
    cache: 'no-store', // キャッシュしない
  });
  return response.json();
}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Cache Demo</h1>
          <p className="text-muted-foreground mt-2">
            Next.js fetch APIのキャッシュ機能を実演
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button variant="outline" onClick={() => setShowCode(!showCode)}>
            {showCode ? 'Hide Code' : 'Show Code'}
          </Button>
        </div>
      </div>

      {showCode && (
        <CodeDisplay
          title="Data Cache Implementation"
          description="Next.js fetch APIキャッシュの実装例"
          files={[
            {
              filename: 'data-cache.ts',
              language: 'typescript',
              content: dataCacheCode,
              description: 'Data Cacheの様々な使用パターン',
            },
          ]}
        />
      )}

      <Tabs defaultValue="demo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="demo">Demo</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="explanation">How It Works</TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-4">
          {/* キャッシュ状態表示 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Cache Status
                </span>
                <Badge variant={initialMetadata?.cached ? 'default' : 'secondary'}>
                  {initialMetadata?.cached ? 'HIT' : 'MISS'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Source</p>
                  <p className="font-medium flex items-center gap-1">
                    <Server className="h-4 w-4" />
                    {initialMetadata?.source || 'network'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cache Tags</p>
                  <div className="flex gap-1">
                    {initialMetadata?.tags?.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    )) || <span className="text-sm">No tags</span>}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">TTL</p>
                  <p className="font-medium flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {initialMetadata?.ttl ? `${initialMetadata.ttl}s` : 'Permanent'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cache Size</p>
                  <p className="font-medium">
                    {formatCacheSize(initialMetrics?.dataSize || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* データ表示 */}
          <Card>
            <CardHeader>
              <CardTitle>Cached Data</CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : data.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.slice(0, 6).map((item: CacheTestData) => (
                      <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{item.name}</CardTitle>
                            <Badge variant="secondary">{item.postCount || 0} posts</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* リバリデートアクション */}
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-3">Tag-based Revalidation</h4>
                    <div className="flex flex-wrap gap-2">
                      {['categories', 'cache-demo'].map(tag => (
                        <Button
                          key={tag}
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevalidateTag(tag)}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          Revalidate &quot;{tag}&quot;
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No cached data available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Cache Performance Metrics</CardTitle>
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
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  <p className="text-2xl font-bold">{layerMetrics.avgResponseTime.toFixed(0)}ms</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Cache Size</p>
                  <p className="text-2xl font-bold">{formatCacheSize(layerMetrics.cacheSize)}</p>
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
                    serverRenderTime: layerMetrics.avgResponseTime,
                    clientRenderTime: 0,
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
                title="Data Cache Performance"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revalidation History</CardTitle>
            </CardHeader>
            <CardContent>
              {revalidations.length > 0 ? (
                <div className="space-y-2">
                  {revalidations.map((op, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        {op.success ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium">
                            {op.type === 'tag' ? 'Tag' : 'Path'}: {op.target}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(op.timestamp).toLocaleString()} · {op.duration?.toFixed(0)}ms
                          </p>
                        </div>
                      </div>
                      <Badge variant={op.success ? 'success' : 'destructive'}>
                        {op.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No revalidation operations yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="explanation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How Data Cache Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  1. Automatic Caching
                </h4>
                <p className="text-sm text-muted-foreground">
                  Next.js automatically caches fetch requests on the server. 
                  Data is stored in a persistent HTTP cache that survives across requests.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  2. Cache Tags
                </h4>
                <p className="text-sm text-muted-foreground">
                  Tags allow selective cache invalidation. When you revalidate a tag, 
                  all cached entries with that tag are marked as stale.
                </p>
                <pre className="mt-2 p-2 bg-muted rounded text-xs">
                  {`next: { tags: ['categories', 'posts'] }`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  3. Revalidation Strategies
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Time-based:</strong> revalidate: 60</li>
                  <li>• <strong>On-demand:</strong> revalidateTag()</li>
                  <li>• <strong>Manual:</strong> cache: &apos;no-store&apos;</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4. Performance Benefits</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-green-600">✓ Reduced Latency</p>
                    <p className="text-muted-foreground">Instant data from cache</p>
                  </div>
                  <div>
                    <p className="font-medium text-green-600">✓ Lower Server Load</p>
                    <p className="text-muted-foreground">Fewer database queries</p>
                  </div>
                  <div>
                    <p className="font-medium text-green-600">✓ Cost Savings</p>
                    <p className="text-muted-foreground">Less API calls</p>
                  </div>
                  <div>
                    <p className="font-medium text-green-600">✓ Better UX</p>
                    <p className="text-muted-foreground">Faster page loads</p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pro Tip:</strong> Use tags for granular cache control. 
                  Combine multiple tags to create flexible invalidation strategies.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}