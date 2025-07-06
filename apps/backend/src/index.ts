import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { closeDatabaseConnection, testDatabaseConnection } from "./lib/database.js";
import { cacheTestRoutes } from "./routes/cache-test.js";
import { categoriesRoutes } from "./routes/categories.js";
import { dashboardStatsRoutes } from "./routes/dashboard-stats.js";
import { postsRoutes } from "./routes/posts.js";
import { userProfileRoutes } from "./routes/user-profile.js";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: [process.env.NEXTJS_URL || "http://localhost:3000"],
    credentials: true,
  })
);

// Health check endpoint
app.get("/health", async (c) => {
  const dbStatus = await testDatabaseConnection();

  return c.json({
    status: dbStatus ? "ok" : "error",
    timestamp: new Date().toISOString(),
    service: "hono-backend",
    version: process.env.npm_package_version || "0.1.0",
    database: dbStatus ? "connected" : "disconnected",
  });
});

// API routes
app.route("/api/posts", postsRoutes);
app.route("/api/categories", categoriesRoutes);
app.route("/api/user-profile", userProfileRoutes);
app.route("/api/dashboard-stats", dashboardStatsRoutes);
app.route("/api/cache-test", cacheTestRoutes);

// Root endpoint
app.get("/", (c) => {
  return c.json({
    message: "ECS Performance Check Backend API",
    endpoints: [
      "/health",
      "/api/posts",
      "/api/categories",
      "/api/user-profile",
      "/api/dashboard-stats",
      "/api/cache-test",
      "/api/revalidate",
    ],
  });
});

// Revalidate endpoint (Next.jsキャッシュ無効化用)
app.post("/api/revalidate", async (c) => {
  const { path, tag, secret } = await c.req.json();

  // シークレットの検証
  if (secret !== process.env.REVALIDATE_SECRET) {
    return c.json({ error: "Invalid secret" }, 401);
  }

  try {
    // Next.jsのrevalidate APIを呼び出し
    const response = await fetch(`${process.env.NEXTJS_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path, tag, secret }),
    });

    const result = (await response.json()) as Record<string, unknown>;
    return c.json(result);
  } catch (error) {
    console.error("Revalidation error:", error);
    return c.json({ error: "Failed to revalidate" }, 500);
  }
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ error: "Internal Server Error" }, 500);
});

const port = parseInt(process.env.PORT || "8000", 10);

// データベース接続テスト
testDatabaseConnection().then(() => {
  console.log(`Server is running on port ${port}`);
});

// グレースフルシャットダウン
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await closeDatabaseConnection();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await closeDatabaseConnection();
  process.exit(0);
});

serve({
  fetch: app.fetch,
  port,
});
