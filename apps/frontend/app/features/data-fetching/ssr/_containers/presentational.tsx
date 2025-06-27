'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedPerformanceDisplay } from '@/components/enhanced-performance-display';
import { CodeDisplay } from '@/components/code-display';
import type { DataFetchMetrics, UserProfile } from '../../_shared/types';
import { formatDateTime, formatTime } from '@/utils/date-formatter';

interface SsrPresentationalProps {
  userProfile: UserProfile | null;
  metrics: DataFetchMetrics | null;
  error: string | null;
}

export function SsrPresentational({ 
  userProfile, 
  metrics, 
  error 
}: SsrPresentationalProps) {
  const [showCode, setShowCode] = useState(false);

  const ssrExampleCode = `// SSR Implementation (Server Component)
export async function SsrContainer() {
  // サーバーサイドでリアルタイムデータを取得
  const result = await userProfileApi.getCurrentProfile({
    cache: 'no-store', // キャッシュしない（リアルタイム）
  });

  return <SsrPresentational userProfile={result.data} />;
}

// APIクライアント
async function getCurrentProfile(options: FetchOptions = {}) {
  return fetchWithMetrics<UserProfile>(
    \`\${API_BASE_URL}/api/user-profile/current\`,
    {
      ...options,
      method: 'GET',
    },
    'ssr'
  );
}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SSR Data Fetching Demo</h1>
          <p className="text-muted-foreground mt-2">
            Server-Side Rendering with real-time data
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
          title="SSR Implementation"
          description="Server-Side Rendering の実装例"
          files={[
            {
              filename: "ssr-container.tsx",
              language: "typescript",
              content: ssrExampleCode,
              description: "SSRを使用したServer Componentの実装"
            }
          ]}
        />
      )}

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="explanation">How SSR Works</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">SSR</Badge>
                User Profile (Real-time)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    Error loading SSR content: {error}
                  </AlertDescription>
                </Alert>
              ) : userProfile ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                      {userProfile.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{userProfile.name || 'Anonymous User'}</h3>
                      <p className="text-muted-foreground">{userProfile.email}</p>
                      {userProfile.bio && (
                        <p className="text-sm mt-2">{userProfile.bio}</p>
                      )}
                    </div>
                    {userProfile.isVerified && (
                      <Badge variant="default">
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{userProfile.postsCount}</div>
                        <p className="text-xs text-muted-foreground">Posts</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">
                          {userProfile.viewsToday || 58}
                        </div>
                        <p className="text-xs text-muted-foreground">Views Today</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">
                          {formatTime(userProfile.joinedAt)}
                        </div>
                        <p className="text-xs text-muted-foreground">Joined</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm font-medium">
                          {formatDateTime(userProfile.joinedAt)}
                        </div>
                        <p className="text-xs text-muted-foreground">Joined</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert>
                    <AlertDescription>
                      <strong>Real-time data:</strong> This information is fetched fresh on each request, 
                      ensuring you always see the most current user profile data.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No user profile data available</p>
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
                  cacheHitRate: 0, // SSRは常にリアルタイム
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
                  nextjsCacheMisses: 1,
                  browserCacheHits: 0,
                  browserCacheMisses: 1,
                  cacheEfficiency: 0, // リアルタイムなのでキャッシュ効率は0
                },
                lastUpdated: metrics?.timestamp || new Date().toISOString(),
              }}
              title="SSR Performance Metrics"
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
              <CardTitle>How SSR Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Request Time Generation</h4>
                <p className="text-sm text-muted-foreground">
                  Pages are rendered on the server for each request. Data is fetched fresh 
                  and HTML is generated with the latest information.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">2. Benefits</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Real-time, fresh data on every request</li>
                  <li>• SEO-friendly (fully rendered HTML)</li>
                  <li>• Personalized content</li>
                  <li>• Server-side authentication</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">3. Use Cases</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• User dashboards</li>
                  <li>• Real-time data displays</li>
                  <li>• Personalized content</li>
                  <li>• Dynamic pricing pages</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4. Performance Characteristics</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• First Load: 150-500ms (server computation + network)</li>
                  <li>• Cache Hit Rate: 0% (always fresh)</li>
                  <li>• Server Load: High (computation per request)</li>
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