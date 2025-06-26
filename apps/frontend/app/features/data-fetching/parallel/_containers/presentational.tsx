'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedPerformanceDisplay } from '@/components/enhanced-performance-display';
import { CodeDisplay } from '@/components/code-display';
import type {
  Category,
  UserProfile,
  DashboardStats,
  DataFetchMetrics,
} from '../../_shared/types';

interface CombinedData {
  categories: Category[];
  userProfile: UserProfile | null;
  dashboardStats: DashboardStats;
}

interface ParallelPresentationalProps {
  combinedData: CombinedData | null;
  metrics: DataFetchMetrics | null;
  error: string | null;
}

export function ParallelPresentational({
  combinedData,
  metrics,
  error,
}: ParallelPresentationalProps) {
  const [showCode, setShowCode] = useState(false);

  const parallelExampleCode = `// Parallel Fetch Implementation
export async function fetchParallel(): Promise<ApiResponse<CombinedData>> {
  const startTime = performance.now();
  
  try {
    // 複数のAPIを並列で実行
    const [categoriesResult, userProfileResult, dashboardStatsResult] = 
      await Promise.all([
        categoriesApi.getAll(),
        userProfileApi.getCurrentProfile(),
        dashboardStatsApi.getStats()
      ]);

    const endTime = performance.now();
    const duration = endTime - startTime;

    return {
      data: {
        categories: categoriesResult.data,
        userProfile: userProfileResult.data,
        dashboardStats: dashboardStatsResult.data,
      },
      metrics: {
        source: 'parallel',
        duration,
        timestamp: new Date().toISOString(),
        dataSize: calculateTotalSize([
          categoriesResult, 
          userProfileResult, 
          dashboardStatsResult
        ]),
        requestCount: 3,
        cached: false,
      },
    };
  } catch (error) {
    throw new Error(\`Parallel fetch failed: \${error.message}\`);
  }
}

// Container Component
export async function ParallelContainer() {
  const result = await fetchParallel();
  return <ParallelPresentational combinedData={result.data} />;
}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parallel Data Fetching Demo</h1>
          <p className="text-muted-foreground mt-2">
            Multiple API endpoints fetched simultaneously with Promise.all
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowCode(!showCode)}>
          {showCode ? 'Hide Code' : 'Show Code'}
        </Button>
      </div>

      {showCode && (
        <CodeDisplay
          title="Parallel Fetch Implementation"
          description="並行データフェッチングの実装例"
          files={[
            {
              filename: "parallel-fetch.tsx",
              language: "typescript",
              content: parallelExampleCode,
              description: "複数のAPIを並行で呼び出す実装"
            }
          ]}
        />
      )}

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="explanation">How Parallel Fetching Works</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>Error loading parallel data: {error}</AlertDescription>
            </Alert>
          ) : combinedData ? (
            <div className="space-y-6">
              {/* Dashboard Stats Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="default">Dashboard Stats</Badge>
                    Real-time Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">
                          {combinedData.dashboardStats.totalUsers}
                        </div>
                        <p className="text-xs text-muted-foreground">Total Users</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">
                          {combinedData.dashboardStats.totalPosts}
                        </div>
                        <p className="text-xs text-muted-foreground">Total Posts</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">
                          {combinedData.dashboardStats.totalCategories}
                        </div>
                        <p className="text-xs text-muted-foreground">Categories</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">
                          {combinedData.dashboardStats.dailyActiveUsers}
                        </div>
                        <p className="text-xs text-muted-foreground">Active Users</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* User Profile Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="secondary">User Profile</Badge>
                    Current User Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {combinedData.userProfile ? (
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                        {combinedData.userProfile.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">
                          {combinedData.userProfile.name || 'Anonymous User'}
                        </h3>
                        <p className="text-muted-foreground">{combinedData.userProfile.email}</p>
                        {combinedData.userProfile.bio && (
                          <p className="text-sm mt-2">{combinedData.userProfile.bio}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {combinedData.userProfile.isVerified && (
                            <Badge variant="default">
                              Verified
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {combinedData.userProfile.postsCount} posts
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No user profile available</p>
                  )}
                </CardContent>
              </Card>

              {/* Categories Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline">Categories</Badge>
                    Available Categories ({combinedData.categories.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {combinedData.categories.slice(0, 6).map((category) => (
                      <Card key={category.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center justify-between">
                            {category.name}
                            <Badge variant="secondary" className="text-xs">
                              {category.postCount}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {combinedData.categories.length > 6 && (
                    <p className="text-center text-muted-foreground mt-4">
                      ... and {combinedData.categories.length - 6} more categories
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Performance Summary */}
              <Alert>
                <AlertDescription>
                  <strong>Parallel Fetch Performance:</strong> All three API endpoints were fetched
                  simultaneously using Promise.all, reducing total loading time compared to
                  sequential fetching.
                  {metrics && (
                    <span className="block mt-1">
                      Total time: {metrics.duration.toFixed(2)}ms for {metrics.requestCount}{' '}
                      requests
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance">
          {metrics ? (
            <EnhancedPerformanceDisplay
              metrics={{
                network: {
                  totalRequests: metrics.requestCount || 3,
                  avgResponseTime: metrics.duration / (metrics.requestCount || 3),
                  cacheHitRate: 0, // 並列フェッチは通常キャッシュされない
                  totalDataTransferred: metrics.dataSize,
                  errors: 0,
                },
                render: {
                  serverRenderTime: metrics.duration,
                  clientRenderTime: 0,
                  totalRenderTime: metrics.duration,
                },
                cache: {
                  nextjsCacheHits: 0,
                  nextjsCacheMisses: metrics.requestCount || 3,
                  browserCacheHits: 0,
                  browserCacheMisses: metrics.requestCount || 3,
                  cacheEfficiency: 0,
                },
                lastUpdated: metrics?.timestamp || new Date().toISOString(),
              }}
              title="Parallel Fetch Performance Metrics"
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
              <CardTitle>How Parallel Fetching Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Promise.all Pattern</h4>
                <p className="text-sm text-muted-foreground">
                  Multiple API requests are initiated simultaneously using Promise.all(), allowing
                  them to execute concurrently rather than sequentially.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2. Performance Benefits</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • <strong>Reduced latency:</strong> Total time = slowest request (not sum of
                    all)
                  </li>
                  <li>
                    • <strong>Better resource utilization:</strong> Multiple network connections
                  </li>
                  <li>
                    • <strong>Improved UX:</strong> Faster page loads with complete data
                  </li>
                  <li>
                    • <strong>Consistent loading:</strong> All data arrives together
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. Use Cases</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Dashboard pages with multiple data sources</li>
                  <li>• Product pages with details, reviews, and recommendations</li>
                  <li>• User profiles with activity and preferences</li>
                  <li>• Any page requiring data from independent APIs</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4. Error Handling</h4>
                <p className="text-sm text-muted-foreground">
                  With Promise.all, if any request fails, the entire operation fails. Consider
                  Promise.allSettled() for partial failure scenarios.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">5. Performance Comparison</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>
                    • <strong>Sequential:</strong> 100ms + 150ms + 120ms = 370ms total
                  </div>
                  <div>
                    • <strong>Parallel:</strong> max(100ms, 150ms, 120ms) = 150ms total
                  </div>
                  <div>
                    • <strong>Improvement:</strong> ~60% faster in this example
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
