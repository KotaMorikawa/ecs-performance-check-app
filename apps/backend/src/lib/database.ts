import { PrismaClient } from "@prisma/client";

// Prismaクライアントのシングルトンインスタンス
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// データベース接続をテストする関数
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// グレースフルシャットダウン
export async function closeDatabaseConnection(): Promise<void> {
  await prisma.$disconnect();
  console.log("📝 Database connection closed");
}
