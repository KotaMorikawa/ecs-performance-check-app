import { Suspense } from 'react';
import { IsrPresentational } from './presentational';
import { categoriesApi } from '../../_shared/api-client';
import type { Category, DataFetchMetrics } from '../../_shared/types';

// Server Component（データ取得・統合レイヤー）
export async function IsrContainer() {
  let categories: Category[] = [];
  let metrics: DataFetchMetrics | null = null;
  let error: string | null = null;

  try {
    // ISR用のキャッシュ設定（60秒でリバリデート）
    const result = await categoriesApi.getAll({
      next: {
        revalidate: 60, // 60秒でリバリデート
        tags: ['categories'],
      },
    }, 'isr');

    categories = result.data;
    metrics = result.metrics;
  } catch (err) {
    console.error('ISR fetch error:', err);
    error = err instanceof Error ? err.message : 'Unknown error';
  }

  return (
    <Suspense fallback={<div>Loading ISR demo...</div>}>
      <IsrPresentational 
        categories={categories}
        metrics={metrics}
        error={error}
      />
    </Suspense>
  );
}