'use client';

import { useState, useOptimistic, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SegmentFeatureInfo } from '@/components/features/segment-feature-info';
import { CodeDisplay } from '@/components/code-display';
import { PostForm } from '../_components/post-form';
import { PostList } from '../_components/post-list';
import { ServerActionsErrorBoundary } from '../_components/error-boundary';
import { usePerformanceMeasurement } from '../_hooks/use-performance-measurement';
import { Activity, Plus, List, Database, Zap, Save } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  content: string;
  slug: string;
  published: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: number;
    name: string | null;
    email: string;
  } | null;
  tags?: {
    id: number;
    name: string;
  }[];
}

interface ServerActionsPresentationalProps {
  posts: Post[];
  serverData: {
    timestamp: string;
    serverRenderTime: number;
    postsCount: number;
    cacheStatus: string;
  };
}

export function ServerActionsPresentational({
  posts,
}: ServerActionsPresentationalProps) {
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // 体験モード状態管理
  const [experienceMode, setExperienceMode] = useState<'optimistic' | 'traditional' | 'comparison'>(
    'optimistic'
  );

  // パフォーマンス測定（リアルタイム統計用）
  const { calculateStats, getTodayStats, operationHistory, latestMetrics, clearHistory } = usePerformanceMeasurement();
  
  // Hydration エラー対策のためクライアント側でマウント後に有効化
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 楽観的更新のためのuseOptimistic（体験モードに応じて適用）
  const [optimisticPosts, addOptimisticPost] = useOptimistic(
    posts,
    experienceMode === 'optimistic' || experienceMode === 'comparison'
      ? (
          state: Post[],
          newPost: Post | { type: 'delete'; id: number } | { type: 'update'; post: Post }
        ) => {
          if ('type' in newPost) {
            if (newPost.type === 'delete') {
              return state.filter((post) => post.id !== newPost.id);
            } else if (newPost.type === 'update') {
              return state.map((post) => (post.id === newPost.post.id ? newPost.post : post));
            }
          }
          // 新規投稿の場合
          const post = newPost as Post;
          return [
            {
              ...post,
              id: Math.floor(Math.random() * 1000000) + state.length, // 一時的なIDを生成
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...state,
          ];
        }
      : (state: Post[]) => state // 従来動作では楽観的更新を無効化
  );


  // 編集モードの切り替え
  const handleEditPost = (post: Post) => {
    setEditingPost(post);
  };

  const handleCancelEdit = useCallback(() => {
    setEditingPost(null);
  }, []);

  const handleEditComplete = useCallback(() => {
    setEditingPost(null);
  }, []);

  // 楽観的更新ハンドラー（体験モードに応じて制御）
  const handleOptimisticCreate = (
    newPost: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'views'>
  ) => {
    if (experienceMode === 'optimistic' || experienceMode === 'comparison') {
      addOptimisticPost({
        ...newPost,
        views: 0,
      } as Post);
    }
  };

  const handleOptimisticUpdate = (updatedPost: Post) => {
    if (experienceMode === 'optimistic' || experienceMode === 'comparison') {
      addOptimisticPost({ type: 'update', post: updatedPost });
    }
  };

  const handleOptimisticDelete = (postId: number) => {
    if (experienceMode === 'optimistic' || experienceMode === 'comparison') {
      addOptimisticPost({ type: 'delete', id: postId });
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Server Actions デモ</h1>
        <p className="text-lg text-gray-600">
          Next.js 15.3.4 の Server Actions を使用したサーバーサイドアクション機能
        </p>
      </header>

      {/* 体験モード切り替えバー */}
      <section className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">🔄 体験モード</CardTitle>
            <CardDescription>Server Actionsの異なる実装方式を体験・比較できます</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant={experienceMode === 'optimistic' ? 'default' : 'outline'}
                onClick={() => setExperienceMode('optimistic')}
                className="flex items-center gap-2 h-auto p-4"
              >
                <span className="text-lg">🚀</span>
                <div className="text-left">
                  <div className="font-semibold">楽観的更新</div>
                  <div className="text-sm opacity-80">瞬時のUI反応</div>
                </div>
              </Button>

              <Button
                variant={experienceMode === 'traditional' ? 'default' : 'outline'}
                onClick={() => setExperienceMode('traditional')}
                className="flex items-center gap-2 h-auto p-4"
              >
                <span className="text-lg">⏳</span>
                <div className="text-left">
                  <div className="font-semibold">従来動作</div>
                  <div className="text-sm opacity-80">サーバー待機型</div>
                </div>
              </Button>

              <Button
                variant={experienceMode === 'comparison' ? 'default' : 'outline'}
                onClick={() => setExperienceMode('comparison')}
                className="flex items-center gap-2 h-auto p-4"
              >
                <span className="text-lg">📊</span>
                <div className="text-left">
                  <div className="font-semibold">比較デモ</div>
                  <div className="text-sm opacity-80">パフォーマンス測定</div>
                </div>
              </Button>
            </div>

            {/* 現在のモード表示 */}
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium">
                現在のモード:{' '}
                {experienceMode === 'optimistic'
                  ? '🚀 楽観的更新 - useOptimistic による瞬時のUI反応'
                  : experienceMode === 'traditional'
                    ? '⏳ 従来動作 - サーバーレスポンス待機型'
                    : '📊 比較デモ - 両方式のパフォーマンス測定'}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Server Actions 機能デモ - 左右分割レイアウト */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Server Actions デモ
            </CardTitle>
            <CardDescription>
              楽観的更新と従来動作の比較体験が可能なインタラクティブデモ
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 左右分割レイアウト */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 左側: 投稿管理エリア */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      📝 投稿管理
                    </CardTitle>
                    <CardDescription>
                      {editingPost ? '投稿を編集中' : '新しい投稿を作成'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* フォーム切り替えボタン */}
                    <div className="flex items-center gap-2 mb-4">
                      {!editingPost ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Plus className="h-3 w-3" />
                          新規作成モード
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Save className="h-3 w-3" />
                            編集モード
                          </Badge>
                          <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                            新規作成に戻る
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* フォームエリア */}
                    <ServerActionsErrorBoundary>
                      <PostForm
                        mode={editingPost ? 'edit' : 'create'}
                        post={editingPost || undefined}
                        experienceMode={experienceMode}
                        onOptimisticCreate={handleOptimisticCreate}
                        onOptimisticUpdate={handleOptimisticUpdate}
                        onEditComplete={handleEditComplete}
                      />
                    </ServerActionsErrorBoundary>
                  </CardContent>
                </Card>

                {/* 下部: リアルタイム比較メトリクス */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        📊 リアルタイム比較
                      </CardTitle>
                      {isClient && operationHistory.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearHistory}
                          className="text-xs"
                        >
                          統計クリア
                        </Button>
                      )}
                    </div>
                    <CardDescription>現在の操作パフォーマンス測定</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const stats = calculateStats();
                      
                      if (stats.totalOperations === 0) {
                        return (
                          <div className="text-center py-8">
                            <div className="text-4xl mb-4">📊</div>
                            <div className="text-lg font-medium text-muted-foreground mb-2">
                              パフォーマンス統計を開始
                            </div>
                            <div className="text-sm text-muted-foreground">
                              フォームから投稿を作成・編集・削除すると、<br />
                              楽観的更新と従来動作の体感速度差が表示されます
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {stats.optimisticAvg}ms
                              </div>
                              <div className="text-sm text-muted-foreground">楽観的更新</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {stats.traditionalAvg}ms
                              </div>
                              <div className="text-sm text-muted-foreground">従来動作</div>
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                            <div>
                              <div className="text-xl font-bold text-blue-600">
                                {stats.improvementRate}%
                              </div>
                              <div className="text-sm text-muted-foreground">体感速度改善</div>
                            </div>
                            <div>
                              <div className="text-xl font-bold text-green-600">
                                {Math.round((operationHistory.filter(m => m.success).length / operationHistory.length) * 100)}%
                              </div>
                              <div className="text-sm text-muted-foreground">成功率</div>
                            </div>
                          </div>
                          <div className="mt-4 text-center text-xs text-muted-foreground">
                            {stats.totalOperations} 回の操作に基づく統計
                            {latestMetrics.length > 0 && (
                              <div className="mt-2">
                                最新: {latestMetrics[0].operation} ({latestMetrics[0].mode}) - {latestMetrics[0].userPerceivedTime}ms
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>

              {/* 右側: 投稿一覧エリア */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <List className="h-5 w-5" />
                        📋 投稿一覧
                      </div>
                      <Badge variant="secondary">{optimisticPosts.length} 件の投稿</Badge>
                    </CardTitle>
                    <CardDescription>リアルタイム更新される投稿データ</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[500px] overflow-y-auto">
                      <ServerActionsErrorBoundary>
                        <PostList
                          posts={optimisticPosts}
                          onEdit={handleEditPost}
                          onOptimisticDelete={handleOptimisticDelete}
                          experienceMode={experienceMode}
                          emptyMessage="まだ投稿がありません。左側のフォームから新しい投稿を作成してみましょう。"
                        />
                      </ServerActionsErrorBoundary>
                    </div>
                  </CardContent>
                </Card>

                {/* 操作統計 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      📊 操作統計
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const todayStats = getTodayStats();
                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                              <div className="text-lg font-bold">{optimisticPosts.length}</div>
                              <div className="text-sm text-muted-foreground">総投稿数</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-green-600">{todayStats.creates}</div>
                              <div className="text-sm text-muted-foreground">今日の作成</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-blue-600">{todayStats.updates}</div>
                              <div className="text-sm text-muted-foreground">今日の編集</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-red-600">{todayStats.deletes}</div>
                              <div className="text-sm text-muted-foreground">今日の削除</div>
                            </div>
                          </div>
                          {isClient && operationHistory.length > 0 && (
                            <div className="text-center text-xs text-muted-foreground border-t pt-2">
                              総操作回数: {operationHistory.length} 回
                              {latestMetrics.length > 0 && (
                                <div className="mt-1">
                                  最新操作: {latestMetrics[0].timestamp.slice(11, 19)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Progressive Enhancement の説明 */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Progressive Enhancement</CardTitle>
            <CardDescription>JavaScript無効環境での動作確認手順</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">動作確認手順</h4>
                <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
                  <li>ブラウザの開発者ツールを開く</li>
                  <li>設定でJavaScriptを無効にする</li>
                  <li>ページをリロードして機能を確認</li>
                  <li>フォーム送信が正常に動作することを確認</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-semibold mb-2">✅ JavaScript有効時</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• リアルタイムバリデーション</li>
                    <li>• スラッグ自動生成</li>
                    <li>• 送信状態表示</li>
                    <li>• 楽観的更新（useOptimistic）</li>
                    <li>• エラーバウンダリーによる例外処理</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h5 className="font-semibold mb-2">✅ JavaScript無効時</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• フォーム送信機能</li>
                    <li>• サーバーサイドバリデーション</li>
                    <li>• ページリダイレクト</li>
                    <li>• 基本的なCRUD操作</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 機能説明セクション */}
      <SegmentFeatureInfo segmentType="server-actions" subType="basic" />

      {/* コード表示セクション */}
      <section className="mb-8">
        <CodeDisplay
          title="Server Actions ソースコード"
          description="Next.js 15.3.4のServer Actionsを使用したCRUD操作とProgressive Enhancement"
          files={[
            {
              filename: '_actions/post-actions.ts',
              language: 'typescript',
              description: "Server Actions定義（'use server'）",
              content: `'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const PostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  slug: z.string().min(1, 'Slug is required'),
  published: z.boolean().optional().default(false),
});

export async function createPost(formData: FormData) {
  const rawFormData = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    slug: formData.get('slug') as string,
    published: formData.get('published') === 'true',
  };

  const validatedFields = PostSchema.safeParse(rawFormData);
  if (!validatedFields.success) {
    return {
      error: 'Validation failed',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const response = await fetch('http://localhost:8000/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedFields.data),
    });

    if (!response.ok) throw new Error('Failed to create post');

    revalidatePath('/features/server-actions/basic');
    redirect('/features/server-actions/basic?success=created');
  } catch (error) {
    return { error: 'Failed to create post. Please try again.' };
  }
}`,
            },
            {
              filename: '_components/post-form.tsx',
              language: 'tsx',
              description: 'Progressive Enhancement対応フォーム',
              content: `'use client';

import { useFormStatus } from 'react-dom';
import { createPost } from '../_actions/post-actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? '作成中...' : '投稿を作成'}
    </Button>
  );
}

export function PostForm() {
  return (
    <form action={createPost} method="POST">
      <input name="title" required />
      <textarea name="content" required />
      <input name="slug" required />
      <SubmitButton />
    </form>
  );
}`,
            },
            {
              filename: '_containers/presentational.tsx',
              language: 'tsx',
              description: 'useOptimistic を使用した楽観的更新',
              content: `'use client';

import { useOptimistic } from 'react';

export function ServerActionsPresentational({ posts, serverData }) {
  // 楽観的更新のためのuseOptimistic
  const [optimisticPosts, addOptimisticPost] = useOptimistic(
    posts,
    (state, newPost) => {
      if ('type' in newPost) {
        if (newPost.type === 'delete') {
          return state.filter(post => post.id !== newPost.id);
        } else if (newPost.type === 'update') {
          return state.map(post => 
            post.id === newPost.post.id ? newPost.post : post
          );
        }
      }
      // 新規投稿の場合
      return [{ ...newPost, id: Math.floor(Math.random() * 1000000) }, ...state];
    }
  );

  const handleOptimisticCreate = (newPost) => {
    addOptimisticPost(newPost);
  };

  return (
    <PostList 
      posts={optimisticPosts} 
      onOptimisticCreate={handleOptimisticCreate} 
    />
  );
}`,
            },
            {
              filename: '_components/error-boundary.tsx',
              language: 'tsx',
              description: 'Server Actions用Error Boundary',
              content: `'use client';

import { Component } from 'react';

export class ServerActionsErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Server Actions Error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error} 
          resetError={this.resetError} 
        />
      );
    }
    return this.props.children;
  }
}`,
            },
            {
              filename: 'page.tsx',
              language: 'tsx',
              description: 'メインページコンポーネント',
              content: `import { ServerActionsContainer } from './_containers/container';

export default function ServerActionsPage({ searchParams }) {
  return <ServerActionsContainer searchParams={searchParams} />;
}`,
            },
          ]}
        />
      </section>
    </div>
  );
}
