"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  type CreatePostState,
  DeletePostSchema,
  type DeletePostState,
  PostFormSchema,
  UpdatePostFormSchema,
  type UpdatePostState,
} from "../_lib/validation";

// ===== useActionState対応のServer Actions =====

// 投稿作成 (useActionState用)
export async function createPostWithState(
  _prevState: CreatePostState,
  formData: FormData
): Promise<CreatePostState> {
  const rawFormData = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    slug: formData.get("slug") as string,
    published: formData.get("published") === "true",
  };

  // バリデーション
  const validatedFields = PostFormSchema.safeParse(rawFormData);
  if (!validatedFields.success) {
    return {
      error: "バリデーションエラーがあります",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
      success: false,
      timestamp: Date.now(),
    };
  }

  try {
    // Hono バックエンドに投稿作成リクエストを送信
    const apiUrl = process.env.API_URL || "http://localhost:8000";
    const response = await fetch(`${apiUrl}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedFields.data),
    });

    if (!response.ok) {
      throw new Error("Failed to create post");
    }

    // Next.jsキャッシュを無効化
    revalidateTag("getPosts");

    // 成功時の状態を返却
    return {
      success: true,
      message: "投稿を作成しました",
      data: validatedFields.data,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Create post error:", error);
    return {
      error: "投稿の作成に失敗しました。もう一度お試しください。",
      success: false,
      timestamp: Date.now(),
    };
  }
}

// 投稿更新 (useActionState用)
export async function updatePostWithState(
  _prevState: UpdatePostState,
  formData: FormData
): Promise<UpdatePostState> {
  const id = formData.get("id") as string;

  if (!id) {
    return {
      error: "投稿IDが必要です",
      success: false,
      timestamp: Date.now(),
    };
  }

  const rawFormData = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    slug: formData.get("slug") as string,
    published: formData.get("published") === "true",
  };

  // 空の値を除外
  const filteredData = Object.fromEntries(
    Object.entries(rawFormData).filter(([, value]) => value !== "" && value !== null)
  );

  // バリデーション
  const validatedFields = UpdatePostFormSchema.safeParse(filteredData);
  if (!validatedFields.success) {
    return {
      error: "バリデーションエラーがあります",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
      success: false,
      timestamp: Date.now(),
    };
  }

  try {
    // Hono バックエンドに投稿更新リクエストを送信
    const apiUrl = process.env.API_URL || "http://localhost:8000";
    const response = await fetch(`${apiUrl}/api/posts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedFields.data),
    });

    if (!response.ok) {
      throw new Error("Failed to update post");
    }

    // Next.jsキャッシュを無効化
    revalidateTag("getPosts");

    // 成功時の状態を返却
    return {
      success: true,
      message: "投稿を更新しました",
      data: { ...validatedFields.data, id },
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Update post error:", error);
    return {
      error: "投稿の更新に失敗しました。もう一度お試しください。",
      success: false,
      timestamp: Date.now(),
    };
  }
}

// 投稿削除 (useActionState用)
export async function deletePostWithState(
  _prevState: DeletePostState,
  formData: FormData
): Promise<DeletePostState> {
  const id = formData.get("id") as string;

  if (!id) {
    return {
      error: "投稿IDが必要です",
      success: false,
      timestamp: Date.now(),
    };
  }

  // バリデーション
  const validatedFields = DeletePostSchema.safeParse({ id });
  if (!validatedFields.success) {
    return {
      error: "バリデーションエラーがあります",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
      success: false,
      timestamp: Date.now(),
    };
  }

  try {
    // Hono バックエンドに投稿削除リクエストを送信
    const apiUrl = process.env.API_URL || "http://localhost:8000";
    console.log(`[Delete Post] Sending delete request to: ${apiUrl}/api/posts/${id}`);

    const response = await fetch(`${apiUrl}/api/posts/${id}`, {
      method: "DELETE",
    });

    console.log(`[Delete Post] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Delete Post] API Error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to delete post: ${response.status}`);
    }

    // Next.jsキャッシュを無効化
    console.log("[Delete Post] Invalidating cache...");
    revalidateTag("getPosts");
    revalidatePath("/features/server-actions/basic");
    console.log("[Delete Post] Cache invalidated successfully");

    // 成功時の状態を返却
    return {
      success: true,
      message: "投稿を削除しました",
      data: validatedFields.data,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Delete post error:", error);
    return {
      error: "投稿の削除に失敗しました。もう一度お試しください。",
      success: false,
      timestamp: Date.now(),
    };
  }
}
