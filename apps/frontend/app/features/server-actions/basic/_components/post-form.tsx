'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Plus } from 'lucide-react';
import { createPostWithState, updatePostWithState } from '../_actions/post-actions';
import {
  generateSlug,
  type PostFormData,
  INITIAL_CREATE_STATE,
  INITIAL_UPDATE_STATE,
} from '../_lib/validation';

interface PostFormProps {
  mode: 'create' | 'edit';
  post?: Post;
  experienceMode?: 'optimistic' | 'traditional' | 'comparison';
  onOptimisticCreate?: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'views'>) => void;
  onOptimisticUpdate?: (post: Post) => void;
}

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

// フォーム送信ボタンコンポーネント（useActionStateのisPendingを使用）
function SubmitButton({ mode, isPending }: { mode: 'create' | 'edit'; isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending} className="w-full">
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {mode === 'create' ? '作成中...' : '更新中...'}
        </>
      ) : (
        <>
          {mode === 'create' ? (
            <Plus className="mr-2 h-4 w-4" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {mode === 'create' ? '投稿を作成' : '投稿を更新'}
        </>
      )}
    </Button>
  );
}

export function PostForm({ mode, post, experienceMode = 'optimistic', onOptimisticCreate, onOptimisticUpdate }: PostFormProps) {
  // experienceModeを使用してフォームの動作を調整
  const isOptimisticMode = experienceMode === 'optimistic' || experienceMode === 'comparison';
  const { toast } = useToast();

  // useActionStateで状態管理
  const [createState, createAction, isCreatePending] = useActionState(
    createPostWithState,
    INITIAL_CREATE_STATE
  );
  const [updateState, updateAction, isUpdatePending] = useActionState(
    updatePostWithState,
    INITIAL_UPDATE_STATE
  );

  // 現在のmode に応じて適切な状態とアクションを選択
  const currentState = mode === 'create' ? createState : updateState;
  const currentAction = mode === 'create' ? createAction : updateAction;
  const isPending = mode === 'create' ? isCreatePending : isUpdatePending;

  const [formData, setFormData] = useState<PostFormData>({
    title: post?.title || '',
    content: post?.content || '',
    slug: post?.slug || '',
    published: post?.published || false,
  });

  const [autoGenerateSlug, setAutoGenerateSlug] = useState(!post?.slug);

  // タイトルからスラッグを自動生成
  useEffect(() => {
    if (autoGenerateSlug && formData.title) {
      const newSlug = generateSlug(formData.title);
      setFormData((prev) => ({ ...prev, slug: newSlug }));
    }
  }, [formData.title, autoGenerateSlug]);

  // Server Actionの結果を監視してトースト通知とフォームリセット
  useEffect(() => {
    if (!currentState.timestamp) return; // 初期状態では何もしない

    if (currentState.success && currentState.message) {
      toast({
        title: '成功',
        description: currentState.message,
      });

      // 作成モードの場合、フォームをリセット
      if (mode === 'create') {
        setFormData({
          title: '',
          content: '',
          slug: '',
          published: false,
        });
        setAutoGenerateSlug(true);
      }
    } else if (currentState.error) {
      toast({
        title: 'エラー',
        description: currentState.error,
        variant: 'destructive',
      });
    }
  }, [currentState, mode, toast]);

  // フォームデータの更新
  const updateFormField = (field: keyof PostFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // スラッグが手動で変更された場合、自動生成を停止
    if (field === 'slug' && typeof value === 'string') {
      setAutoGenerateSlug(value === '');
    }
  };

  // エラー表示（useActionStateの状態から取得）
  const errors = currentState.fieldErrors || {};
  const generalError = currentState.error;

  // 楽観的更新を実行するフォーム送信ハンドラー
  const handleSubmit = () => {
    // 楽観的更新モードの場合のみ実行
    if (!isOptimisticMode) return;
    
    // フォームデータから楽観的更新用のデータを作成
    if (mode === 'create' && onOptimisticCreate) {
      onOptimisticCreate({
        title: formData.title,
        content: formData.content,
        slug: formData.slug,
        published: formData.published,
        author: null,
        tags: [],
      });
    } else if (mode === 'edit' && post && onOptimisticUpdate) {
      onOptimisticUpdate({
        ...post,
        title: formData.title,
        content: formData.content,
        slug: formData.slug,
        published: formData.published,
        updatedAt: new Date().toISOString(),
        views: post.views,
        createdAt: post.createdAt,
        author: null,
        tags: [],
      });
    }
    // formのactionによりServer Actionが実行される
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mode === 'create' ? (
            <>
              <Plus className="h-5 w-5" />
              新しい投稿を作成
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              投稿を編集
            </>
          )}
        </CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'JavaScript無効環境でも動作するServer Actionsフォーム'
            : '投稿内容を更新します'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {generalError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        )}

        <form
          role="form"
          action={currentAction}
          onSubmit={handleSubmit}
          noValidate // クライアント側のHTML5バリデーションを無効化
          className="space-y-6"
        >
          {/* 編集モードの場合はpost IDを送信 */}
          {mode === 'edit' && post && <input type="hidden" name="id" value={post.id} />}
          {/* タイトル */}
          <div className="space-y-2">
            <Label htmlFor="title">
              タイトル <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => updateFormField('title', e.target.value)}
              aria-describedby={errors.title ? 'title-error' : undefined}
              className={errors.title ? 'border-red-500' : ''}
              placeholder="投稿のタイトルを入力してください"
            />
            {errors.title && (
              <div id="title-error" className="text-red-500 text-sm">
                {errors.title[0]}
              </div>
            )}
          </div>

          {/* コンテンツ */}
          <div className="space-y-2">
            <Label htmlFor="content">
              コンテンツ <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              name="content"
              required
              value={formData.content}
              onChange={(e) => updateFormField('content', e.target.value)}
              aria-describedby={errors.content ? 'content-error' : undefined}
              className={errors.content ? 'border-red-500' : ''}
              placeholder="投稿の内容を入力してください"
              rows={6}
            />
            {errors.content && (
              <div id="content-error" className="text-red-500 text-sm">
                {errors.content[0]}
              </div>
            )}
          </div>

          {/* スラッグ */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              スラッグ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              name="slug"
              type="text"
              required
              value={formData.slug}
              onChange={(e) => updateFormField('slug', e.target.value)}
              aria-describedby={errors.slug ? 'slug-error' : 'slug-help'}
              className={errors.slug ? 'border-red-500' : ''}
              placeholder="url-friendly-slug"
            />
            {errors.slug ? (
              <div id="slug-error" className="text-red-500 text-sm">
                {errors.slug[0]}
              </div>
            ) : (
              <div id="slug-help" className="text-gray-500 text-sm">
                英小文字、数字、ハイフンのみ使用可能。タイトルから自動生成されます。
              </div>
            )}
          </div>

          {/* 公開設定 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="published"
              name="published"
              checked={formData.published}
              onCheckedChange={(checked) => updateFormField('published', !!checked)}
              value="true"
            />
            <Label htmlFor="published">公開する</Label>
          </div>

          {/* 送信ボタン */}
          <SubmitButton mode={mode} isPending={isPending} />
        </form>

        {/* Progressive Enhancement の説明 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Progressive Enhancement</h4>
          <p className="text-blue-700 text-sm">
            このフォームはJavaScriptが無効でも動作します。JavaScript有効時は、
            リアルタイムバリデーション、スラッグ自動生成、送信状態表示などの
            追加機能が利用できます。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
