import { Hono } from 'hono';
import { z } from 'zod';

export const postsRoutes = new Hono();

// バリデーションスキーマ
const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  slug: z.string().min(1, 'Slug is required'),
  published: z.boolean().optional().default(false),
});

// GET /api/posts - 投稿一覧取得
postsRoutes.get('/', async (c) => {
  try {
    // まだデータベース接続がないので、空の配列を返す
    const posts: any[] = [];
    
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '10', 10);
    const total = posts.length;
    const totalPages = Math.ceil(total / limit);

    return c.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Posts fetch error:', error);
    return c.json({ success: false, error: 'Failed to fetch posts' }, 500);
  }
});

// POST /api/posts - 投稿作成
postsRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createPostSchema.parse(body);

    // まだデータベース接続がないので、モックレスポンスを返す
    const mockPost = {
      id: Date.now(), // 仮のID
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return c.json({
      success: true,
      data: mockPost,
      message: 'Post created successfully',
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        success: false, 
        error: 'Validation error', 
        details: error.errors 
      }, 400);
    }
    
    console.error('Post creation error:', error);
    return c.json({ success: false, error: 'Failed to create post' }, 500);
  }
});