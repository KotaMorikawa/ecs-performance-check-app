import { Hono } from 'hono';

export const cacheTestRoutes = new Hono();

// キャッシュテスト用のモックデータ生成
function generateTestData(count = 10) {
  const categories = ['technology', 'science', 'business', 'health', 'entertainment'];
  const data = [];
  
  for (let i = 1; i <= count; i++) {
    data.push({
      id: i,
      title: `Test Item ${i} - ${new Date().toISOString()}`,
      content: `This is test content for item ${i}. Generated at ${new Date().toISOString()}.`,
      category: categories[Math.floor(Math.random() * categories.length)],
      timestamp: new Date().toISOString(),
      size: Math.floor(Math.random() * 10000) + 1000, // 1KB-10KB
      views: Math.floor(Math.random() * 1000),
    });
  }
  
  return data;
}

// GET /api/cache-test/data - キャッシュテストデータ取得
cacheTestRoutes.get('/data', async (c) => {
  try {
    // ランダムな遅延を追加（50-200ms）
    const delay = Math.floor(Math.random() * 150) + 50;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const data = generateTestData(10);
    
    // キャッシュヘッダーを設定
    c.header('Cache-Control', 'max-age=60, s-maxage=60');
    c.header('X-Response-Time', delay.toString());
    
    return c.json({
      success: true,
      data,
      metadata: {
        count: data.length,
        generatedAt: new Date().toISOString(),
        responseTime: delay,
      },
    });
  } catch (error) {
    console.error('Cache test data error:', error);
    return c.json({ success: false, error: 'Failed to generate test data' }, 500);
  }
});

// GET /api/cache-test/data/:id - 特定アイテム取得
cacheTestRoutes.get('/data/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid ID' }, 400);
    }
    
    const delay = Math.floor(Math.random() * 100) + 30;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const item = {
      id,
      title: `Test Item ${id} - ${new Date().toISOString()}`,
      content: `Detailed content for item ${id}. This represents a single cached item.`,
      category: 'technology',
      timestamp: new Date().toISOString(),
      size: Math.floor(Math.random() * 5000) + 2000,
      views: Math.floor(Math.random() * 500),
    };
    
    c.header('Cache-Control', 'max-age=300, s-maxage=300'); // 5分キャッシュ
    
    return c.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Cache test item error:', error);
    return c.json({ success: false, error: 'Failed to fetch item' }, 500);
  }
});

// GET /api/cache-test/category/:category - カテゴリ別データ
cacheTestRoutes.get('/category/:category', async (c) => {
  try {
    const category = c.req.param('category');
    const validCategories = ['technology', 'science', 'business', 'health', 'entertainment'];
    
    if (!validCategories.includes(category)) {
      return c.json({ success: false, error: 'Invalid category' }, 400);
    }
    
    const delay = Math.floor(Math.random() * 100) + 40;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const allData = generateTestData(20);
    const filteredData = allData.filter(item => item.category === category);
    
    c.header('Cache-Control', 'max-age=120, s-maxage=120'); // 2分キャッシュ
    
    return c.json({
      success: true,
      data: filteredData,
      metadata: {
        category,
        count: filteredData.length,
        totalCount: allData.length,
      },
    });
  } catch (error) {
    console.error('Cache test category error:', error);
    return c.json({ success: false, error: 'Failed to fetch category data' }, 500);
  }
});

// GET /api/cache-test/realtime - リアルタイムデータ（キャッシュなし）
cacheTestRoutes.get('/realtime', async (c) => {
  try {
    const data = generateTestData(5);
    
    // キャッシュを無効化
    c.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    c.header('Pragma', 'no-cache');
    c.header('Expires', '0');
    
    return c.json({
      success: true,
      data,
      metadata: {
        realtime: true,
        timestamp: new Date().toISOString(),
        message: 'This data is never cached',
      },
    });
  } catch (error) {
    console.error('Cache test realtime error:', error);
    return c.json({ success: false, error: 'Failed to fetch realtime data' }, 500);
  }
});

// POST /api/cache-test/invalidate - キャッシュ無効化トリガー
cacheTestRoutes.post('/invalidate', async (c) => {
  try {
    const body = await c.req.json();
    const { type, target } = body;
    
    // Next.jsのリバリデートAPIを呼び出し
    if (process.env.NEXTJS_URL && process.env.REVALIDATE_SECRET) {
      const revalidateUrl = `${process.env.NEXTJS_URL}/api/revalidate`;
      
      const payload = type === 'path' 
        ? { path: target, secret: process.env.REVALIDATE_SECRET }
        : { tag: target, secret: process.env.REVALIDATE_SECRET };
      
      const response = await fetch(revalidateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Revalidation failed');
      }
      
      const result = await response.json();
      
      return c.json({
        success: true,
        message: 'Cache invalidated successfully',
        details: result,
      });
    }
    
    return c.json({
      success: false,
      error: 'Revalidation not configured',
    }, 503);
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return c.json({ success: false, error: 'Failed to invalidate cache' }, 500);
  }
});