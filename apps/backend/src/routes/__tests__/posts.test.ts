import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { getTestPrismaClient } from "../../lib/test-database.js";
import { postsRoutes } from "../posts.js";

// TDD: Posts API の実データベーステスト
describe("Posts API with Database", () => {
  let app: Hono;
  let testUserId: number;
  let testTagIds: number[];
  let prisma: ReturnType<typeof getTestPrismaClient>;

  beforeEach(async () => {
    // テスト用のPrismaクライアントを取得
    prisma = getTestPrismaClient();

    // テスト用のHonoアプリを初期化
    app = new Hono();
    app.route("/api/posts", postsRoutes);

    // デフォルト著者（ID=1）を作成
    const _defaultUser = await prisma.user.create({
      data: {
        id: 1,
        email: "default@example.com",
        name: "Default User",
      },
    });

    // テスト用データを準備
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: "Test User",
      },
    });
    testUserId = testUser.id;

    const testTags = await Promise.all([
      prisma.tag.create({ data: { name: `Test Tag 1 ${Date.now()}` } }),
      prisma.tag.create({ data: { name: `Test Tag 2 ${Date.now()}` } }),
    ]);
    testTagIds = testTags.map((tag) => tag.id);
  });

  // afterEachは不要（setup.tsでbeforeEachによりテストDB全体がリセットされる）

  describe("GET /api/posts", () => {
    it("空の投稿リストを返すべき", async () => {
      const res = await app.request("/api/posts");

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
    });

    it("投稿がある場合は投稿リストを返すべき", async () => {
      // テスト投稿を作成
      await prisma.post.create({
        data: {
          title: "Test Post",
          content: "Test content",
          slug: `test-post-${Date.now()}`,
          published: true,
          authorId: testUserId,
          tags: {
            connect: testTagIds.map((id) => ({ id })),
          },
        },
      });

      const res = await app.request("/api/posts");

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.data[0]).toHaveProperty("title");
      expect(data.data[0]).toHaveProperty("content");
      expect(data.data[0]).toHaveProperty("author");
      expect(data.data[0]).toHaveProperty("tags");
      expect(data.pagination.total).toBeGreaterThan(0);
    });

    it("公開済み投稿のみをフィルタリングできるべき", async () => {
      // 公開済みと非公開の投稿を作成
      await Promise.all([
        prisma.post.create({
          data: {
            title: "Published Post",
            content: "Published content",
            slug: `published-post-${Date.now()}`,
            published: true,
            authorId: testUserId,
          },
        }),
        prisma.post.create({
          data: {
            title: "Draft Post",
            content: "Draft content",
            slug: `draft-post-${Date.now()}`,
            published: false,
            authorId: testUserId,
          },
        }),
      ]);

      const res = await app.request("/api/posts?published=true");

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      data.data.forEach((post) => {
        expect(post.published).toBe(true);
      });
    });

    it("ページネーションが正しく動作すべき", async () => {
      // 複数の投稿を作成
      for (let i = 0; i < 5; i++) {
        await prisma.post.create({
          data: {
            title: `Test Post ${i}`,
            content: `Test content ${i}`,
            slug: `test-post-${i}-${Date.now()}`,
            published: true,
            authorId: testUserId,
          },
        });
      }

      const res = await app.request("/api/posts?page=1&limit=2");

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.length).toBe(2);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(2);
      expect(data.pagination.hasNext).toBe(true);
      expect(data.pagination.hasPrev).toBe(false);
    });
  });

  describe("GET /api/posts/:id", () => {
    it("存在する投稿を取得できるべき", async () => {
      // テスト投稿を作成
      const post = await prisma.post.create({
        data: {
          title: "Test Post",
          content: "Test content",
          slug: `test-post-${Date.now()}`,
          published: true,
          authorId: testUserId,
          tags: {
            connect: testTagIds.map((id) => ({ id })),
          },
        },
      });

      const res = await app.request(`/api/posts/${post.id}`);

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(post.id);
      expect(data.data.title).toBe(post.title);
      expect(data.data.views).toBe(post.views + 1); // ビュー数が増加
      expect(data.data.author).toBeDefined();
      expect(data.data.tags).toBeDefined();
    });

    it("存在しない投稿で404エラーを返すべき", async () => {
      const res = await app.request("/api/posts/99999");

      expect(res.status).toBe(404);

      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Post not found");
    });

    it("無効なIDで400エラーを返すべき", async () => {
      const res = await app.request("/api/posts/invalid-id");

      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid post ID");
    });
  });

  describe("POST /api/posts", () => {
    it("有効なデータで投稿を作成すべき", async () => {
      const postData = {
        title: "Test Post",
        content: "Test content",
        slug: `test-post-${Date.now()}`,
        published: true,
        authorId: testUserId,
        tagIds: testTagIds,
      };

      const res = await app.request("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.title).toBe(postData.title);
      expect(data.data.content).toBe(postData.content);
      expect(data.data.slug).toBe(postData.slug);
      expect(data.data.published).toBe(postData.published);
      expect(data.data.authorId).toBe(postData.authorId);
      expect(data.data.tags.length).toBe(testTagIds.length);
      expect(data.message).toBe("Post created successfully");
      expect(data.data.id).toBeTypeOf("number");
      expect(data.data.createdAt).toBeTypeOf("string");
      expect(data.data.updatedAt).toBeTypeOf("string");
    });

    it("デフォルト著者IDを使用して投稿を作成すべき", async () => {
      const postData = {
        title: "Test Post Without Author",
        content: "Test content",
        slug: `test-post-no-author-${Date.now()}`,
        published: false,
        // authorIdを指定しない
      };

      const res = await app.request("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.authorId).toBe(1); // デフォルト著者ID
    });

    it("無効なデータでバリデーションエラーを返すべき", async () => {
      const invalidData = {
        title: "", // 空のタイトル
        slug: "test",
      };

      const res = await app.request("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Validation error");
      expect(data.details).toBeInstanceOf(Array);
      expect(data.details.length).toBeGreaterThan(0);
    });
  });

  describe("PUT /api/posts/:id", () => {
    it("投稿を更新できるべき", async () => {
      // テスト投稿を作成
      const post = await prisma.post.create({
        data: {
          title: "Original Title",
          content: "Original content",
          slug: `original-post-${Date.now()}`,
          published: false,
          authorId: testUserId,
        },
      });

      const updateData = {
        title: "Updated Title",
        published: true,
      };

      const res = await app.request(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.title).toBe(updateData.title);
      expect(data.data.published).toBe(updateData.published);
      expect(data.data.content).toBe("Original content"); // 変更されていない
      expect(data.message).toBe("Post updated successfully");
    });

    it("存在しない投稿の更新で404エラーを返すべき", async () => {
      const updateData = { title: "Updated Title" };

      const res = await app.request("/api/posts/99999", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      expect(res.status).toBe(404);

      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Post not found");
    });
  });

  describe("DELETE /api/posts/:id", () => {
    it("投稿を削除できるべき", async () => {
      // テスト投稿を作成
      const post = await prisma.post.create({
        data: {
          title: "Post to Delete",
          content: "Content to delete",
          slug: `delete-post-${Date.now()}`,
          published: true,
          authorId: testUserId,
        },
      });

      const res = await app.request(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("Post deleted successfully");

      // 削除されたことを確認
      const deletedPost = await prisma.post.findUnique({
        where: { id: post.id },
      });
      expect(deletedPost).toBeNull();
    });

    it("存在しない投稿の削除で404エラーを返すべき", async () => {
      const res = await app.request("/api/posts/99999", {
        method: "DELETE",
      });

      expect(res.status).toBe(404);

      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Post not found");
    });
  });
});
