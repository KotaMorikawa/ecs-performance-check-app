'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedPerformanceDisplay } from '@/components/enhanced-performance-display';
import { CodeDisplay } from '@/components/code-display';
import type { Category, DataFetchMetrics } from '../../_shared/types';
import { formatDateTime } from '@/utils/date-formatter';

interface IsrPresentationalProps {
  categories: Category[];
  metrics: DataFetchMetrics | null;
  error: string | null;
}

export function IsrPresentational({ categories, metrics, error }: IsrPresentationalProps) {
  const [showCode, setShowCode] = useState(false);

  const isrExampleCode = `// ISR Implementation (Server Component)
export async function IsrContainer() {
  // ISR用のキャッシュ設定（60秒でリバリデート）
  const result = await categoriesApi.getAll({
    next: {
      revalidate: 60, // 60秒でリバリデート
      tags: ['categories'],
    },
  });

  return <IsrPresentational categories={result.data} />;
}

// APIクライアント
async function getAll(options: FetchOptions = {}) {
  return fetchWithMetrics<Category[]>(
    \`\${API_BASE_URL}/api/categories\`,
    {
      ...options,
      method: 'GET',
    },
    'isr'
  );
}

// On-demand revalidation
import { revalidateTag } from 'next/cache';

async function revalidateCategories() {
  revalidateTag('categories');
}`;

  const handleRevalidate = async () => {
    try {
      const response = await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag: 'categories' }),
      });

      if (response.ok) {
        // Page refresh to see updated content
        window.location.reload();
      }
    } catch (error) {
      console.error('Revalidation failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ISR Data Fetching Demo</h1>
          <p className="text-muted-foreground mt-2">
            Incremental Static Regeneration with time-based revalidation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRevalidate}>
            Force Revalidate
          </Button>
          <Button variant="outline" onClick={() => setShowCode(!showCode)}>
            {showCode ? 'Hide Code' : 'Show Code'}
          </Button>
        </div>
      </div>

      {showCode && (
        <CodeDisplay
          title="ISR Implementation"
          description="Incremental Static Regeneration の実装例"
          files={[
            {
              filename: 'container.tsx',
              language: 'typescript',
              content: isrExampleCode,
              description: 'ISRを使用したServer Componentの実装',
            },
          ]}
        />
      )}

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="explanation">How ISR Works</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">ISR</Badge>
                Categories (60s revalidation)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>Error loading ISR content: {error}</AlertDescription>
                </Alert>
              ) : categories.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
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
                      <strong>ISR Behavior:</strong> This content is statically generated at build
                      time and revalidated every 60 seconds. The first visitor after the
                      revalidation period will trigger a background regeneration.
                    </AlertDescription>
                  </Alert>

                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Current Status</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Page Generated:</span>
                        <span className="ml-2 font-mono">
                          {metrics && metrics.timestamp
                            ? new Date(metrics.timestamp).toISOString().split('T')[0]
                            : 'Build time'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Revalidation:</span>
                        <span className="ml-2 font-mono">60 seconds</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cache Status:</span>
                        <Badge variant="outline" className="ml-2">
                          {metrics?.cached ? 'Cached' : 'Fresh'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Categories:</span>
                        <span className="ml-2 font-mono">{categories.length}</span>
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
          {metrics ? (
            <EnhancedPerformanceDisplay
              metrics={{
                network: {
                  totalRequests: 1,
                  avgResponseTime: metrics.duration,
                  cacheHitRate: 85, // ISRは高いキャッシュ効率
                  totalDataTransferred: metrics.dataSize,
                  errors: 0,
                },
                render: {
                  serverRenderTime: metrics.cached ? 0 : metrics.duration,
                  clientRenderTime: 0,
                  totalRenderTime: metrics.cached ? 0 : metrics.duration,
                },
                cache: {
                  nextjsCacheHits: metrics.cached ? 1 : 0,
                  nextjsCacheMisses: metrics.cached ? 0 : 1,
                  browserCacheHits: 0,
                  browserCacheMisses: 1,
                  cacheEfficiency: 85, // ISRの一般的なキャッシュ効率
                },
                lastUpdated: metrics?.timestamp || new Date().toISOString(),
              }}
              title="ISR Performance Metrics"
            />
          ) : (
            <Alert>
              <AlertDescription>Performance metrics not available</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="explanation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How ISR Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Static Generation + Revalidation</h4>
                <p className="text-sm text-muted-foreground">
                  Pages are pre-rendered at build time and cached. After the revalidation period,
                  the next request triggers a background regeneration while serving the cached
                  version.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2. Revalidation Strategies</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • <strong>Time-based:</strong> revalidate: 60 (every 60 seconds)
                  </li>
                  <li>
                    • <strong>On-demand:</strong> revalidateTag() or revalidatePath()
                  </li>
                  <li>
                    • <strong>Tag-based:</strong> Cache tags for selective invalidation
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. Benefits</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Fast response times (served from cache)</li>
                  <li>• SEO-friendly (pre-rendered HTML)</li>
                  <li>• Fresh content (automatic updates)</li>
                  <li>• Scalable (CDN distribution)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4. Use Cases</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Product catalogs</li>
                  <li>• Blog posts and articles</li>
                  <li>• Marketing pages</li>
                  <li>• Content that updates periodically</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">5. Performance Characteristics</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• First Load: 50-150ms (cached response)</li>
                  <li>• Cache Hit Rate: 85-95% (very high)</li>
                  <li>• Server Load: Low (occasional regeneration)</li>
                  <li>• Data Freshness: Configurable (60s in this demo)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
