"use client";

import {
  Clock,
  FileText,
  Globe,
  Layers,
  Monitor,
  RefreshCw,
  Server,
  Timer,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { CodeDisplay } from "@/components/code-display";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { revalidationApi } from "../../_shared/cache-api-client";
import type { CacheMetrics, CacheTestData } from "../../_shared/types";

interface FullRouteCachePresentationalProps {
  initialData: CacheTestData[];
  initialMetrics: CacheMetrics;
  cacheInfo: {
    renderTime: string;
    mode: string;
    cached: boolean;
  };
  error: string | null;
}

export function FullRouteCachePresentational({
  initialData,
  initialMetrics,
  cacheInfo,
  error,
}: FullRouteCachePresentationalProps) {
  const [showCode, setShowCode] = useState(false);
  const [revalidateTime, setRevalidateTime] = useState(60);
  const [pageGenerated] = useState(new Date().toISOString());
  const [lastRevalidated, setLastRevalidated] = useState<string | null>(null);

  // ページリバリデート
  const handleRevalidatePage = async () => {
    try {
      const result = await revalidationApi.revalidatePath("/features/caching/full-route-cache");
      if (result.success) {
        setLastRevalidated(new Date().toISOString());
        // ページリロードで更新を確認
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      console.error("Revalidation error:", error);
    }
  };

  const fullRouteCacheCode = `// Full Route Cache実装例
// ページ全体のキャッシュとISR

// 1. 静的生成（Build時生成）
export const dynamic = 'force-static';

async function StaticPage() {
  const data = await fetch('http://localhost:8000/api/categories', {
    next: { 
      revalidate: false // 永続キャッシュ
    }
  });
  
  return <PageContent data={data} />;
}

// 2. ISR（Incremental Static Regeneration）
async function ISRPage() {
  const data = await fetch('http://localhost:8000/api/posts', {
    next: { 
      revalidate: 60 // 60秒でリジェネレート
    }
  });
  
  return <PageContent data={data} />;
}

// 3. 動的セグメント用のISR
export async function generateStaticParams() {
  const categories = await fetch('http://localhost:8000/api/categories')
    .then(res => res.json());
  
  return categories.data.map((category: any) => ({
    slug: category.slug,
  }));
}

// 4. On-demand revalidation
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const { path } = await request.json();
  
  // 特定パスを再生成
  revalidatePath(path);
  
  return Response.json({ revalidated: true });
}

// 5. ページレベルの設定
export const revalidate = 60; // ページ全体のリバリデート間隔

// 6. 部分プリレンダリング
export const experimental_ppr = true;`;

  const cacheStatus = cacheInfo?.cached ? "HIT" : "MISS";
  const cacheSource = cacheInfo?.cached ? "cache" : "generation";

  // TTL残り時間の計算
  const remainingTTL = 0; // cacheInfoからは取得できないため0に設定
  const ttlPercentage = remainingTTL > 0 ? (remainingTTL / revalidateTime) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Full Route Cache Demo</h1>
          <p className="text-muted-foreground mt-2">
            ページ全体のキャッシュとIncremental Static Regeneration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRevalidatePage}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Revalidate Page
          </Button>
          <Button variant="outline" onClick={() => setShowCode(!showCode)}>
            {showCode ? "Hide Code" : "Show Code"}
          </Button>
        </div>
      </div>

      {showCode && (
        <CodeDisplay
          title="Full Route Cache Implementation"
          description="ページレベルキャッシュとISRの実装例"
          files={[
            {
              filename: "page.tsx",
              language: "typescript",
              content: fullRouteCacheCode,
              description: "Full Route Cacheの各種パターン",
            },
          ]}
        />
      )}

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Cache Status</TabsTrigger>
          <TabsTrigger value="content">Page Content</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="explanation">How It Works</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          {/* ページキャッシュ状態 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Page Cache Status
                </span>
                <Badge variant={cacheStatus === "HIT" ? "success" : "secondary"}>
                  {cacheStatus}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Generation Source</p>
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    <span className="font-medium capitalize">{cacheSource}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Generated At</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium text-sm">
                      {new Date(pageGenerated).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Revalidate Interval</p>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    <span className="font-medium">{revalidateTime}s</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Response Time</p>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">
                      {initialMetrics?.performance?.renderTime?.toFixed(0) || 0}ms
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ISR設定と状態 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  ISR Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="revalidate-time" className="text-sm font-medium">
                    Revalidate Time (seconds)
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      id="revalidate-time"
                      type="range"
                      min="30"
                      max="300"
                      step="30"
                      value={revalidateTime}
                      onChange={(e) => setRevalidateTime(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="font-mono text-sm w-12">{revalidateTime}s</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Cache TTL Remaining</p>
                  <Progress value={ttlPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {remainingTTL}s remaining of {revalidateTime}s interval
                  </p>
                </div>

                <Alert>
                  <Globe className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    This page will be statically regenerated every {revalidateTime} seconds when
                    accessed after the interval.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generation Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Page Generated</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(pageGenerated).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {lastRevalidated && (
                    <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Last Revalidated</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(lastRevalidated).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-2 bg-muted rounded">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Next Revalidation</p>
                      <p className="text-xs text-muted-foreground">
                        On next request after TTL expires
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Statically Cached Content</CardTitle>
              <p className="text-sm text-muted-foreground">
                This content is served from the Full Route Cache
              </p>
            </CardHeader>
            <CardContent>
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : initialData.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {initialData.slice(0, 6).map((item: CacheTestData) => (
                      <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{item.name}</CardTitle>
                            <Badge variant="outline">{item.postCount || 0}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          <div className="text-xs text-muted-foreground">
                            Cached at: {new Date(pageGenerated).toLocaleTimeString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Alert>
                    <Monitor className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Cache Behavior:</strong> This entire page is pre-rendered and cached.
                      Content updates happen during regeneration, providing excellent performance
                      while maintaining data freshness.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No cached content available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {initialMetrics?.performance?.renderTime?.toFixed(0) || 0}ms
                    </p>
                    <p className="text-sm text-muted-foreground">Response Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">100%</p>
                    <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Performance Score</p>
                  <Progress value={95} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Excellent - Static generation provides optimal performance
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Server Load</span>
                    <span className="text-sm font-medium text-green-600">Minimal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">SEO Performance</span>
                    <span className="text-sm font-medium text-green-600">Excellent</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">CDN Compatibility</span>
                    <span className="text-sm font-medium text-green-600">Perfect</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">User Experience</span>
                    <span className="text-sm font-medium text-green-600">Instant</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="explanation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How Full Route Cache Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  1. Static Generation
                </h4>
                <p className="text-sm text-muted-foreground">
                  Pages are pre-rendered at build time or on-demand. The entire HTML, including
                  data, is cached and served instantly.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  2. Incremental Static Regeneration (ISR)
                </h4>
                <p className="text-sm text-muted-foreground">
                  Pages are regenerated in the background based on time intervals or on-demand
                  triggers. Users always get fast responses while content stays fresh.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  3. CDN Distribution
                </h4>
                <p className="text-sm text-muted-foreground">
                  Static pages can be distributed globally via CDNs like CloudFront, providing
                  sub-100ms response times worldwide.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4. Use Cases</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Product catalogs and e-commerce pages</li>
                  <li>• Blog posts and marketing content</li>
                  <li>• Documentation sites</li>
                  <li>• Landing pages with dynamic data</li>
                </ul>
              </div>

              <Alert>
                <Layers className="h-4 w-4" />
                <AlertDescription>
                  <strong>Best Practice:</strong> Use ISR for content that changes periodically but
                  doesn&apos;t need real-time updates. Set appropriate revalidation intervals based
                  on your content update frequency.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
