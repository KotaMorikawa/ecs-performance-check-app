'use client';

import { FeatureExplanation } from './feature-explanation';

type FeatureDataStructure = {
  title: string;
  description: string;
  capabilities: string[];
  verificationSteps: {
    step: string;
    description: string;
    expected: string;
  }[];
  technicalDetails: string[];
};

interface SegmentFeatureInfoProps {
  segmentType: 'routing' | 'server-actions' | 'data-fetching' | 'caching' | 'streaming' | 'middleware' | 'image-optimization' | 'metadata';
  subType?: string;
}

// セグメント別の機能データ定義
const segmentFeatures = {
  routing: {
    basic: {
      title: 'App Router基本機能',
      description: 'Next.js 15.3.4 の App Router を使用した基本的なルーティング機能のデモンストレーション',
      capabilities: [
        'ファイルベースルーティング',
        'Server Components',
        'Client Components',
        'Nested Layouts',
        'Loading UI',
        'Error Boundaries',
        'Route Groups',
        'Dynamic Routes',
      ],
      verificationSteps: [
        {
          step: 'URLアクセス',
          description: '/features/routing/basic にアクセスしてページが表示されることを確認',
          expected: 'ページが正常に表示され、App Routerによるルーティングが動作する',
        },
        {
          step: 'パフォーマンス確認',
          description: 'ブラウザDevToolsのNetworkタブでページ読み込みを確認',
          expected: 'LCP, FID, CLS, INPメトリクスが適切に測定・表示される',
        },
        {
          step: 'レンダリング確認',
          description: 'ページのレンダリング時間とメトリクスの表示を確認',
          expected: 'リアルタイムでパフォーマンスメトリクスが更新される',
        },
      ],
      technicalDetails: [
        'App Directory構造の活用',
        'React 18 Server Componentsとの連携',
        'TypeScript型安全性の確保',
        'Tailwind CSSによるスタイリング',
        'Vitestによるテスト環境',
        'ESLintによるコード品質管理',
      ],
    },
    dynamic: {
      title: '動的ルーティング',
      description: 'URL パラメータを使用した動的なページ生成機能',
      capabilities: [
        '動的セグメント ([id])',
        'Catch-all ルート ([...slug])',
        'Optional Catch-all ([[...slug]])',
        'generateStaticParams',
      ],
      verificationSteps: [
        {
          step: '動的URLアクセス',
          description: '/features/routing/dynamic/123 などの動的URLにアクセス',
          expected: 'パラメータに応じてページ内容が動的に変化する',
        },
      ],
      technicalDetails: [
        'TypeScript型安全なパラメータ処理',
        'Static Generation at Build Time',
      ],
    },
    nested: {
      title: 'ネストされたレイアウト',
      description: '複数のレイアウトを階層的に組み合わせる機能',
      capabilities: [
        'Nested Layouts',
        'Layout Groups',
        'Shared UI Components',
        'State Preservation',
        'Partial Re-rendering',
      ],
      verificationSteps: [
        {
          step: 'レイアウト階層確認',
          description: '/features/routing/nested-layout にアクセスしてレイアウト構造を確認',
          expected: '複数のレイアウトが階層的に適用され、共通要素が継承される',
        },
        {
          step: 'ナビゲーション確認',
          description: '他のページに移動時の共通要素の動作を確認',
          expected: '共通レイアウト部分は再レンダリングされず、状態が保持される',
        },
      ],
      technicalDetails: [
        'Layout Composition Patterns',
        'React Server Components',
        'Client-side State Management',
        'Partial Hydration',
      ],
    },
    loading: {
      title: 'ローディング・エラーハンドリング',
      description: 'loading.tsxとerror.tsxによる自動UI制御機能',
      capabilities: [
        'Loading UI',
        'Error Boundaries',
        'Automatic Error Recovery',
        'Progressive Enhancement',
        'Fallback UI Patterns',
      ],
      verificationSteps: [
        {
          step: 'ローディング確認',
          description: '/features/routing/loading-error にアクセスして各種ローディング状態を確認',
          expected: 'loading.tsxによる自動ローディングUIと手動制御が正常に動作する',
        },
        {
          step: 'エラーハンドリング確認',
          description: 'エラー発生ボタンでエラーバウンダリの動作を確認',
          expected: 'error.tsxによる自動エラーUIが表示され、回復操作が可能',
        },
      ],
      technicalDetails: [
        'Automatic Loading States',
        'Error Boundary Components',
        'React Suspense Integration',
        'Error Recovery Patterns',
      ],
    },
  },
  'server-actions': {
    basic: {
      title: 'Server Actions',
      description: 'JavaScript無効環境でも動作するサーバーサイドアクション機能',
      capabilities: [
        'フォーム送信処理',
        'プログレッシブエンハンスメント',
        '自動CSRF保護',
        'リバリデーション',
      ],
      verificationSteps: [
        {
          step: 'フォーム送信',
          description: 'JavaScriptを無効にしてフォームを送信',
          expected: 'JavaScriptなしでも正常にデータが送信される',
        },
      ],
      technicalDetails: [
        'use server ディレクティブ',
        'Next.js revalidatePath API',
      ],
    },
  },
  'data-fetching': {
    basic: {
      title: 'データフェッチング',
      description: 'SSG、SSR、ISRによる多様なデータ取得戦略',
      capabilities: [
        'Static Site Generation (SSG)',
        'Server-Side Rendering (SSR)',
        'Incremental Static Regeneration (ISR)',
        'Client-Side Fetching',
      ],
      verificationSteps: [
        {
          step: 'ビルド確認',
          description: 'npm run build でビルドログを確認',
          expected: '○(Static)、λ(SSR)、◐(ISR)のマークが適切に表示される',
        },
      ],
      technicalDetails: [
        'fetch with revalidate options',
        'generateStaticParams',
      ],
    },
  },
  caching: {
    basic: {
      title: 'キャッシュ戦略',
      description: 'Next.js 15.3.4の多層キャッシュシステム',
      capabilities: [
        'Request Memoization',
        'Data Cache',
        'Full Route Cache',
        'Router Cache',
      ],
      verificationSteps: [
        {
          step: 'キャッシュ確認',
          description: 'Network タブでキャッシュヒット状況を確認',
          expected: 'キャッシュからの高速レスポンスが確認できる',
        },
      ],
      technicalDetails: [
        'fetch caching strategies',
        'Cache Tags & Revalidation',
      ],
    },
  },
  streaming: {
    basic: {
      title: 'ストリーミング',
      description: 'Suspenseによる段階的コンテンツ配信',
      capabilities: [
        'React Suspense',
        'Streaming SSR',
        'Progressive Loading',
        'Loading.js Patterns',
      ],
      verificationSteps: [
        {
          step: 'ストリーミング確認',
          description: 'ページの段階的読み込みを確認',
          expected: 'コンテンツが段階的に表示される',
        },
      ],
      technicalDetails: [
        'Suspense boundaries',
        'Streaming Response',
      ],
    },
  },
  middleware: {
    basic: {
      title: 'Middleware',
      description: 'リクエスト処理前の中間処理機能',
      capabilities: [
        'Authentication',
        'Redirects',
        'Request/Response modification',
        'A/B Testing',
      ],
      verificationSteps: [
        {
          step: 'Middleware動作確認',
          description: 'リクエストヘッダーの変更を確認',
          expected: 'Middlewareによる処理が正常に動作する',
        },
      ],
      technicalDetails: [
        'Edge Runtime',
        'NextRequest/NextResponse',
      ],
    },
  },
  'image-optimization': {
    basic: {
      title: '画像最適化',
      description: 'next/imageによる自動画像最適化機能',
      capabilities: [
        'Automatic WebP/AVIF conversion',
        'Responsive Images',
        'Lazy Loading',
        'Blur Placeholders',
      ],
      verificationSteps: [
        {
          step: '画像最適化確認',
          description: 'Network タブで最適化された画像を確認',
          expected: 'WebP/AVIF形式で配信され、適切なサイズで表示される',
        },
      ],
      technicalDetails: [
        'Image Optimization API',
        'Sharp image processing',
      ],
    },
  },
  metadata: {
    basic: {
      title: 'メタデータAPI',
      description: 'SEO最適化のためのメタデータ管理機能',
      capabilities: [
        'Dynamic Metadata',
        'Open Graph generation',
        'Twitter Cards',
        'Sitemap generation',
      ],
      verificationSteps: [
        {
          step: 'メタデータ確認',
          description: 'ページソースでメタタグを確認',
          expected: '動的に生成されたメタデータが適切に設定される',
        },
      ],
      technicalDetails: [
        'Metadata API',
        'generateMetadata function',
      ],
    },
  },
};

export function SegmentFeatureInfo({ segmentType, subType = 'basic' }: SegmentFeatureInfoProps) {
  const featureGroup = segmentFeatures[segmentType];
  const featureData = featureGroup ? (featureGroup as Record<string, FeatureDataStructure>)[subType] : undefined;

  if (!featureData) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          機能実装予定
        </h2>
        <p className="text-gray-600">
          {segmentType} - {subType} セグメントの機能説明は実装予定です。
        </p>
      </div>
    );
  }

  return <FeatureExplanation feature={featureData} />;
}