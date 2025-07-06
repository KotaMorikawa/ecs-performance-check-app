"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CodeDisplay } from "@/components/code-display";
import { EnhancedPerformanceDisplay } from "@/components/enhanced-performance-display";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime } from "@/utils/date-formatter";
import type { Category, DataFetchMetrics } from "../../_shared/types";

interface ClientSideState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  metrics: DataFetchMetrics | null;
  refreshCount: number;
}

export function ClientSidePresentational() {
  const [showCode, setShowCode] = useState(false);
  const [state, setState] = useState<ClientSideState>({
    categories: [],
    loading: true,
    error: null,
    metrics: null,
    refreshCount: 0,
  });
  const loadingRef = useRef(false);

  // クライアントサイド データフェッチ
  const fetchCategories = useCallback(async (isRefresh = false) => {
    // 既にロード中の場合は重複リクエストを防ぐ
    if (loadingRef.current && !isRefresh) {
      return;
    }

    loadingRef.current = true;
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      refreshCount: isRefresh ? prev.refreshCount + 1 : prev.refreshCount,
    }));

    const startTime = performance.now();

    try {
      const response = await fetch("/api/categories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // クライアントサイドでのキャッシュ制御
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const endTime = performance.now();
      const duration = endTime - startTime;

      const metrics: DataFetchMetrics = {
        source: "client-side",
        duration,
        timestamp: new Date().toISOString(),
        dataSize: JSON.stringify(result).length,
        cached: false,
        requestCount: 1,
      };

      setState((prev) => ({
        ...prev,
        categories: result.data || [],
        loading: false,
        metrics,
      }));
      loadingRef.current = false;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
        metrics: {
          source: "client-side",
          duration,
          timestamp: new Date().toISOString(),
          dataSize: 0,
          cached: false,
          requestCount: 1,
        },
      }));
      loadingRef.current = false;
    }
  }, []);

  // 初回読み込み
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 定期的な更新（SWRライクな動作）
  useEffect(() => {
    const interval = setInterval(() => {
      // loadingステートをチェックしないで、毎回実行する
      // fetchCategories内でloadingチェックを処理
      fetchCategories();
    }, 30000); // 30秒ごとに更新

    return () => clearInterval(interval);
  }, [
    // loadingステートをチェックしないで、毎回実行する
    // fetchCategories内でloadingチェックを処理
    fetchCategories,
  ]); // 依存配列は空にして一度だけ設定

  const handleRefresh = () => {
    fetchCategories(true);
  };

  const clientSideExampleCode = `// Client-Side Fetch Implementation
'use client';

import { useState, useEffect } from 'react';

export function ClientSidePresentational() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // クライアントサイド データフェッチ
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/categories', {
        method: 'GET',
        cache: 'no-cache', // リアルタイムデータ
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 初回読み込み
  useEffect(() => {
    fetchCategories();
  }, []);

  // 定期的な更新（SWRライクな動作）
  useEffect(() => {
    const interval = setInterval(fetchCategories, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {categories.map(category => (
        <div key={category.id}>{category.name}</div>
      ))}
    </div>
  );
}

// SWR Pattern (recommended)
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function ClientSideWithSWR() {
  const { data, error, isLoading, mutate } = useSWR('/api/categories', fetcher, {
    refreshInterval: 30000, // 30秒ごとに更新
    revalidateOnFocus: true, // フォーカス時に再検証
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={() => mutate()}>Refresh</button>
      {data?.map(category => (
        <div key={category.id}>{category.name}</div>
      ))}
    </div>
  );
}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client-Side Data Fetching Demo</h1>
          <p className="text-muted-foreground mt-2">
            Data fetching in the browser with useEffect and SWR patterns
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={state.loading}>
            {state.loading ? "Loading..." : "Refresh"}
          </Button>
          <Button variant="outline" onClick={() => setShowCode(!showCode)}>
            {showCode ? "Hide Code" : "Show Code"}
          </Button>
        </div>
      </div>

      {showCode && (
        <CodeDisplay
          title="Client-Side Fetch Implementation"
          description="クライアントサイドでのデータフェッチとリアルタイム更新の実装例"
          files={[
            {
              filename: "presentational.tsx",
              language: "typescript",
              content: clientSideExampleCode,
              description: "Client Componenでのデータフェッチ実装",
            },
          ]}
        />
      )}

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="explanation">How Client-Side Fetching Works</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="destructive">Client-Side</Badge>
                Categories (Real-time updates)
                {state.refreshCount > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    Refreshed {state.refreshCount} times
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading categories...</span>
                </div>
              ) : state.error ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    Error loading client-side content: {state.error}
                  </AlertDescription>
                </Alert>
              ) : state.categories.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {state.categories.map((category) => (
                      <Card key={category.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center justify-between">
                            {category.name}
                            <Badge variant="secondary">{category.postCount} posts</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">
                            {category.description}
                          </p>
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>Created: {formatDateTime(category.createdAt)}</span>
                            <span>Updated: {formatDateTime(category.updatedAt)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Alert>
                    <AlertDescription>
                      <strong>Client-Side Behavior:</strong> This data is fetched in the browser
                      after the page loads. It automatically refreshes every 30 seconds to show
                      real-time updates.
                      {state.metrics && (
                        <span className="block mt-1">
                          Last fetch took {state.metrics.duration.toFixed(2)}ms
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>

                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Client-Side Status</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Loading State:</span>
                        <Badge variant={state.loading ? "default" : "outline"} className="ml-2">
                          {state.loading ? "Loading" : "Idle"}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Auto-refresh:</span>
                        <Badge variant="secondary" className="ml-2">
                          Every 30s
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Refreshes:</span>
                        <span className="ml-2 font-mono">{state.refreshCount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data Source:</span>
                        <Badge variant="destructive" className="ml-2">
                          Browser
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No categories available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          {state.metrics ? (
            <EnhancedPerformanceDisplay
              metrics={{
                network: {
                  totalRequests: state.refreshCount + 1,
                  avgResponseTime: state.metrics.duration,
                  cacheHitRate: 0, // クライアントサイドは通常キャッシュされない
                  totalDataTransferred: state.metrics.dataSize,
                  errors: state.error ? 1 : 0,
                },
                render: {
                  serverRenderTime: 0, // サーバーレンダリングなし
                  clientRenderTime: state.metrics.duration,
                  totalRenderTime: state.metrics.duration,
                },
                cache: {
                  nextjsCacheHits: 0,
                  nextjsCacheMisses: state.refreshCount + 1,
                  browserCacheHits: 0,
                  browserCacheMisses: state.refreshCount + 1,
                  cacheEfficiency: 0,
                },
                lastUpdated: state.metrics.timestamp,
              }}
              title="Client-Side Fetch Performance Metrics"
            />
          ) : (
            <Alert>
              <AlertDescription>
                Performance metrics will be available after the first successful fetch
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="explanation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How Client-Side Fetching Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Browser-Based Execution</h4>
                <p className="text-sm text-muted-foreground">
                  Data is fetched after the page loads, using JavaScript in the browser. This
                  creates a loading state that users can see.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2. React Patterns</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • <strong>useEffect:</strong> Triggers data fetching after component mount
                  </li>
                  <li>
                    • <strong>useState:</strong> Manages loading, data, and error states
                  </li>
                  <li>
                    • <strong>Error boundaries:</strong> Handle fetch failures gracefully
                  </li>
                  <li>
                    • <strong>Loading states:</strong> Provide immediate user feedback
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. SWR (Stale-While-Revalidate)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Automatic revalidation and caching</li>
                  <li>• Focus and network reconnection handling</li>
                  <li>• Optimistic updates and mutations</li>
                  <li>• Built-in error retry and deduplication</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4. Benefits</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Personalized content (user-specific data)</li>
                  <li>• Real-time updates and polling</li>
                  <li>• Interactive features (refresh, pagination)</li>
                  <li>• Reduced server load (cached responses)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">5. Drawbacks</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Slower initial page load (loading states)</li>
                  <li>• SEO limitations (content not in initial HTML)</li>
                  <li>• Network dependency (offline issues)</li>
                  <li>• JavaScript requirement (accessibility concerns)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">6. Performance Characteristics</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• First Load: 200-800ms (after page load)</li>
                  <li>• Cache Hit Rate: 0-50% (depends on strategy)</li>
                  <li>• Server Load: Medium (frequent requests)</li>
                  <li>• Data Freshness: Real-time</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
