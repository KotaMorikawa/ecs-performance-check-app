// キャッシュメトリクス計算のテスト

import { describe, it, expect } from 'vitest';
import {
  calculateHitRate,
  calculateEfficiencyScore,
  formatCacheSize,
  formatTTL,
} from '../_shared/cache-metrics';

describe('Cache Metrics Utilities', () => {
  describe('calculateHitRate', () => {
    it('should calculate correct hit rate', () => {
      expect(calculateHitRate(8, 2)).toBe(80);
      expect(calculateHitRate(10, 0)).toBe(100);
      expect(calculateHitRate(0, 10)).toBe(0);
      expect(calculateHitRate(0, 0)).toBe(0);
    });
  });

  describe('calculateEfficiencyScore', () => {
    it('should calculate efficiency score correctly', () => {
      // 高いヒット率、低いレスポンス時間 = 高スコア
      const highScore = calculateEfficiencyScore(90, 50);
      expect(highScore).toBeGreaterThan(75);

      // 低いヒット率、高いレスポンス時間 = 低スコア
      const lowScore = calculateEfficiencyScore(30, 200);
      expect(lowScore).toBeLessThan(50);
    });

    it('should handle edge cases', () => {
      expect(calculateEfficiencyScore(100, 0)).toBe(100);
      expect(calculateEfficiencyScore(0, 1000)).toBe(0);
    });
  });

  describe('formatCacheSize', () => {
    it('should format bytes correctly', () => {
      expect(formatCacheSize(500)).toBe('500 B');
      expect(formatCacheSize(1536)).toBe('1.50 KB');
      expect(formatCacheSize(2097152)).toBe('2.00 MB');
      expect(formatCacheSize(1073741824)).toBe('1.00 GB');
    });
  });

  describe('formatTTL', () => {
    it('should format TTL correctly', () => {
      expect(formatTTL(undefined)).toBe('No TTL');
      expect(formatTTL(30)).toBe('30s');
      expect(formatTTL(120)).toBe('2m');
      expect(formatTTL(7200)).toBe('2h');
      expect(formatTTL(172800)).toBe('2d');
    });
  });
});