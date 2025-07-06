import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../lib/database.js";
import { getTestPrismaClient } from "../lib/test-database.js";

// 環境に応じてPrismaクライアントを選択
function getPrismaClient() {
  return process.env.NODE_ENV === "test" ? getTestPrismaClient() : prisma;
}

export const postsRoutes = new Hono();

// バリデーションスキーマ
const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  slug: z.string().min(1, "Slug is required"),
  published: z.boolean().optional().default(false),
  authorId: z.number().optional(),
  tagIds: z.array(z.number()).optional().default([]),
});

// GET /api/posts - 投稿一覧取得
postsRoutes.get("/", async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1", 10);
    const limit = parseInt(c.req.query("limit") || "10", 10);
    const publishedOnly = c.req.query("published") === "true";
    const skip = (page - 1) * limit;

    // フィルター条件
    const where = publishedOnly ? { published: true } : {};

    // 投稿一覧を取得（リレーション含む）
    const dbClient = getPrismaClient();
    const [posts, total] = await Promise.all([
      dbClient.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
          tags: {
            select: { id: true, name: true },
          },
        },
      }),
      dbClient.post.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return c.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Posts fetch error:", error);
    return c.json({ success: false, error: "Failed to fetch posts" }, 500);
  }
});

// GET /api/posts/:id - 投稿詳細取得
postsRoutes.get("/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"), 10);

    if (Number.isNaN(id)) {
      return c.json({ success: false, error: "Invalid post ID" }, 400);
    }

    const dbClient = getPrismaClient();
    const post = await dbClient.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        tags: {
          select: { id: true, name: true },
        },
      },
    });

    if (!post) {
      return c.json({ success: false, error: "Post not found" }, 404);
    }

    // ビュー数を増加
    await dbClient.post.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return c.json({
      success: true,
      data: { ...post, views: post.views + 1 },
    });
  } catch (error) {
    console.error("Post fetch error:", error);
    return c.json({ success: false, error: "Failed to fetch post" }, 500);
  }
});

// POST /api/posts - 投稿作成
postsRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { tagIds, ...validatedData } = createPostSchema.parse(body);

    // デフォルトの著者IDを設定（実際のアプリでは認証から取得）
    const authorId = validatedData.authorId || 1;

    const dbClient = getPrismaClient();
    const post = await dbClient.post.create({
      data: {
        ...validatedData,
        authorId,
        tags: {
          connect: tagIds.map((id) => ({ id })),
        },
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        tags: {
          select: { id: true, name: true },
        },
      },
    });

    // Next.jsキャッシュを無効化（リバリデート通知）
    try {
      await fetch(`${process.env.NEXTJS_URL}/api/revalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: "/api/posts",
          secret: process.env.REVALIDATE_SECRET,
        }),
      });
    } catch (revalidateError) {
      console.warn("Revalidation failed:", revalidateError);
    }

    return c.json(
      {
        success: true,
        data: post,
        message: "Post created successfully",
      },
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        400
      );
    }

    console.error("Post creation error:", error);
    return c.json({ success: false, error: "Failed to create post" }, 500);
  }
});

// PUT /api/posts/:id - 投稿更新
postsRoutes.put("/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"), 10);

    if (Number.isNaN(id)) {
      return c.json({ success: false, error: "Invalid post ID" }, 400);
    }

    const body = await c.req.json();
    const { tagIds, ...validatedData } = createPostSchema.partial().parse(body);

    const dbClient = getPrismaClient();
    const existingPost = await dbClient.post.findUnique({ where: { id } });
    if (!existingPost) {
      return c.json({ success: false, error: "Post not found" }, 404);
    }

    // Prisma update用のデータ
    const updateData = { ...validatedData } as Record<string, unknown>;

    if (tagIds !== undefined) {
      updateData.tags = {
        set: [],
        connect: tagIds.map((id) => ({ id })),
      };
    }

    const post = await dbClient.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        tags: {
          select: { id: true, name: true },
        },
      },
    });

    return c.json({
      success: true,
      data: post,
      message: "Post updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        400
      );
    }

    console.error("Post update error:", error);
    return c.json({ success: false, error: "Failed to update post" }, 500);
  }
});

// DELETE /api/posts/:id - 投稿削除
postsRoutes.delete("/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"), 10);

    if (Number.isNaN(id)) {
      return c.json({ success: false, error: "Invalid post ID" }, 400);
    }

    const dbClient = getPrismaClient();
    const existingPost = await dbClient.post.findUnique({ where: { id } });
    if (!existingPost) {
      return c.json({ success: false, error: "Post not found" }, 404);
    }

    await dbClient.post.delete({ where: { id } });

    // Next.jsキャッシュを無効化（リバリデート通知）
    try {
      await fetch(`${process.env.NEXTJS_URL}/api/revalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tag: "getPosts",
          secret: process.env.REVALIDATE_SECRET,
        }),
      });
    } catch (revalidateError) {
      console.warn("Revalidation failed:", revalidateError);
    }

    return c.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Post deletion error:", error);
    return c.json({ success: false, error: "Failed to delete post" }, 500);
  }
});
