import { Suspense } from 'react';
import { SsgPresentational } from './presentational';
import { categoriesApi } from '../../../_shared/api-client';
import type { Category, DataFetchMetrics } from '../../../_shared/types';

interface SsgContainerProps {
  category: string;
}

// Server Component（データ取得・統合レイヤー）
export async function SsgContainer({ category }: SsgContainerProps) {
  let categories: Category[] = [];
  let selectedCategory: Category | null = null;
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
    selectedCategory = categories.find(cat => cat.slug === category) || null;
    metrics = result.metrics;
  } catch (err) {
    console.error('SSG fetch error:', err);
    error = err instanceof Error ? err.message : 'Unknown error';
  }

  return (
    <Suspense fallback={<div>Loading SSG demo...</div>}>
      <SsgPresentational 
        categories={categories}
        selectedCategory={selectedCategory}
        currentSlug={category}
        metrics={metrics}
        error={error}
      />
    </Suspense>
  );
}