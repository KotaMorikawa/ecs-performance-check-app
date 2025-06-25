'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SegmentFeatureInfo } from '@/components/features/segment-feature-info';
import { EnhancedPerformanceDisplay } from '@/components/enhanced-performance-display';
import { CodeDisplay } from '@/components/code-display';
import { PostForm } from '../_components/post-form';
import { PostList } from '../_components/post-list';
import { Activity, Clock, Plus, List, Server, Database, Zap, Save } from 'lucide-react';

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
  serverData,
}: ServerActionsPresentationalProps) {
  const [activeTab, setActiveTab] = useState('create');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [clientRenderTime, setClientRenderTime] = useState<number>(0);
  const [formattedTimestamp, setFormattedTimestamp] = useState<string>('');

  useEffect(() => {
    const startTime = performance.now();
    const endTime = performance.now();

    // クライアントサイドでのみ時刻をフォーマット
    if (serverData.timestamp) {
      setFormattedTimestamp(new Date(serverData.timestamp).toLocaleTimeString());
    }
    setClientRenderTime(endTime - startTime);
  }, [serverData.timestamp]);

  // 編集モードの切り替え
  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setActiveTab('edit');
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setActiveTab('create');
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Server Actions デモ</h1>
        <p className="text-lg text-gray-600">
          Next.js 15.3.4 の Server Actions を使用したサーバーサイドアクション機能
        </p>
      </header>

      {/* パフォーマンスメトリクス */}
      <section className="mb-8">
        <Card data-testid="performance-metrics">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              パフォーマンスメトリクス
            </CardTitle>
            <CardDescription>Server Actions の動作とリアルタイムパフォーマンス測定</CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedPerformanceDisplay />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>クライアントレンダリング: {clientRenderTime.toFixed(2)} ms</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Server className="h-4 w-4 text-muted-foreground" />
                <span>サーバータイムスタンプ: {formattedTimestamp || serverData.timestamp}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span>投稿数: {serverData.postsCount} 件</span>
                <Badge variant="outline" className="ml-1">
                  {serverData.cacheStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Server Actions 機能デモ */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Server Actions デモ
            </CardTitle>
            <CardDescription>
              Progressive Enhancement で動作するフォーム送信とCRUD操作
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  投稿作成
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  投稿一覧
                </TabsTrigger>
                {editingPost && (
                  <TabsTrigger value="edit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    編集中
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="create" className="space-y-4">
                <PostForm mode="create" />
              </TabsContent>

              <TabsContent value="edit" className="space-y-4">
                {editingPost && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">投稿を編集</h3>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        キャンセル
                      </Button>
                    </div>
                    <PostForm mode="edit" post={editingPost} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="list" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">投稿一覧</h3>
                  <Badge variant="secondary">{posts.length} 件の投稿</Badge>
                </div>
                <PostList
                  posts={posts}
                  onEdit={handleEditPost}
                  emptyMessage="まだ投稿がありません。新しい投稿を作成してみましょう。"
                />
              </TabsContent>
            </Tabs>
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
                    <li>• 楽観的更新</li>
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
