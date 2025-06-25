/**
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import {
  PostFormSchema,
  UpdatePostFormSchema,
  generateSlug,
  validatePostForm,
} from '../_lib/validation';

describe('Post Validation Utils', () => {
  describe('PostFormSchema', () => {
    it('should validate valid post data', () => {
      const validData = {
        title: 'Test Post',
        content: 'This is test content',
        slug: 'test-post',
        published: true,
      };

      const result = PostFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject empty required fields', () => {
      const invalidData = {
        title: '',
        content: '',
        slug: '',
        published: false,
      };

      const result = PostFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        expect(fieldErrors.title).toContain('タイトルは必須です');
        expect(fieldErrors.content).toContain('コンテンツは必須です');
        expect(fieldErrors.slug).toContain('スラッグは必須です');
      }
    });

    it('should reject invalid slug format', () => {
      const invalidData = {
        title: 'Valid Title',
        content: 'Valid content',
        slug: 'Invalid Slug!', // 無効なスラッグ
        published: false,
      };

      const result = PostFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.slug).toContain(
          'スラッグは英小文字、数字、ハイフンのみ使用可能です'
        );
      }
    });

    it('should handle optional published field', () => {
      const dataWithoutPublished = {
        title: 'Test Post',
        content: 'Test content',
        slug: 'test-post',
      };

      const result = PostFormSchema.safeParse(dataWithoutPublished);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.published).toBe(false); // デフォルト値
      }
    });
  });

  describe('UpdatePostFormSchema', () => {
    it('should allow partial updates', () => {
      const partialData = {
        title: 'Updated Title',
      };

      const result = UpdatePostFormSchema.safeParse(partialData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Updated Title');
        expect(result.data.content).toBeUndefined();
      }
    });
  });

  describe('generateSlug', () => {
    it('should generate valid slug from title', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('Test Post!')).toBe('test-post');
      expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces');
      expect(generateSlug('日本語タイトル123')).toBe('123'); // 英数字のみ残る
      expect(generateSlug('--start-end--')).toBe('start-end'); // 先頭末尾のハイフン削除
    });

    it('should handle empty or invalid input', () => {
      expect(generateSlug('')).toBe('');
      expect(generateSlug('!!!')).toBe('');
      expect(generateSlug('   ')).toBe('');
    });
  });

  describe('validatePostForm', () => {
    it('should return success for valid data', () => {
      const validData = {
        title: 'Test Post',
        content: 'Test content',
        slug: 'test-post',
        published: false,
      };

      const result = validatePostForm(validData);
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return errors for invalid data', () => {
      const invalidData = {
        title: '',
        content: 'Test content',
        slug: 'invalid slug!',
        published: false,
      };

      const result = validatePostForm(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toBe('バリデーションエラーがあります');
      expect(result.fieldErrors).toBeDefined();
    });
  });

});