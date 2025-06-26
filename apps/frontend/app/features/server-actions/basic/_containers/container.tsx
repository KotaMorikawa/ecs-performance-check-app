import { Suspense } from 'react';
import { ServerActionsPresentational } from './presentational';
import { ServerActionsErrorBoundary } from '../_components/error-boundary';

interface Post {
  id: number;
  title: string;
  content: string;
  slug: string;
  published: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: number;
    name: string | null;
    email: string;
  } | null;
  tags?: {
    id: number;
    name: string;
  }[];
}

// バックエンドから投稿一覧を取得
async function fetchPosts(): Promise<Post[]> {
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/posts?published=false`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Next.js のキャッシュ設定
      next: {
        tags: ['getPosts'], // キャッシュタグ for revalidateTag
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch posts:', response.status);
      return [];
    }

    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    // ビルド時以外はエラーログを出力
    if (
      process.env.NODE_ENV !== 'production' ||
      process.env.NEXT_PHASE !== 'phase-production-build'
    ) {
      console.error('Error fetching posts:', error);
    }
    return [];
  }
}

// Server Component（データ取得・統合レイヤー）
export async function ServerActionsContainer() {
  // 投稿データを取得
  const posts = await fetchPosts();


  return (
    <ServerActionsErrorBoundary>
      <Suspense fallback={<div>Loading Server Actions demo...</div>}>
        <ServerActionsPresentational posts={posts} />
      </Suspense>
    </ServerActionsErrorBoundary>
  );
}
