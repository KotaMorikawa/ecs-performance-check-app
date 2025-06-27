import Link from 'next/link';
import type { Route } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, Clock, Github } from 'lucide-react';

interface SubFeature {
  name: string;
  path: string;
}

interface Feature {
  title: string;
  description: string;
  path: string;
  status: 'implemented';
  subFeatures?: SubFeature[];
}

export default function Home() {
  const implementedFeatures: Feature[] = [
    {
      title: 'ルーティング機能',
      description: 'App Routerによるファイルベースルーティング',
      path: '/features/routing/basic',
      status: 'implemented',
      subFeatures: [
        { name: '基本ルーティング', path: '/features/routing/basic' },
        { name: 'ダイナミックルート', path: '/features/routing/dynamic/1' },
        { name: 'ネストレイアウト', path: '/features/routing/nested-layout' },
        { name: 'ローディング・エラー', path: '/features/routing/loading-error' },
        { name: 'ルートグループ', path: '/features/routing/(route-groups)/public' },
        { name: 'パラレル・インターセプト', path: '/features/routing/parallel-intercept' }
      ]
    },
    {
      title: 'Server Actions',
      description: 'フォーム処理とサーバーサイドアクション',
      path: '/features/server-actions/basic',
      status: 'implemented'
    },
    {
      title: 'データフェッチング',
      description: 'SSG/SSR/ISR/クライアントサイド/パラレルフェッチング',
      path: '/features/data-fetching',
      status: 'implemented',
      subFeatures: [
        { name: 'SSG (Static Site Generation)', path: '/features/data-fetching/ssg' },
        { name: 'SSR (Server-Side Rendering)', path: '/features/data-fetching/ssr' },
        { name: 'ISR (Incremental Static Regeneration)', path: '/features/data-fetching/isr' },
        { name: 'クライアントサイド', path: '/features/data-fetching/client-side' },
        { name: 'パラレルフェッチング', path: '/features/data-fetching/parallel' }
      ]
    }
  ];

  const plannedFeatures = [
    { name: 'キャッシュ戦略', description: '多層キャッシュシステムの構築' },
    { name: 'ストリーミング', description: 'Suspenseによるストリーミングレンダリング' },
    { name: 'Middleware', description: 'リクエスト処理とルートガード' },
    { name: '画像最適化', description: 'Next.js Image コンポーネント活用' },
    { name: 'メタデータ', description: 'SEO対応とOpen Graphタグ' }
  ];

  const techStack = [
    { name: 'Next.js 15.3.4', type: 'framework' },
    { name: 'React 18', type: 'library' },
    { name: 'TypeScript', type: 'language' },
    { name: 'Tailwind CSS', type: 'styling' },
    { name: 'shadcn/ui', type: 'components' },
    { name: 'Hono', type: 'backend' },
    { name: 'PostgreSQL', type: 'database' },
    { name: 'AWS ECS', type: 'infrastructure' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ECS Performance Check App
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-6">
            Next.js 15.3.4の主要機能をAWS ECS環境で動作させ、パフォーマンスメトリクスを可視化するデモアプリケーション
          </p>
          <Button asChild size="lg" className="mr-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" />
              GitHub で見る
            </a>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* 実装済み機能 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                実装済み機能
              </CardTitle>
              <CardDescription>現在利用可能な機能デモ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {implementedFeatures.map((feature, index) => (
                <Card key={index} className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      {feature.title}
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        実装済み
                      </Badge>
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button asChild variant="outline" size="sm">
                      <Link href={feature.path as Route}>
                        メイン機能を見る
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                    {feature.subFeatures && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">サブ機能:</p>
                        <div className="grid grid-cols-1 gap-2">
                          {feature.subFeatures.map((subFeature, subIndex) => (
                            <Button
                              key={subIndex}
                              asChild
                              variant="ghost"
                              size="sm"
                              className="justify-start h-8 text-xs"
                            >
                              <Link href={subFeature.path as Route}>
                                {subFeature.name}
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </Link>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* 実装予定機能 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                実装予定機能
              </CardTitle>
              <CardDescription>順次実装予定の機能</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plannedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{feature.name}</div>
                      <div className="text-sm text-muted-foreground">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* プロジェクト概要 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>プロジェクト概要</CardTitle>
            <CardDescription>システム構成と特徴</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">AWS ECSサイドカーパターン構成</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Next.js Container (3000): メインアプリケーション</li>
                  <li>• Hono Backend Container (8000): バックエンドAPI</li>
                  <li>• PostgreSQL Container (5432): データベース</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">パフォーマンス監視</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Core Web Vitals測定</li>
                  <li>• レンダリング時間追跡</li>
                  <li>• キャッシュ効率監視</li>
                  <li>• コンテナ間通信レイテンシー</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 技術スタック */}
        <Card>
          <CardHeader>
            <CardTitle>技術スタック</CardTitle>
            <CardDescription>使用しているテクノロジー</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {tech.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
