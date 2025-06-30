'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CodeDisplay } from '@/components/code-display';
import { 
  Layers, 
  Trophy,
  TrendingUp,
  Zap,
  Shield,
  Clock,
  Globe,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Lightbulb
} from 'lucide-react';
import type { 
  CacheStrategy,
  CacheApiResponse,
  CacheTestData,
  CacheComparisonResult,
  CacheMetrics,
  CacheHealthStatus,
  PerformanceRecommendation
} from '../../_shared/types';

interface CacheComparisonPresentationalProps {
  comparisonData: Record<CacheStrategy, CacheApiResponse<CacheTestData[]>>;
  comparisonResult: CacheComparisonResult | null;
  overallMetrics: CacheMetrics | null;
  health: CacheHealthStatus | null;
  recommendations: PerformanceRecommendation[];
  renderTime: number;
  error: string | null;
}

export function CacheComparisonPresentational({ 
  comparisonData,
  comparisonResult,
  overallMetrics,
  health,
  recommendations,
  error 
}: CacheComparisonPresentationalProps) {
  const [showCode, setShowCode] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<CacheStrategy | null>(null);

  const strategyIcons: Record<CacheStrategy, React.ComponentType<{ className?: string }>> = {
    'data-cache': Shield,
    'full-route-cache': Globe,
    'router-cache': Zap,
    'request-memoization': Clock,
    'cloudfront-cache': TrendingUp,
  };

  const strategyColors: Record<CacheStrategy, string> = {
    'data-cache': 'text-blue-600',
    'full-route-cache': 'text-green-600',
    'router-cache': 'text-purple-600',
    'request-memoization': 'text-orange-600',
    'cloudfront-cache': 'text-indigo-600',
  };

  const comparisonCode = `// キャッシュ戦略の比較と選択
// 各戦略の特徴と適用場面

// 1. Data Cache - fetch APIキャッシュ
const dataCache = {
  useCase: 'API データの永続キャッシュ',
  performance: 'High',
  complexity: 'Low',
  revalidation: 'Tag-based',
  
  implementation: \`
    const data = await fetch('/api/data', {
      next: { tags: ['data'] }
    });
  \`
};

// 2. Full Route Cache - ページキャッシュ
const fullRouteCache = {
  useCase: '静的ページとISR',
  performance: 'Excellent',
  complexity: 'Medium',
  revalidation: 'Time-based + On-demand',
  
  implementation: \`
    export const revalidate = 60;
    // または
    export const dynamic = 'force-static';
  \`
};

// 3. Router Cache - クライアントキャッシュ
const routerCache = {
  useCase: 'ナビゲーション最適化',
  performance: 'Good',
  complexity: 'Low',
  revalidation: 'Automatic',
  
  implementation: \`
    // 自動的に有効
    // プリフェッチとソフトナビゲーション
  \`
};

// 4. CloudFront Cache - エッジキャッシュ
const cloudfrontCache = {
  useCase: 'グローバル配信',
  performance: 'Excellent',
  complexity: 'High',
  revalidation: 'TTL + Manual',
  
  implementation: \`
    // CloudFront設定
    Cache-Control: public, max-age=3600
  \`
};

// 戦略選択のガイドライン
function selectCacheStrategy(requirements: Requirements) {
  if (requirements.global && requirements.static) {
    return 'cloudfront-cache';
  }
  
  if (requirements.seo && requirements.performance) {
    return 'full-route-cache';
  }
  
  if (requirements.dynamic && requirements.fresh) {
    return 'data-cache';
  }
  
  if (requirements.navigation) {
    return 'router-cache';
  }
  
  // 複合戦略
  return ['data-cache', 'full-route-cache', 'router-cache'];
}`;

  const getHealthIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cache Strategy Comparison</h1>
          <p className="text-muted-foreground mt-2">
            各キャッシュ戦略のパフォーマンス比較と最適化提案
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCode(!showCode)}>
            {showCode ? 'Hide Code' : 'Show Code'}
          </Button>
        </div>
      </div>

      {showCode && (
        <CodeDisplay
          title="Cache Strategy Comparison"
          description="キャッシュ戦略の比較と選択指針"
          files={[
            {
              filename: 'cache-comparison.ts',
              language: 'typescript',
              content: comparisonCode,
              description: '各キャッシュ戦略の実装と選択基準',
            },
          ]}
        />
      )}

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="health">Health Status</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="details">Strategy Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* 勝者の表示 */}
            {comparisonResult?.winner && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    Recommended Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">
                        {comparisonResult.winner.strategy.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {comparisonResult.winner.reason}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                      Score: {comparisonResult.winner.score}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 戦略比較グリッド */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {Object.entries(comparisonData).map(([strategy, data]) => {
                const StrategyIcon = strategyIcons[strategy as CacheStrategy] || Layers;
                const metrics = comparisonResult?.metrics[strategy as CacheStrategy];
                
                return (
                  <Card 
                    key={strategy}
                    className={`cursor-pointer transition-all ${
                      selectedStrategy === strategy ? 'ring-2 ring-primary' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedStrategy(strategy as CacheStrategy)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StrategyIcon className={`h-5 w-5 ${strategyColors[strategy as CacheStrategy]}`} />
                          <CardTitle className="text-base">
                            {strategy.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </CardTitle>
                        </div>
                        <Badge variant={data.metadata.cached ? 'default' : 'secondary'}>
                          {data.metadata.cached ? 'HIT' : 'MISS'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {metrics && (
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Performance</p>
                              <div className="flex items-center gap-2">
                                <Progress value={metrics.performance} className="h-1 flex-1" />
                                <span className="text-xs">{metrics.performance}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Efficiency</p>
                              <div className="flex items-center gap-2">
                                <Progress value={metrics.efficiency} className="h-1 flex-1" />
                                <span className="text-xs">{metrics.efficiency}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Response</p>
                            <p className="font-medium">{data.metrics.fetchTime.toFixed(0)}ms</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Size</p>
                            <p className="font-medium">
                              {(data.metrics.dataSize / 1024).toFixed(1)}KB
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 全体統計 */}
            {overallMetrics && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Overall Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {overallMetrics.overall.efficiencyScore}
                      </p>
                      <p className="text-sm text-muted-foreground">Efficiency Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {overallMetrics.performance.dataFetchTime.toFixed(0)}ms
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Fetch Time</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {(overallMetrics.overall.totalCacheSize / 1024).toFixed(1)}KB
                      </p>
                      <p className="text-sm text-muted-foreground">Total Cache Size</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {Object.keys(comparisonData).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Active Strategies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance">
            <div className="space-y-4">
              {/* パフォーマンス比較チャート */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  {comparisonResult && (
                    <div className="space-y-6">
                      {Object.entries(comparisonResult.metrics).map(([strategy, metrics]) => (
                        <div key={strategy} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {strategy.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Overall: {(metrics.performance + metrics.efficiency + metrics.reliability - metrics.complexity / 2).toFixed(0)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Performance</p>
                              <Progress value={metrics.performance} className="h-2" />
                              <p className="text-xs mt-1">{metrics.performance}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Efficiency</p>
                              <Progress value={metrics.efficiency} className="h-2" />
                              <p className="text-xs mt-1">{metrics.efficiency}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Reliability</p>
                              <Progress value={metrics.reliability} className="h-2" />
                              <p className="text-xs mt-1">{metrics.reliability}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Complexity</p>
                              <Progress value={100 - metrics.complexity} className="h-2" />
                              <p className="text-xs mt-1">{100 - metrics.complexity}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* CloudFrontシミュレーション */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    CloudFront Edge Cache Simulation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Globe className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="font-medium">Tokyo Edge</p>
                      <p className="text-2xl font-bold text-green-600">12ms</p>
                      <p className="text-sm text-muted-foreground">Cache Hit</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Globe className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <p className="font-medium">Singapore Edge</p>
                      <p className="text-2xl font-bold text-yellow-600">45ms</p>
                      <p className="text-sm text-muted-foreground">Cache Miss</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Globe className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="font-medium">US West Edge</p>
                      <p className="text-2xl font-bold text-green-600">18ms</p>
                      <p className="text-sm text-muted-foreground">Cache Hit</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="health">
            <div className="space-y-4">
              {/* 全体ヘルス */}
              {health && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {getHealthIcon(health.overall)}
                        Cache Health Status
                      </span>
                      <Badge variant={
                        health.overall === 'healthy' ? 'default' : 
                        health.overall === 'warning' ? 'secondary' : 'destructive'
                      }>
                        {health.overall.toUpperCase()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* レイヤー別ステータス */}
                      <div>
                        <h4 className="font-semibold mb-3">Layer Status</h4>
                        <div className="space-y-2">
                          {Object.entries(health.layers).map(([strategy, status]) => (
                            <div key={strategy} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center gap-2">
                                {getHealthIcon(status.status)}
                                <span className="text-sm">
                                  {strategy.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {status.issues.length > 0 ? `${status.issues.length} issues` : 'OK'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* アラート */}
                      <div>
                        <h4 className="font-semibold mb-3">Active Alerts</h4>
                        {health.alerts.length > 0 ? (
                          <div className="space-y-2">
                            {health.alerts.map((alert, index) => (
                              <Alert key={index} variant={alert.level === 'error' ? 'destructive' : 'default'}>
                                <AlertDescription className="text-sm">
                                  {alert.message}
                                </AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No active alerts</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.map((rec, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5" />
                          {rec.title}
                        </span>
                        <Badge variant={
                          rec.priority === 'high' ? 'destructive' :
                          rec.priority === 'medium' ? 'outline' : 'secondary'
                        }>
                          {rec.priority}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium mb-2">Expected Improvement</h5>
                            <p className="text-sm text-green-600">{rec.expectedImprovement}</p>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Implementation</h5>
                            <div className="text-sm">
                              <p>Complexity: {rec.implementation.complexity}</p>
                              <p>Time Required: {rec.implementation.timeRequired}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-2">Implementation Steps</h5>
                          <ol className="text-sm text-muted-foreground space-y-1">
                            {rec.implementation.steps.map((step, stepIndex) => (
                              <li key={stepIndex}>{stepIndex + 1}. {step}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <p className="text-lg font-medium">No recommendations at this time</p>
                    <p className="text-sm text-muted-foreground">
                      Your cache configuration is performing optimally
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="details">
            <div className="space-y-4">
              {/* 戦略詳細 */}
              {comparisonResult?.recommendations.map((rec, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{rec.bestFor}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2 text-green-600">Pros</h5>
                        <ul className="text-sm space-y-1">
                          {rec.pros.map((pro, proIndex) => (
                            <li key={proIndex} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 mt-1 text-green-600 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2 text-red-600">Cons</h5>
                        <ul className="text-sm space-y-1">
                          {rec.cons.map((con, conIndex) => (
                            <li key={conIndex} className="flex items-start gap-2">
                              <XCircle className="h-3 w-3 mt-1 text-red-600 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Use Case</h5>
                      <p className="text-sm text-muted-foreground">{rec.useCase}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}