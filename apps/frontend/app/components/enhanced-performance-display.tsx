"use client";

import {
  Activity,
  Clock,
  Database,
  Globe,
  HardDrive,
  Network,
  RefreshCw,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatMetrics, usePerformanceMetrics } from "@/hooks/use-performance-metrics";
import { useWebVitals } from "@/hooks/use-web-vitals";
import { cn } from "@/lib/utils";
import { WebVitalsDisplay } from "./web-vitals-display";

interface PerformanceMetrics {
  network: {
    totalRequests: number;
    avgResponseTime: number;
    cacheHitRate: number;
    totalDataTransferred: number;
    errors: number;
  };
  render: {
    serverRenderTime?: number;
    clientRenderTime: number;
    hydrationTime?: number;
    totalRenderTime: number;
  };
  cache: {
    nextjsCacheHits: number;
    nextjsCacheMisses: number;
    browserCacheHits: number;
    browserCacheMisses: number;
    cacheEfficiency: number;
  };
  lastUpdated: string;
}

interface EnhancedPerformanceDisplayProps {
  metrics?: PerformanceMetrics;
  title?: string;
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "stable";
  status?: "good" | "warning" | "error";
  description?: string;
}

function MetricCard({ title, value, icon, trend, status = "good", description }: MetricCardProps) {
  const statusColors = {
    good: "border-green-200 bg-green-50",
    warning: "border-yellow-200 bg-yellow-50",
    error: "border-red-200 bg-red-50",
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", statusColors[status])}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
            </div>
          </div>
          {trend && (
            <TrendingUp
              className={cn(
                "h-4 w-4",
                trend === "up"
                  ? "text-green-500"
                  : trend === "down"
                    ? "text-red-500"
                    : "text-gray-400"
              )}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function EnhancedPerformanceDisplay({
  metrics: externalMetrics,
  title = "Performance Metrics",
}: EnhancedPerformanceDisplayProps = {}) {
  const { metrics: hookMetrics, isCollecting, refreshMetrics } = usePerformanceMetrics();
  useWebVitals();

  // 外部から渡されたmetricsを優先、なければhookからのmetricsを使用
  const metrics = externalMetrics || hookMetrics;

  if (!metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">パフォーマンス測定中...</span>
        </div>
      </div>
    );
  }

  const getCacheStatus = (efficiency: number) => {
    if (efficiency >= 80) return "good";
    if (efficiency >= 60) return "warning";
    return "error";
  };

  const getNetworkStatus = (avgResponseTime: number) => {
    if (avgResponseTime < 200) return "good";
    if (avgResponseTime < 500) return "warning";
    return "error";
  };

  return (
    <div className="space-y-8">
      {/* Main Title */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mt-1">
          最終更新: {new Date(metrics.lastUpdated).toLocaleString("ja-JP")}
        </p>
      </div>

      {/* Core Web Vitals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Core Web Vitals</h3>
          <Button
            onClick={refreshMetrics}
            disabled={isCollecting}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isCollecting && "animate-spin")} />
            更新
          </Button>
        </div>
        <WebVitalsDisplay />
      </div>

      {/* Network Performance */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Network className="h-5 w-5" />
          ネットワークパフォーマンス
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="総リクエスト数"
            value={formatMetrics.number(metrics.network.totalRequests)}
            icon={<Globe className="h-5 w-5 text-blue-600" />}
            description="ページ読み込み時の総リクエスト数"
          />
          <MetricCard
            title="平均応答時間"
            value={formatMetrics.time(metrics.network.avgResponseTime)}
            icon={<Timer className="h-5 w-5 text-green-600" />}
            status={getNetworkStatus(metrics.network.avgResponseTime)}
            description="リクエストの平均応答時間"
          />
          <MetricCard
            title="キャッシュヒット率"
            value={formatMetrics.percentage(metrics.network.cacheHitRate)}
            icon={<HardDrive className="h-5 w-5 text-purple-600" />}
            status={getCacheStatus(metrics.network.cacheHitRate)}
            description="ブラウザキャッシュのヒット率"
          />
          <MetricCard
            title="データ転送量"
            value={formatMetrics.bytes(metrics.network.totalDataTransferred)}
            icon={<Database className="h-5 w-5 text-orange-600" />}
            description="総データ転送量"
          />
        </div>
      </div>

      {/* Render Performance */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          レンダリングパフォーマンス
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="サーバーレンダリング"
            value={formatMetrics.time(metrics.render.serverRenderTime || 0)}
            icon={<Activity className="h-5 w-5 text-blue-600" />}
            description="サーバーサイドレンダリング時間"
          />
          <MetricCard
            title="クライアントレンダリング"
            value={formatMetrics.time(metrics.render.clientRenderTime)}
            icon={<Clock className="h-5 w-5 text-green-600" />}
            description="クライアントサイドレンダリング時間"
          />
          <MetricCard
            title="Hydration時間"
            value={formatMetrics.time(metrics.render.hydrationTime || 0)}
            icon={<RefreshCw className="h-5 w-5 text-purple-600" />}
            description="React Hydration完了時間"
          />
          <MetricCard
            title="総レンダリング時間"
            value={formatMetrics.time(metrics.render.totalRenderTime)}
            icon={<Timer className="h-5 w-5 text-orange-600" />}
            description="ページ読み込み完了までの総時間"
          />
        </div>
      </div>

      {/* Cache Performance */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          キャッシュパフォーマンス
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Next.js キャッシュ</CardTitle>
              <CardDescription>Next.js内部キャッシュシステムの効率性</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">キャッシュ効率</span>
                  <span className="font-semibold">
                    {formatMetrics.percentage(metrics.cache.cacheEfficiency)}
                  </span>
                </div>
                <Progress value={metrics.cache.cacheEfficiency} className="h-2" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">ヒット:</span>
                    <span className="font-medium ml-2 text-green-600">
                      {metrics.cache.nextjsCacheHits}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">ミス:</span>
                    <span className="font-medium ml-2 text-red-600">
                      {metrics.cache.nextjsCacheMisses}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">ブラウザキャッシュ</CardTitle>
              <CardDescription>ブラウザキャッシュの利用状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">キャッシュヒット率</span>
                  <span className="font-semibold">
                    {formatMetrics.percentage(metrics.network.cacheHitRate)}
                  </span>
                </div>
                <Progress value={metrics.network.cacheHitRate} className="h-2" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">ヒット:</span>
                    <span className="font-medium ml-2 text-green-600">
                      {metrics.cache.browserCacheHits}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">ミス:</span>
                    <span className="font-medium ml-2 text-red-600">
                      {metrics.cache.browserCacheMisses}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* メトリクス更新情報 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>最終更新: {new Date(metrics.lastUpdated).toLocaleString()}</span>
            <Badge variant="outline" className="text-xs">
              {isCollecting ? "測定中..." : "リアルタイム"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
