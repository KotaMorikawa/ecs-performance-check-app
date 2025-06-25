import { z } from 'zod';

// 投稿フォームのバリデーションスキーマ
export const PostFormSchema = z.object({
  title: z.string()
    .min(1, 'タイトルは必須です')
    .max(200, 'タイトルは200文字以下で入力してください'),
  content: z.string()
    .min(1, 'コンテンツは必須です')
    .max(10000, 'コンテンツは10000文字以下で入力してください'),
  slug: z.string()
    .min(1, 'スラッグは必須です')
    .max(100, 'スラッグは100文字以下で入力してください')
    .regex(/^[a-z0-9-]+$/, 'スラッグは英小文字、数字、ハイフンのみ使用可能です'),
  published: z.boolean().optional().default(false),
});

// 投稿更新用のスキーマ（部分的更新を許可）
export const UpdatePostFormSchema = PostFormSchema.partial();

// 投稿削除用のスキーマ
export const DeletePostSchema = z.object({
  id: z.string().min(1, '投稿IDは必須です'),
});

// フォームの状態管理用の型定義
export type PostFormData = z.infer<typeof PostFormSchema>;
export type UpdatePostFormData = z.infer<typeof UpdatePostFormSchema>;
export type DeletePostData = z.infer<typeof DeletePostSchema>;

// フォームエラーの型定義
export type FormFieldErrors = {
  [K in keyof PostFormData]?: string[];
};

// 削除用のフィールドエラー型
export type DeleteFieldErrors = {
  id?: string[];
};

// Server Actionの結果型（汎用）
export type ActionResult<TFieldErrors = FormFieldErrors> = {
  error?: string;
  fieldErrors?: TFieldErrors;
  success?: boolean;
  message?: string;
};

// useActionState用の状態型
export type ActionState<T = Record<string, unknown>, TFieldErrors = FormFieldErrors> = ActionResult<TFieldErrors> & {
  data?: T;
  timestamp?: number;
};

// 投稿作成用のActionState
export type CreatePostState = ActionState<PostFormData, FormFieldErrors>;

// 投稿更新用のActionState
export type UpdatePostState = ActionState<UpdatePostFormData & { id: string }, FormFieldErrors>;

// 投稿削除用のActionState
export type DeletePostState = ActionState<DeletePostData, DeleteFieldErrors>;

// フォームの初期値
export const DEFAULT_POST_FORM: PostFormData = {
  title: '',
  content: '',
  slug: '',
  published: false,
};

// useActionState用の初期状態
export const INITIAL_CREATE_STATE: CreatePostState = {
  success: false,
};

export const INITIAL_UPDATE_STATE: UpdatePostState = {
  success: false,
};

export const INITIAL_DELETE_STATE: DeletePostState = {
  success: false,
};

// スラッグ生成ユーティリティ
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // 英数字、スペース、ハイフン以外を削除
    .replace(/\s+/g, '-') // スペースをハイフンに変換
    .replace(/-+/g, '-') // 連続するハイフンを単一に
    .replace(/^-|-$/g, ''); // 先頭と末尾のハイフンを削除
}

// フォームバリデーション（クライアント側）
export function validatePostForm(data: Partial<PostFormData>): ActionResult {
  const result = PostFormSchema.safeParse(data);
  
  if (!result.success) {
    return {
      error: 'バリデーションエラーがあります',
      fieldErrors: result.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  return { success: true };
}

