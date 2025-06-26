import { Suspense } from 'react';
import { SsgPresentational } from './presentational';
import { categoriesApi } from '../../_shared/api-client';
import type { Category, DataFetchMetrics } from '../../_shared/types';

// Server Component（データ取得・統合レイヤー）
export async function SsgContainer() {
  let categories: Category[] = [];
  let metrics: DataFetchMetrics | null = null;
  let error: string | null = null;

  try {
    // SSG用のキャッシュ設定でカテゴリ一覧を取得
    const result = await categoriesApi.getAll({
      next: {
        tags: ['categories'],
        // SSGではビルド時に生成されるため、revalidateは設定しない
      },
    }, 'ssg');

    categories = result.data;
    metrics = result.metrics;
  } catch (err) {
    console.error('SSG fetch error:', err);
    error = err instanceof Error ? err.message : 'Unknown error';
  }

  return (
    <Suspense fallback={<div>Loading SSG demo...</div>}>
      <SsgPresentational 
        categories={categories}
        metrics={metrics}
        error={error}
      />
    </Suspense>
  );
}