"use client";

import { List, Plus, Save, Zap } from "lucide-react";
import { useCallback, useOptimistic, useState } from "react";
import { CodeDisplay } from "@/components/code-display";
import { SegmentFeatureInfo } from "@/components/features/segment-feature-info";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ServerActionsErrorBoundary } from "../_components/error-boundary";
import { PostForm } from "../_components/post-form";
import { PostList } from "../_components/post-list";

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
}

export function ServerActionsPresentational({ posts }: ServerActionsPresentationalProps) {
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // 楽観的更新のためのuseOptimistic
  const [optimisticPosts, addOptimisticPost] = useOptimistic(
    posts,
    (
      state: Post[],
      newPost: Post | { type: "delete"; id: number } | { type: "update"; post: Post }
    ) => {
      if ("type" in newPost) {
        if (newPost.type === "delete") {
          return state.filter((post) => post.id !== newPost.id);
        } else if (newPost.type === "update") {
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

  // 楽観的更新ハンドラー
  const handleOptimisticCreate = (
    newPost: Omit<Post, "id" | "createdAt" | "updatedAt" | "views">
  ) => {
    addOptimisticPost({
      ...newPost,
      views: 0,
    } as Post);
  };

  const handleOptimisticUpdate = (updatedPost: Post) => {
    addOptimisticPost({ type: "update", post: updatedPost });
  };

  const handleOptimisticDelete = (postId: number) => {
    addOptimisticPost({ type: "delete", id: postId });
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Server Actions デモ</h1>
        <p className="text-lg text-gray-600">
          Next.js 15.3.4 の Server Actions と useOptimistic による楽観的更新のデモ
        </p>
      </header>

      {/* Server Actions 機能デモ - 左右分割レイアウト */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Server Actions デモ
            </CardTitle>
            <CardDescription>
              useOptimistic による楽観的更新を体験できるインタラクティブデモ
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
                      <Plus className="h-5 w-5" />📝 投稿管理
                    </CardTitle>
                    <CardDescription>
                      {editingPost ? "投稿を編集中" : "新しい投稿を作成"}
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
                        mode={editingPost ? "edit" : "create"}
                        post={editingPost || undefined}
                        onOptimisticCreate={handleOptimisticCreate}
                        onOptimisticUpdate={handleOptimisticUpdate}
                        onEditComplete={handleEditComplete}
                      />
                    </ServerActionsErrorBoundary>
                  </CardContent>
                </Card>
              </div>

              {/* 右側: 投稿一覧エリア */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <List className="h-5 w-5" />📋 投稿一覧
                      </div>
                      <Badge variant="secondary">{optimisticPosts.length} 件の投稿</Badge>
                    </CardTitle>
                    <CardDescription>楽観的更新でリアルタイム更新される投稿データ</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[500px] overflow-y-auto">
                      <ServerActionsErrorBoundary>
                        <PostList
                          posts={optimisticPosts}
                          onEdit={handleEditPost}
                          onOptimisticDelete={handleOptimisticDelete}
                          emptyMessage="まだ投稿がありません。左側のフォームから新しい投稿を作成してみましょう。"
                        />
                      </ServerActionsErrorBoundary>
                    </div>
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
              filename: "_actions/post-actions.ts",
              language: "typescript",
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
              filename: "_components/post-form.tsx",
              language: "tsx",
              description: "Progressive Enhancement対応フォーム",
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
              filename: "_containers/presentational.tsx",
              language: "tsx",
              description: "useOptimistic を使用した楽観的更新",
              content: `'use client';

import { useState, useOptimistic } from 'react';

export function ServerActionsPresentational({ posts }) {
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
      return [{ 
        ...newPost, 
        id: Math.floor(Math.random() * 1000000),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, ...state];
    }
  );

  const handleOptimisticCreate = (newPost) => {
    addOptimisticPost({ ...newPost, views: 0 });
  };

  const handleOptimisticUpdate = (updatedPost) => {
    addOptimisticPost({ type: 'update', post: updatedPost });
  };

  const handleOptimisticDelete = (postId) => {
    addOptimisticPost({ type: 'delete', id: postId });
  };

  return (
    <div>
      <PostForm onOptimisticCreate={handleOptimisticCreate} />
      <PostList 
        posts={optimisticPosts} 
        onOptimisticDelete={handleOptimisticDelete} 
      />
    </div>
  );
}`,
            },
            {
              filename: "_components/error-boundary.tsx",
              language: "tsx",
              description: "Server Actions用Error Boundary",
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
              filename: "page.tsx",
              language: "tsx",
              description: "メインページコンポーネント",
              content: `import { ServerActionsContainer } from './_containers/container';

export default function ServerActionsPage() {
  return <ServerActionsContainer />;
}`,
            },
          ]}
        />
      </section>
    </div>
  );
}
