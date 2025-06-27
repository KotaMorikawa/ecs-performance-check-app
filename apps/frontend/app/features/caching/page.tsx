import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  FileText, 
  Navigation, 
  RefreshCw, 
  Zap,
  Globe,
  ArrowRight,
  Layers,
  Timer,
  Shield
} from 'lucide-react';

const cacheStrategies = [
  {
    id: 'data-cache',
    title: 'Data Cache',
    description: 'Next.js fetch APIのキャッシュ機能。サーバーサイドでのデータ取得を最適化',
    icon: Database,
    href: '/features/caching/data-cache',
    badge: 'Core',
    features: ['自動キャッシュ', 'タグベース無効化', 'リクエスト重複排除'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'full-route-cache',
    title: 'Full Route Cache',
    description: '完全なページレンダリング結果をキャッシュ。静的サイトのパフォーマンスを実現',
    icon: FileText,
    href: '/features/caching/full-route-cache',
    badge: 'Page Level',
    features: ['HTML全体キャッシュ', 'ISR対応', 'ビルド時生成'],
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 'router-cache',
    title: 'Router Cache',
    description: 'クライアントサイドナビゲーションのキャッシュ。シームレスな画面遷移を実現',
    icon: Navigation,
    href: '/features/caching/router-cache',
    badge: 'Client Side',
    features: ['プリフェッチ', 'ソフトナビゲーション', 'インスタント遷移'],
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'on-demand-revalidation',
    title: 'On-demand Revalidation',
    description: '必要に応じてキャッシュを無効化。リアルタイム性とパフォーマンスの両立',
    icon: RefreshCw,
    href: '/features/caching/on-demand-revalidation',
    badge: 'Dynamic',
    features: ['パス/タグ指定', 'Webhook連携', 'バックエンド通知'],
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'comparison',
    title: 'Cache Strategy Comparison',
    description: '各キャッシュ戦略のパフォーマンス比較とCloudFrontシミュレーション',
    icon: Layers,
    href: '/features/caching/comparison',
    badge: 'Analysis',
    features: ['性能比較', 'CloudFront統合', '最適化提案'],
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
];

const keyFeatures = [
  {
    icon: Zap,
    title: '4層キャッシュシステム',
    description: 'Data Cache、Full Route Cache、Router Cache、Request Memoizationの多層構造',
  },
  {
    icon: Globe,
    title: 'CloudFront統合',
    description: 'エッジキャッシュによるグローバル配信の最適化とCDN効率の可視化',
  },
  {
    icon: Timer,
    title: 'リアルタイムメトリクス',
    description: 'キャッシュヒット率、レスポンス時間、効率スコアの即時計測',
  },
  {
    icon: Shield,
    title: 'インテリジェント無効化',
    description: 'タグベース、パスベース、時間ベースの柔軟なキャッシュ管理',
  },
];

export default function CachingPage() {
  return (
    <div className="space-y-8">
      {/* ヘッダーセクション */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">キャッシュとリバリデート</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Next.js 15の多層キャッシュシステムを完全解説。
          パフォーマンスとリアルタイム性を両立する最適なキャッシュ戦略を実演します。
        </p>
      </div>

      {/* 主要機能 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyFeatures.map((feature) => (
          <Card key={feature.title} className="border-muted">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* キャッシュ戦略一覧 */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">キャッシュ戦略デモ</h2>
          <p className="text-muted-foreground">
            各キャッシュレイヤーの動作を実際に体験できます
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cacheStrategies.map((strategy) => (
            <Card 
              key={strategy.id} 
              className="group hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              <div className={`h-1 ${strategy.bgColor}`} />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${strategy.bgColor}`}>
                      <strategy.icon className={`h-6 w-6 ${strategy.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{strategy.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {strategy.badge}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-3">
                  {strategy.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {strategy.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full ${strategy.bgColor}`} />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href={strategy.href as string}>
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                    variant="outline"
                  >
                    デモを体験
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 実装のポイント */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            実装のポイント
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">パフォーマンス最適化</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 適切なrevalidate時間の設定</li>
                <li>• タグベースの選択的無効化</li>
                <li>• CloudFrontとの連携設定</li>
                <li>• キャッシュウォーミング戦略</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">監視とデバッグ</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• リアルタイムキャッシュメトリクス</li>
                <li>• ヒット率の継続的監視</li>
                <li>• パフォーマンス改善提案</li>
                <li>• キャッシュヘルスチェック</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-background rounded-lg">
            <p className="text-sm">
              <strong>💡 ヒント:</strong> 各デモページでは実際のキャッシュ動作を確認でき、
              メトリクスをリアルタイムで観察できます。CloudFrontシミュレーションも含まれており、
              エッジキャッシュの効果を体験できます。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}