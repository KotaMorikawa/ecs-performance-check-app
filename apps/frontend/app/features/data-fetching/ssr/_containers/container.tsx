import { Suspense } from 'react';
import { SsrPresentational } from './presentational';
import { userProfileApi } from '../../_shared/api-client';

// Server Component（データ取得・統合レイヤー）
export async function SsrContainer() {
  let userProfile = null;
  let metrics = null;
  let error = null;

  try {
    // SSR用のキャッシュ設定（リアルタイムデータ）
    const result = await userProfileApi.getCurrentProfile({
      cache: 'no-store', // SSRではリアルタイムデータを取得
    }, 'ssr');

    userProfile = result.data;
    metrics = result.metrics;
  } catch (err) {
    console.error('SSR fetch error:', err);
    error = err instanceof Error ? err.message : 'Unknown error';
  }

  return (
    <Suspense fallback={<div>Loading SSR demo...</div>}>
      <SsrPresentational 
        userProfile={userProfile}
        metrics={metrics}
        error={error}
      />
    </Suspense>
  );
}