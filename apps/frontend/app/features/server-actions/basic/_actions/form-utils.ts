"use server";

// FormDataからオブジェクトに変換するユーティリティ
export function extractFormData(formData: FormData) {
  return {
    title: (formData.get("title") as string) || "",
    content: (formData.get("content") as string) || "",
    slug: (formData.get("slug") as string) || "",
    published: formData.get("published") === "true",
    id: (formData.get("id") as string) || "",
  };
}

// エラーメッセージの生成
export function createErrorResponse(message: string, fieldErrors?: Record<string, string[]>) {
  return {
    error: message,
    fieldErrors,
    success: false,
  };
}

// 成功レスポンスの生成
export function createSuccessResponse(message?: string) {
  return {
    success: true,
    message,
  };
}

// APIエラーのハンドリング
export function handleApiError(error: unknown): { error: string } {
  if (error instanceof Error) {
    console.error("API Error:", error.message);
    return { error: error.message };
  }

  console.error("Unknown API Error:", error);
  return { error: "An unexpected error occurred" };
}

// フェッチリクエストのための共通設定
export function createApiRequest(method: string, data?: unknown) {
  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  return config;
}
