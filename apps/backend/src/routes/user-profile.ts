import { Hono } from 'hono';
import { z } from 'zod';
import { prisma } from '../lib/database.js';
import { getTestPrismaClient } from '../lib/test-database.js';

// 環境に応じてPrismaクライアントを選択
function getPrismaClient() {
  return process.env.NODE_ENV === 'test' ? getTestPrismaClient() : prisma;
}

export const userProfileRoutes = new Hono();

// バリデーションスキーマ
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  bio: z.string().optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

// GET /api/user-profile/current - 現在のユーザープロフィール取得
userProfileRoutes.get('/current', async (c) => {
  try {
    const dbClient = getPrismaClient();
    
    // 実際のアプリでは認証トークンからユーザーIDを取得
    // デモでは固定のユーザーID（1）を使用
    const userId = 1;

    const user = await dbClient.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      role: user.role,
      postCount: user._count.posts,
      lastActiveAt: user.lastActiveAt?.toISOString() || new Date().toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    // 最終アクティブ時間を更新
    await dbClient.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
    });

    return c.json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error('Current user profile fetch error:', error);
    return c.json({ success: false, error: 'Failed to fetch user profile' }, 500);
  }
});

// GET /api/user-profile/:id - 指定ユーザープロフィール取得
userProfileRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid user ID' }, 400);
    }

    const dbClient = getPrismaClient();
    const user = await dbClient.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
        posts: {
          where: { published: true },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            createdAt: true,
            views: true,
          },
        },
      },
    });

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      role: user.role,
      postCount: user._count.posts,
      lastActiveAt: user.lastActiveAt?.toISOString() || user.createdAt.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      recentPosts: user.posts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        views: post.views,
        createdAt: post.createdAt.toISOString(),
      })),
    };

    return c.json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error('User profile fetch error:', error);
    return c.json({ success: false, error: 'Failed to fetch user profile' }, 500);
  }
});

// PUT /api/user-profile/:id - ユーザープロフィール更新
userProfileRoutes.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid user ID' }, 400);
    }

    const body = await c.req.json();
    const validatedData = updateProfileSchema.parse(body);

    const dbClient = getPrismaClient();
    
    // ユーザーが存在するかチェック
    const existingUser = await dbClient.user.findUnique({ where: { id } });
    if (!existingUser) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // プロフィールを更新
    const updatedUser = await dbClient.user.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    const userProfile = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      postCount: updatedUser._count.posts,
      lastActiveAt: updatedUser.lastActiveAt?.toISOString() || new Date().toISOString(),
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };

    // Next.jsキャッシュを無効化
    try {
      await fetch(`${process.env.NEXTJS_URL}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tag: 'user-profile',
          secret: process.env.REVALIDATE_SECRET,
        }),
      });
    } catch (revalidateError) {
      console.warn('Revalidation failed:', revalidateError);
    }

    return c.json({
      success: true,
      data: userProfile,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        success: false, 
        error: 'Validation error', 
        details: error.errors 
      }, 400);
    }
    
    console.error('Profile update error:', error);
    return c.json({ success: false, error: 'Failed to update profile' }, 500);
  }
});

// GET /api/user-profile/:id/posts - ユーザーの投稿一覧
userProfileRoutes.get('/:id/posts', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '10', 10);
    const skip = (page - 1) * limit;
    
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid user ID' }, 400);
    }

    const dbClient = getPrismaClient();
    
    // ユーザーが存在するかチェック
    const user = await dbClient.user.findUnique({ where: { id } });
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const [posts, total] = await Promise.all([
      dbClient.post.findMany({
        where: { 
          authorId: id,
          published: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          categories: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      dbClient.post.count({
        where: { 
          authorId: id,
          published: true,
        },
      }),
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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('User posts fetch error:', error);
    return c.json({ success: false, error: 'Failed to fetch user posts' }, 500);
  }
});