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

interface SsgPresentationalProps {
  categories: Category[];
  metrics: DataFetchMetrics | null;
  error: string | null;
}

export function SsgPresentational({ 
  categories, 
  metrics, 
  error 
}: SsgPresentationalProps) {
  const [showCode, setShowCode] = useState(false);

  const ssgExampleCode = `// SSG Implementation (generateStaticParams)
export async function generateStaticParams() {
  const response = await fetch(\`\${API_URL}/api/categories\`);
  const result = await response.json();
  
  return result.data.map((category) => ({
    category: category.slug,
  }));
}

// Server Component
export async function SsgContainer() {
  // ビルド時にデータを取得（キャッシュは永続化）
  const result = await categoriesApi.getAll({
    next: {
      tags: ['categories'],
      // SSGでは revalidate を設定せず、ビルド時のみ実行
    },
  });

  return <SsgPresentational categories={result.data} />;
}

// APIクライアント
async function getAll(options: FetchOptions = {}) {
  return fetchWithMetrics<Category[]>(
    \`\${API_BASE_URL}/api/categories\`,
    {
      ...options,
      method: 'GET',
    },
    'ssg'
  );
}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SSG Data Fetching Demo</h1>
          <p className="text-muted-foreground mt-2">
            Static Site Generation with build-time data pre-rendering
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowCode(!showCode)}
        >
          {showCode ? 'Hide Code' : 'Show Code'}
        </Button>
      </div>

      {showCode && (
        <CodeDisplay 
          title="SSG Implementation"
          description="Static Site Generation の実装例"
          files={[
            {
              filename: "ssg-page.tsx",
              language: "typescript",
              content: ssgExampleCode,
              description: "SSGを使用したページの実装"
            }
          ]}
        />
      )}

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="explanation">How SSG Works</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="default">SSG</Badge>
                Categories (Build-time generated)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    Error loading SSG content: {error}
                  </AlertDescription>
                </Alert>
              ) : categories.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <Card key={category.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center justify-between">
                            {category.name}
                            <Badge variant="secondary">
                              {category.postCount} posts
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">
                            {category.description}
                          </p>
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>Slug: {category.slug}</span>
                            <span>Created: {formatDateTime(category.createdAt)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Alert>
                    <AlertDescription>
                      <strong>SSG Behavior:</strong> This content was pre-rendered at build time 
                      and served as static HTML. Perfect for content that doesn&apos;t change frequently.
                    </AlertDescription>
                  </Alert>

                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">SSG Status</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Generation Time:</span>
                        <span className="ml-2 font-mono">Build time</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cache Status:</span>
                        <Badge variant="default" className="ml-2">
                          Static
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Categories:</span>
                        <span className="ml-2 font-mono">{categories.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data Source:</span>
                        <Badge variant="outline" className="ml-2">
                          Pre-rendered
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
          {metrics ? (
            <EnhancedPerformanceDisplay 
              metrics={{
                network: {
                  totalRequests: 1,
                  avgResponseTime: metrics.duration,
                  cacheHitRate: 100, // SSGは常に100%キャッシュ
                  totalDataTransferred: metrics.dataSize,
                  errors: 0,
                },
                render: {
                  serverRenderTime: 0, // ビルド時に実行済み
                  clientRenderTime: 0,
                  totalRenderTime: 0,
                },
                cache: {
                  nextjsCacheHits: 1,
                  nextjsCacheMisses: 0,
                  browserCacheHits: 1,
                  browserCacheMisses: 0,
                  cacheEfficiency: 100, // SSGは最高効率
                },
                lastUpdated: metrics?.timestamp || new Date().toISOString(),
              }}
              title="SSG Performance Metrics"
            />
          ) : (
            <Alert>
              <AlertDescription>
                Performance metrics not available
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="explanation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How SSG Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Build-Time Generation</h4>
                <p className="text-sm text-muted-foreground">
                  Pages are pre-rendered at build time with all data fetched and HTML generated. 
                  The result is served as static files from CDN.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">2. generateStaticParams</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Runs at build time to determine static routes</li>
                  <li>• Fetches data to generate all possible page variations</li>
                  <li>• Returns array of parameter objects for dynamic routes</li>
                  <li>• Enables pre-rendering of dynamic pages</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">3. Benefits</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Fastest possible loading times (~50ms)</li>
                  <li>• Perfect SEO (fully rendered HTML)</li>
                  <li>• CDN distribution and edge caching</li>
                  <li>• No server computation at request time</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4. Use Cases</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Marketing and landing pages</li>
                  <li>• Product catalogs and documentation</li>
                  <li>• Blog posts and static content</li>
                  <li>• Content that rarely changes</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">5. Performance Characteristics</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• First Load: 20-80ms (CDN response)</li>
                  <li>• Cache Hit Rate: 95-99% (CDN + browser)</li>
                  <li>• Server Load: None (static files)</li>
                  <li>• Data Freshness: Build time</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}