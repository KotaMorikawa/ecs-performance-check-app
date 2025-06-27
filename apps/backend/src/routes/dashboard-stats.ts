import { Hono } from 'hono';
import { prisma } from '../lib/database.js';
import { getTestPrismaClient } from '../lib/test-database.js';

// 環境に応じてPrismaクライアントを選択
function getPrismaClient() {
  return process.env.NODE_ENV === 'test' ? getTestPrismaClient() : prisma;
}

export const dashboardStatsRoutes = new Hono();

// GET /api/dashboard-stats - 基本統計取得
dashboardStatsRoutes.get('/', async (c) => {
  try {
    const dbClient = getPrismaClient();
    
    // 基本統計を並列取得
    const [
      totalPosts,
      totalUsers,
      totalCategories,
      totalViews,
      recentPosts,
      popularCategories,
      userGrowthData,
    ] = await Promise.all([
      // 総投稿数
      dbClient.post.count({ where: { published: true } }),
      
      // 総ユーザー数
      dbClient.user.count(),
      
      // 総カテゴリ数
      dbClient.category.count(),
      
      // 総ビュー数
      dbClient.post.aggregate({
        where: { published: true },
        _sum: { views: true },
      }),
      
      // 過去7日の投稿数
      dbClient.post.count({
        where: {
          published: true,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      
      // 人気カテゴリ（投稿数順）
      dbClient.category.findMany({
        take: 5,
        include: {
          _count: {
            select: { posts: true },
          },
        },
        orderBy: {
          posts: {
            _count: 'desc',
          },
        },
      }),
      
      // ユーザー成長データ（過去6ヶ月）
      getUserGrowthData(dbClient),
    ]);

    const dashboardStats = {
      totalPosts,
      totalUsers,
      totalCategories,
      totalViews: totalViews._sum.views || 0,
      recentPosts,
      popularCategories: popularCategories.map(cat => ({
        name: cat.name,
        count: cat._count.posts,
      })),
      userGrowth: userGrowthData,
      lastUpdated: new Date().toISOString(),
    };

    return c.json({
      success: true,
      data: dashboardStats,
    });
  } catch (error) {
    console.error('Dashboard stats fetch error:', error);
    return c.json({ success: false, error: 'Failed to fetch dashboard stats' }, 500);
  }
});

// GET /api/dashboard-stats/realtime - リアルタイム統計取得
dashboardStatsRoutes.get('/realtime', async (c) => {
  try {
    const dbClient = getPrismaClient();
    
    // リアルタイムデータ（キャッシュしない）
    const [
      onlineUsers,
      todayPosts,
      todayViews,
      recentActivity,
    ] = await Promise.all([
      // アクティブユーザー数（過去1時間以内）
      dbClient.user.count({
        where: {
          lastActiveAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000),
          },
        },
      }),
      
      // 今日の投稿数
      dbClient.post.count({
        where: {
          published: true,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      
      // 今日のビュー数
      dbClient.post.aggregate({
        where: {
          published: true,
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        _sum: { views: true },
      }),
      
      // 最近のアクティビティ
      getRecentActivity(dbClient),
    ]);

    const realtimeStats = {
      onlineUsers,
      todayPosts,
      todayViews: todayViews._sum.views || 0,
      recentActivity,
      lastUpdated: new Date().toISOString(),
    };

    return c.json({
      success: true,
      data: realtimeStats,
    });
  } catch (error) {
    console.error('Realtime stats fetch error:', error);
    return c.json({ success: false, error: 'Failed to fetch realtime stats' }, 500);
  }
});

// GET /api/dashboard-stats/performance - パフォーマンス統計
dashboardStatsRoutes.get('/performance', async (c) => {
  try {
    const dbClient = getPrismaClient();
    
    // パフォーマンス関連統計
    const [
      popularPosts,
      topAuthors,
      categoryDistribution,
    ] = await Promise.all([
      // 人気投稿（ビュー数順）
      dbClient.post.findMany({
        where: { published: true },
        take: 10,
        orderBy: { views: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          views: true,
          createdAt: true,
          author: {
            select: { name: true },
          },
        },
      }),
      
      // トップ著者（投稿数順）
      dbClient.user.findMany({
        take: 5,
        include: {
          _count: {
            select: { posts: true },
          },
        },
        orderBy: {
          posts: {
            _count: 'desc',
          },
        },
      }),
      
      // カテゴリ分布
      dbClient.category.findMany({
        include: {
          _count: {
            select: { posts: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    const performanceStats = {
      popularPosts: popularPosts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        views: post.views,
        author: post.author?.name || 'Unknown',
        createdAt: post.createdAt.toISOString(),
      })),
      topAuthors: topAuthors.map(author => ({
        id: author.id,
        name: author.name,
        postCount: author._count.posts,
      })),
      categoryDistribution: categoryDistribution.map(cat => ({
        name: cat.name,
        slug: cat.slug,
        postCount: cat._count.posts,
      })),
      lastUpdated: new Date().toISOString(),
    };

    return c.json({
      success: true,
      data: performanceStats,
    });
  } catch (error) {
    console.error('Performance stats fetch error:', error);
    return c.json({ success: false, error: 'Failed to fetch performance stats' }, 500);
  }
});

// ヘルパー関数：ユーザー成長データ取得
async function getUserGrowthData(dbClient: any) {
  const months = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const count = await dbClient.user.count({
      where: {
        createdAt: {
          gte: date,
          lt: nextDate,
        },
      },
    });
    
    months.push({
      period: date.toISOString().slice(0, 7), // YYYY-MM形式
      count,
    });
  }
  
  return months;
}

// ヘルパー関数：最近のアクティビティ取得
async function getRecentActivity(dbClient: any) {
  const [recentPosts, recentUsers] = await Promise.all([
    // 最新投稿
    dbClient.post.findMany({
      where: { published: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        author: {
          select: { name: true },
        },
      },
    }),
    
    // 新規ユーザー
    dbClient.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    recentPosts: recentPosts.map((post: any) => ({
      type: 'post',
      id: post.id,
      title: post.title,
      author: post.author?.name || 'Unknown',
      createdAt: post.createdAt.toISOString(),
    })),
    recentUsers: recentUsers.map((user: any) => ({
      type: 'user',
      id: user.id,
      name: user.name || 'Unknown',
      createdAt: user.createdAt.toISOString(),
    })),
  };
}