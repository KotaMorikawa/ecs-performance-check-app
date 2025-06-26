import { Hono } from 'hono';
import { z } from 'zod';
import { prisma } from '../lib/database.js';
import { getTestPrismaClient } from '../lib/test-database.js';

// 環境に応じてPrismaクライアントを選択
function getPrismaClient() {
  return process.env.NODE_ENV === 'test' ? getTestPrismaClient() : prisma;
}

export const categoriesRoutes = new Hono();

// バリデーションスキーマ
const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional().default(''),
});

// GET /api/categories - カテゴリ一覧取得
categoriesRoutes.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const dbClient = getPrismaClient();
    const [categories, total] = await Promise.all([
      dbClient.category.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { posts: true },
          },
        },
      }),
      dbClient.category.count(),
    ]);

    // postCountフィールドを追加
    const categoriesWithPostCount = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      postCount: category._count.posts,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    }));

    const totalPages = Math.ceil(total / limit);

    return c.json({
      success: true,
      data: categoriesWithPostCount,
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
    console.error('Categories fetch error:', error);
    return c.json({ success: false, error: 'Failed to fetch categories' }, 500);
  }
});

// GET /api/categories/:id - カテゴリ詳細取得
categoriesRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid category ID' }, 400);
    }

    const dbClient = getPrismaClient();
    const category = await dbClient.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!category) {
      return c.json({ success: false, error: 'Category not found' }, 404);
    }

    const categoryWithPostCount = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      postCount: category._count.posts,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };

    return c.json({
      success: true,
      data: categoryWithPostCount,
    });
  } catch (error) {
    console.error('Category fetch error:', error);
    return c.json({ success: false, error: 'Failed to fetch category' }, 500);
  }
});

// GET /api/categories/:slug/posts - カテゴリ別投稿取得
categoriesRoutes.get('/:slug/posts', async (c) => {
  try {
    const slug = c.req.param('slug');
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const dbClient = getPrismaClient();
    
    // まずカテゴリを確認
    const category = await dbClient.category.findUnique({
      where: { slug },
    });

    if (!category) {
      return c.json({ success: false, error: 'Category not found' }, 404);
    }

    // カテゴリに属する投稿を取得
    const [posts, total] = await Promise.all([
      dbClient.post.findMany({
        where: {
          categories: {
            some: { id: category.id },
          },
          published: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
          categories: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      dbClient.post.count({
        where: {
          categories: {
            some: { id: category.id },
          },
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
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
    });
  } catch (error) {
    console.error('Category posts fetch error:', error);
    return c.json({ success: false, error: 'Failed to fetch category posts' }, 500);
  }
});

// POST /api/categories - カテゴリ作成
categoriesRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createCategorySchema.parse(body);

    const dbClient = getPrismaClient();
    
    // 同じslugが存在しないかチェック
    const existingCategory = await dbClient.category.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingCategory) {
      return c.json({ 
        success: false, 
        error: 'Category with this slug already exists' 
      }, 400);
    }

    const category = await dbClient.category.create({
      data: validatedData,
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    const categoryWithPostCount = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      postCount: category._count.posts,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };

    // Next.jsキャッシュを無効化
    try {
      await fetch(`${process.env.NEXTJS_URL}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tag: 'categories',
          secret: process.env.REVALIDATE_SECRET,
        }),
      });
    } catch (revalidateError) {
      console.warn('Revalidation failed:', revalidateError);
    }

    return c.json({
      success: true,
      data: categoryWithPostCount,
      message: 'Category created successfully',
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        success: false, 
        error: 'Validation error', 
        details: error.errors 
      }, 400);
    }
    
    console.error('Category creation error:', error);
    return c.json({ success: false, error: 'Failed to create category' }, 500);
  }
});