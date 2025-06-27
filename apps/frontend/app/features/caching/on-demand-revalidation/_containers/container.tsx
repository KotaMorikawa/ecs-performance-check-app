import { Suspense } from 'react';
import { OnDemandRevalidationPresentational } from './presentational';
import { cacheTestApi } from '../../_shared/cache-api-client';
import type { CacheApiResponse, CacheTestData } from '../../_shared/types';

// Server Component（データ取得・統合レイヤー）
export async function OnDemandRevalidationContainer() {
  let cacheResponse: CacheApiResponse<CacheTestData[]> | null = null;
  let error: string | null = null;

  try {
    // オンデマンドリバリデート用のデータ取得（タグ付き）
    cacheResponse = await cacheTestApi.getDataCacheDemo(['revalidation-demo', 'on-demand']);
  } catch (err) {
    console.error('On-demand revalidation fetch error:', err);
    error = err instanceof Error ? err.message : 'Unknown error';
  }

  return (
    <Suspense fallback={<div>Loading on-demand revalidation demo...</div>}>
      <OnDemandRevalidationPresentational 
        initialData={cacheResponse?.data || []}
        initialMetadata={cacheResponse?.metadata || null}
        initialMetrics={cacheResponse?.metrics || null}
        error={error}
      />
    </Suspense>
  );
}