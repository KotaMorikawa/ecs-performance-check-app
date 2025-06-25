'use client';

import { useWebVitals, getMetricStatus, metricDescriptions } from '@/hooks/use-web-vitals';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface MetricCardProps {
  name: string;
  value?: number;
  unit: string;
}

function MetricCard({ name, value, unit }: MetricCardProps) {
  const status = getMetricStatus(name, value);
  const description = metricDescriptions[name];

  const statusColors = {
    good: 'text-green-600 bg-green-50 border-green-200',
    'needs-improvement': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    poor: 'text-red-600 bg-red-50 border-red-200',
    pending: 'text-gray-400 bg-gray-50 border-gray-200'
  };

  const formatValue = (val: number | undefined, unit: string) => {
    if (val === undefined) return '測定中...';
    if (unit === 'ms') return `${Math.round(val)}ms`;
    if (unit === 'score') return val.toFixed(3);
    return `${val}${unit}`;
  };

  return (
    <div className={cn(
      'rounded-lg border p-4 transition-all duration-200',
      statusColors[status]
    )}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-sm uppercase">{name}</h4>
        <div className="group relative">
          <Info className="h-4 w-4 opacity-50 cursor-help" />
          <div className="absolute right-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {description}
          </div>
        </div>
      </div>
      <div className="text-2xl font-bold">
        {formatValue(value, unit)}
      </div>
      {value !== undefined && (
        <div className="text-xs mt-1 opacity-70">
          {status === 'good' && '良好'}
          {status === 'needs-improvement' && '改善が必要'}
          {status === 'poor' && '要改善'}
        </div>
      )}
    </div>
  );
}

export function WebVitalsDisplay() {
  const metrics = useWebVitals();

  const coreWebVitals = [
    { name: 'lcp', value: metrics.lcp, unit: 'ms' },
    { name: 'fid', value: metrics.fid, unit: 'ms' },
    { name: 'cls', value: metrics.cls, unit: 'score' },
    { name: 'inp', value: metrics.inp, unit: 'ms' },
  ];

  const additionalMetrics = [
    { name: 'fcp', value: metrics.fcp, unit: 'ms' },
    { name: 'ttfb', value: metrics.ttfb, unit: 'ms' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Core Web Vitals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {coreWebVitals.map((metric) => (
            <MetricCard key={metric.name} {...metric} />
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">追加のパフォーマンスメトリクス</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {additionalMetrics.map((metric) => (
            <MetricCard key={metric.name} {...metric} />
          ))}
        </div>
      </div>
    </div>
  );
}