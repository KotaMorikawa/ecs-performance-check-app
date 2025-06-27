import { Suspense } from 'react';
import { ParallelPresentational } from './presentational';
import { fetchParallel } from '../../_shared/api-client';

// Server Component（データ取得・統合レイヤー）
export async function ParallelContainer() {
  let combinedData = null;
  let metrics = null;
  let error = null;

  try {
    // 複数のAPIを並列で取得
    const result = await fetchParallel();
    
    combinedData = result.data;
    metrics = result.metrics;
  } catch (err) {
    console.error('Parallel fetch error:', err);
    error = err instanceof Error ? err.message : 'Unknown error';
  }

  return (
    <Suspense fallback={<div>Loading parallel data...</div>}>
      <ParallelPresentational 
        combinedData={combinedData}
        metrics={metrics}
        error={error}
      />
    </Suspense>
  );
}