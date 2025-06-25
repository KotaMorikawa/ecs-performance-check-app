import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: [process.env.NEXTJS_URL || 'http://localhost:3000'],
  credentials: true,
}));

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'hono-backend',
    version: process.env.npm_package_version || '0.1.0',
    database: 'connected', // TODO: 実際のDB接続状態をチェック
  });
});

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'ECS Performance Check Backend API',
    endpoints: [
      '/health',
      '/api/posts',
      '/api/cache-test',
      '/api/revalidate',
    ],
  });
});

// Revalidate endpoint (Next.jsキャッシュ無効化用)
app.post('/api/revalidate', async (c) => {
  const { path, tag, secret } = await c.req.json();
  
  // シークレットの検証
  if (secret !== process.env.REVALIDATE_SECRET) {
    return c.json({ error: 'Invalid secret' }, 401);
  }

  try {
    // Next.jsのrevalidate APIを呼び出し
    const response = await fetch(`${process.env.NEXTJS_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path, tag, secret }),
    });

    const result = await response.json() as Record<string, unknown>;
    return c.json(result);
  } catch (error) {
    console.error('Revalidation error:', error);
    return c.json({ error: 'Failed to revalidate' }, 500);
  }
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ error: 'Internal Server Error' }, 500);
});

const port = parseInt(process.env.PORT || '8000', 10);

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});