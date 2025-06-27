import { FullRouteCacheContainer } from './_containers/container';

// ISR設定: 60秒ごとにリジェネレート
export const revalidate = 60;

export default function FullRouteCachePage() {
  return <FullRouteCacheContainer />;
}