import { PrismaClient } from '@prisma/client';

// テスト専用のPrismaクライアント
let testPrisma: PrismaClient | undefined;

export function getTestPrismaClient(): PrismaClient {
  if (!testPrisma) {
    testPrisma = new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5433/appdb_test',
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
    });
  }
  return testPrisma;
}

// テストデータベースの初期化
export async function setupTestDatabase(): Promise<void> {
  const prisma = getTestPrismaClient();
  
  try {
    // データベース接続テスト
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Test database connected successfully');
  } catch (error) {
    console.error('❌ Test database connection failed:', error);
    throw error;
  }
}

// テストデータベースの完全クリーンアップ
export async function cleanupTestDatabase(): Promise<void> {
  const prisma = getTestPrismaClient();
  
  try {
    // 外部キー制約の順序に従って削除
    await prisma.$transaction([
      prisma.performanceMetric.deleteMany(),
      prisma.cacheMetric.deleteMany(),
      prisma.$executeRaw`DELETE FROM "_PostTags"`,
      prisma.post.deleteMany(),
      prisma.tag.deleteMany(),
      prisma.user.deleteMany(),
    ]);
    
    console.log('🧹 Test database cleaned up');
  } catch (error) {
    console.error('❌ Test database cleanup failed:', error);
    throw error;
  }
}

// テストデータベース接続の終了
export async function closeTestDatabase(): Promise<void> {
  if (testPrisma) {
    await testPrisma.$disconnect();
    testPrisma = undefined;
    console.log('📝 Test database connection closed');
  }
}

// テスト用のリセット関数（各テストケースで使用）
export async function resetTestDatabase(): Promise<void> {
  await cleanupTestDatabase();
}