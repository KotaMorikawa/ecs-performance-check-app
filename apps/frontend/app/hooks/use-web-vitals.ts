'use client';

import { useEffect, useState } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals';

export interface WebVitalsMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  inp?: number;
  fcp?: number;
  ttfb?: number;
}

export function useWebVitals() {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({});

  useEffect(() => {
    const handleMetric = (metric: Metric) => {
      setMetrics((prev) => ({
        ...prev,
        [metric.name.toLowerCase()]: metric.value
      }));

      // パフォーマンスメトリクスをコンソールに出力（開発用）
      console.log(`[Web Vitals] ${metric.name}: ${metric.value}`);
    };

    // Core Web Vitalsの測定
    onCLS(handleMetric);
    onLCP(handleMetric);
    onINP(handleMetric);
    
    // 追加のメトリクス
    onFCP(handleMetric);
    onTTFB(handleMetric);
  }, []);

  return metrics;
}

// メトリクスの評価基準
export const getMetricStatus = (metric: string, value?: number): 'good' | 'needs-improvement' | 'poor' | 'pending' => {
  if (value === undefined) return 'pending';

  const thresholds: Record<string, { good: number; poor: number }> = {
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
    inp: { good: 200, poor: 500 },
    fcp: { good: 1800, poor: 3000 },
    ttfb: { good: 800, poor: 1800 }
  };

  const threshold = thresholds[metric];
  if (!threshold) return 'pending';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

// メトリクスの説明
export const metricDescriptions: Record<string, string> = {
  lcp: 'Largest Contentful Paint - ページの主要コンテンツが表示されるまでの時間',
  fid: 'First Input Delay - ユーザーの最初の入力に対する応答時間',
  cls: 'Cumulative Layout Shift - ページ読み込み中のレイアウトのずれ',
  inp: 'Interaction to Next Paint - ユーザー操作に対する応答性',
  fcp: 'First Contentful Paint - 最初のコンテンツが表示されるまでの時間',
  ttfb: 'Time to First Byte - サーバーからの最初のバイトを受信するまでの時間'
};