import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { postsRoutes } from '../posts.js';

// TDD: Posts API の基本テスト
describe('Posts API', () => {
  let app: Hono;

  beforeEach(async () => {
    // テスト用のHonoアプリを初期化
    app = new Hono();
    
    // posts ルートを追加
    app.route('/api/posts', postsRoutes);
  });

  describe('GET /api/posts', () => {
    it('空の投稿リストを返すべき', async () => {
      const res = await app.request('/api/posts');
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
      expect(data.pagination.total).toBe(0);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
    });
  });

  describe('POST /api/posts', () => {
    it('有効なデータで投稿を作成すべき', async () => {
      const postData = {
        title: 'Test Post',
        content: 'Test content',
        slug: 'test-post',
        published: true,
      };

      const res = await app.request('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      
      expect(res.status).toBe(201);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.title).toBe(postData.title);
      expect(data.data.content).toBe(postData.content);
      expect(data.data.slug).toBe(postData.slug);
      expect(data.data.published).toBe(postData.published);
      expect(data.message).toBe('Post created successfully');
      expect(data.data.id).toBeTypeOf('number');
      expect(data.data.createdAt).toBeTypeOf('string');
      expect(data.data.updatedAt).toBeTypeOf('string');
    });

    it('無効なデータでバリデーションエラーを返すべき', async () => {
      const invalidData = {
        title: '', // 空のタイトル
        slug: 'test',
      };

      const res = await app.request('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });
      
      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation error');
      expect(data.details).toBeInstanceOf(Array);
      expect(data.details.length).toBeGreaterThan(0);
    });
  });
});