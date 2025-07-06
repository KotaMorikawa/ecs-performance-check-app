"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Play,
  RefreshCw,
  Route,
  Tag,
  Webhook,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { CodeDisplay } from "@/components/code-display";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { revalidationApi } from "../../_shared/cache-api-client";
import type { CacheApiResponse, CacheTestData, RevalidationOperation } from "../../_shared/types";

interface OnDemandRevalidationPresentationalProps {
  initialData: CacheTestData[];
  initialMetadata: CacheApiResponse<CacheTestData[]>["metadata"] | null;
  initialMetrics: CacheApiResponse<CacheTestData[]>["metrics"] | null;
  error: string | null;
}

export function OnDemandRevalidationPresentational({
  initialMetadata,
  initialMetrics,
}: OnDemandRevalidationPresentationalProps) {
  const [showCode, setShowCode] = useState(false);
  const [customPath, setCustomPath] = useState("/features/caching");
  const [customTag, setCustomTag] = useState("categories");
  const [operations, setOperations] = useState<RevalidationOperation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // パスベースリバリデート実行
  const handlePathRevalidation = async (path?: string) => {
    setIsProcessing(true);
    try {
      const targetPath = path || customPath;
      const result = await revalidationApi.revalidatePath(targetPath);
      setOperations([result, ...operations]);
    } catch (error) {
      console.error("Path revalidation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // タグベースリバリデート実行
  const handleTagRevalidation = async (tag?: string) => {
    setIsProcessing(true);
    try {
      const targetTag = tag || customTag;
      const result = await revalidationApi.revalidateTag(targetTag);
      setOperations([result, ...operations]);
    } catch (error) {
      console.error("Tag revalidation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 複数タグの一括リバリデート
  const handleBatchRevalidation = async () => {
    setIsProcessing(true);
    try {
      const tags = ["categories", "revalidation-demo", "on-demand"];
      const results = await revalidationApi.revalidateMultipleTags(tags);
      setOperations([...results, ...operations]);
    } catch (error) {
      console.error("Batch revalidation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // バックエンド通知のシミュレーション
  const handleBackendSimulation = async () => {
    setIsProcessing(true);
    try {
      const result = await revalidationApi.simulateBackendRevalidation("data-updated");
      setOperations([result, ...operations]);
    } catch (error) {
      console.error("Backend simulation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const onDemandCode = `// On-demand Revalidation実装例
// サーバーアクションとAPIルート

// 1. Server Actions での revalidation
'use server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function updatePost(formData: FormData) {
  // データ更新処理
  await updatePostInDatabase(formData);
  
  // 特定パスをリバリデート
  revalidatePath('/blog/[slug]');
  
  // タグベースリバリデート
  revalidateTag('posts');
}

// 2. API Route での revalidation
export async function POST(request: Request) {
  const { path, tag, secret } = await request.json();
  
  // シークレットキー検証
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 });
  }
  
  try {
    if (path) {
      revalidatePath(path);
    }
    
    if (tag) {
      revalidateTag(tag);
    }
    
    return Response.json({ revalidated: true });
  } catch (error) {
    return Response.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}

// 3. バックエンドからの Webhook 通知
export async function webhookHandler(data: WebhookData) {
  const response = await fetch('/api/revalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tag: data.entityType,
      secret: process.env.REVALIDATE_SECRET
    })
  });
  
  return response.json();
}

// 4. 選択的リバリデート戦略
async function smartRevalidation(updateType: string, entityId: string) {
  switch (updateType) {
    case 'post':
      revalidateTag('posts');
      revalidatePath(\`/blog/\${entityId}\`);
      break;
    case 'category':
      revalidateTag('categories');
      revalidatePath('/categories');
      break;
    case 'user':
      revalidateTag(\`user-\${entityId}\`);
      break;
  }
}

// 5. 段階的リバリデート
async function cascadeRevalidation() {
  // 1. 特定コンテンツ
  revalidateTag('latest-posts');
  
  // 2. カテゴリページ
  setTimeout(() => revalidateTag('categories'), 1000);
  
  // 3. トップページ
  setTimeout(() => revalidatePath('/'), 2000);
}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">On-demand Revalidation Demo</h1>
          <p className="text-muted-foreground mt-2">
            必要に応じたキャッシュ無効化とリアルタイム更新
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBatchRevalidation} disabled={isProcessing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? "animate-spin" : ""}`} />
            Batch Revalidate
          </Button>
          <Button variant="outline" onClick={() => setShowCode(!showCode)}>
            {showCode ? "Hide Code" : "Show Code"}
          </Button>
        </div>
      </div>

      {showCode && (
        <CodeDisplay
          title="On-demand Revalidation Implementation"
          description="オンデマンドリバリデートの実装パターン"
          files={[
            {
              filename: "revalidation.ts",
              language: "typescript",
              content: onDemandCode,
              description: "各種リバリデート手法の実装例",
            },
          ]}
        />
      )}

      <Tabs defaultValue="controls" className="space-y-4">
        <TabsList>
          <TabsTrigger value="controls">Revalidation Controls</TabsTrigger>
          <TabsTrigger value="history">Operations History</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="explanation">How It Works</TabsTrigger>
        </TabsList>

        <TabsContent value="controls" className="space-y-4">
          {/* リバリデートコントロール */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* パスベースリバリデート */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  Path-based Revalidation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="path-input">Target Path</Label>
                  <Input
                    id="path-input"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    placeholder="/features/caching"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Quick Actions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePathRevalidation("/features/caching")}
                      disabled={isProcessing}
                    >
                      Current Page
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePathRevalidation("/features/data-fetching")}
                      disabled={isProcessing}
                    >
                      Data Fetching
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handlePathRevalidation()}
                  disabled={isProcessing}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Revalidate Path
                </Button>
              </CardContent>
            </Card>

            {/* タグベースリバリデート */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tag-based Revalidation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tag-input">Target Tag</Label>
                  <Input
                    id="tag-input"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="categories"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Available Tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {["categories", "revalidation-demo", "on-demand", "posts"].map((tag) => (
                      <Button
                        key={tag}
                        variant="outline"
                        size="sm"
                        onClick={() => handleTagRevalidation(tag)}
                        disabled={isProcessing}
                        className="text-xs"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleTagRevalidation()}
                  disabled={isProcessing}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Revalidate Tag
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* バックエンド通知シミュレーション */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Backend Notification Simulation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This simulates a backend service triggering cache revalidation after data
                    updates (e.g., CMS updates, database changes).
                  </AlertDescription>
                </Alert>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Backend Data Update Event</p>
                    <p className="text-sm text-muted-foreground">
                      Simulates webhook notification from backend service
                    </p>
                  </div>
                  <Button onClick={handleBackendSimulation} disabled={isProcessing}>
                    <Webhook className="h-4 w-4 mr-2" />
                    Simulate Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 現在のキャッシュ状態 */}
          <Card>
            <CardHeader>
              <CardTitle>Current Cache Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cache Status</p>
                  <Badge variant={initialMetadata?.cached ? "success" : "secondary"}>
                    {initialMetadata?.cached ? "CACHED" : "FRESH"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tags</p>
                  <div className="flex gap-1">
                    {initialMetadata?.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-mono">
                    {initialMetadata?.timestamp
                      ? new Date(initialMetadata.timestamp).toLocaleTimeString()
                      : "Unknown"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Response Time</p>
                  <p className="text-sm font-mono">
                    {initialMetrics?.fetchTime?.toFixed(0) || 0}ms
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Revalidation Operations History</CardTitle>
            </CardHeader>
            <CardContent>
              {operations.length > 0 ? (
                <div className="space-y-3">
                  {operations.map((op) => (
                    <div
                      key={`${op.type}-${op.target}-${op.timestamp}`}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {op.success ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            {op.type === "tag" ? (
                              <Tag className="h-4 w-4" />
                            ) : (
                              <Route className="h-4 w-4" />
                            )}
                            <p className="font-medium">
                              {op.type === "tag" ? "Tag" : "Path"}: {op.target}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(op.timestamp).toLocaleTimeString()}
                            </span>
                            <span>{op.duration?.toFixed(0)}ms</span>
                            <span>by {op.triggeredBy}</span>
                          </div>
                          {op.error && <p className="text-sm text-red-600 mt-1">{op.error}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={op.success ? "success" : "destructive"}>
                          {op.success ? "Success" : "Failed"}
                        </Badge>
                        <Badge variant="outline">{op.strategy}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No revalidation operations yet</p>
                  <p className="text-sm text-muted-foreground">
                    Use the controls above to trigger cache revalidation
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revalidation Strategies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 mt-0.5 text-blue-600" />
                    <div>
                      <p className="font-medium">Tag-based</p>
                      <p className="text-sm text-muted-foreground">
                        Invalidate all cached entries with specific tags
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Route className="h-5 w-5 mt-0.5 text-green-600" />
                    <div>
                      <p className="font-medium">Path-based</p>
                      <p className="text-sm text-muted-foreground">
                        Invalidate specific routes or dynamic segments
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Webhook className="h-5 w-5 mt-0.5 text-purple-600" />
                    <div>
                      <p className="font-medium">Webhook-triggered</p>
                      <p className="text-sm text-muted-foreground">
                        Backend services trigger revalidation via API
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 mt-0.5 text-orange-600" />
                    <div>
                      <p className="font-medium">Time-based</p>
                      <p className="text-sm text-muted-foreground">
                        Automatic revalidation at set intervals
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-green-600" />
                    <p>Use granular tags for selective invalidation</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-green-600" />
                    <p>Implement proper error handling for revalidation</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-green-600" />
                    <p>Monitor revalidation performance and frequency</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-green-600" />
                    <p>Use webhooks for real-time content updates</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-green-600" />
                    <p>Combine time-based and on-demand strategies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="explanation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How On-demand Revalidation Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  1. Triggered Invalidation
                </h4>
                <p className="text-sm text-muted-foreground">
                  Unlike time-based revalidation, on-demand revalidation occurs immediately when
                  triggered by user actions, API calls, or external webhooks.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  2. Selective Cache Invalidation
                </h4>
                <p className="text-sm text-muted-foreground">
                  Tags allow you to invalidate related content across multiple pages. For example,
                  updating a category can invalidate all pages using the &quot;categories&quot; tag.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Webhook className="h-4 w-4" />
                  3. External Integration
                </h4>
                <p className="text-sm text-muted-foreground">
                  Content Management Systems, databases, or other services can trigger revalidation
                  via webhooks when data changes occur.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4. Use Cases</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Content management system updates</li>
                  <li>• E-commerce inventory changes</li>
                  <li>• User-generated content moderation</li>
                  <li>• Real-time data corrections</li>
                  <li>• Emergency content updates</li>
                </ul>
              </div>

              <Alert>
                <RefreshCw className="h-4 w-4" />
                <AlertDescription>
                  <strong>Performance Note:</strong> On-demand revalidation provides the best
                  balance between performance and freshness. Use it for content that needs immediate
                  updates while maintaining the benefits of static generation.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
