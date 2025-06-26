import Link from 'next/link';
import type { Route } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// メタデータ
export const metadata = {
  title: 'Data Fetching Demo | Next.js Performance Check',
  description: 'Comprehensive demonstration of Next.js data fetching patterns: SSG, SSR, ISR, parallel, and client-side',
};

export default function DataFetchingPage() {
  const fetchingPatterns = [
    {
      title: 'SSG (Static Site Generation)',
      description: 'Pre-rendered at build time with generateStaticParams',
      href: '/features/data-fetching/ssg',
      badge: 'Static',
      badgeVariant: 'default' as const,
      characteristics: [
        'Build-time generation',
        'CDN cacheable',
        'Best performance',
        'Perfect for SEO',
      ],
      useCase: 'Product catalogs, marketing pages, documentation',
    },
    {
      title: 'SSR (Server-Side Rendering)',
      description: 'Rendered on each request with real-time data',
      href: '/features/data-fetching/ssr',
      badge: 'Server',
      badgeVariant: 'secondary' as const,
      characteristics: [
        'Request-time generation',
        'Always fresh data',
        'Personalized content',
        'Server computation',
      ],
      useCase: 'User dashboards, real-time displays, personalized content',
    },
    {
      title: 'ISR (Incremental Static Regeneration)',
      description: 'Static generation with time-based revalidation',
      href: '/features/data-fetching/isr',
      badge: 'Hybrid',
      badgeVariant: 'outline' as const,
      characteristics: [
        'Static + dynamic',
        'Background updates',
        'High cache efficiency',
        'Automatic freshness',
      ],
      useCase: 'Blog posts, news articles, content that updates periodically',
    },
    {
      title: 'Parallel Fetching',
      description: 'Multiple API endpoints with Promise.all',
      href: '/features/data-fetching/parallel',
      badge: 'Concurrent',
      badgeVariant: 'default' as const,
      characteristics: [
        'Simultaneous requests',
        'Reduced latency',
        'Better resource usage',
        'All-or-nothing loading',
      ],
      useCase: 'Dashboards, product pages with multiple data sources',
    },
    {
      title: 'Client-Side Fetching',
      description: 'Browser-based fetching with useEffect and SWR',
      href: '/features/data-fetching/client-side',
      badge: 'Client',
      badgeVariant: 'destructive' as const,
      characteristics: [
        'Browser execution',
        'Interactive updates',
        'Loading states',
        'Real-time polling',
      ],
      useCase: 'Interactive features, user-specific data, real-time updates',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Data Fetching Patterns</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Explore Next.js 15 data fetching strategies with performance metrics and real-world examples
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline">Next.js 15.3.4</Badge>
          <Badge variant="outline">App Router</Badge>
          <Badge variant="outline">Server Components</Badge>
          <Badge variant="outline">Performance Monitoring</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fetchingPatterns.map((pattern) => (
          <Card key={pattern.href} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">{pattern.title}</span>
                <Badge variant={pattern.badgeVariant}>
                  {pattern.badge}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {pattern.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Key Characteristics</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {pattern.characteristics.map((char, index) => (
                    <li key={index}>• {char}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Best Use Case</h4>
                <p className="text-sm text-muted-foreground">
                  {pattern.useCase}
                </p>
              </div>

              <Button asChild className="w-full">
                <Link href={pattern.href as Route}>
                  View Demo & Code
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Performance Comparison Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Pattern</th>
                  <th className="text-left p-2">First Load</th>
                  <th className="text-left p-2">Cache Hit Rate</th>
                  <th className="text-left p-2">Server Load</th>
                  <th className="text-left p-2">Data Freshness</th>
                  <th className="text-left p-2">SEO</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">SSG</td>
                  <td className="p-2">~50ms</td>
                  <td className="p-2">95-99%</td>
                  <td className="p-2">None</td>
                  <td className="p-2">Build time</td>
                  <td className="p-2">Perfect</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">SSR</td>
                  <td className="p-2">150-500ms</td>
                  <td className="p-2">0%</td>
                  <td className="p-2">High</td>
                  <td className="p-2">Real-time</td>
                  <td className="p-2">Perfect</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">ISR</td>
                  <td className="p-2">50-150ms</td>
                  <td className="p-2">85-95%</td>
                  <td className="p-2">Low</td>
                  <td className="p-2">Configurable</td>
                  <td className="p-2">Perfect</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Parallel</td>
                  <td className="p-2">100-300ms</td>
                  <td className="p-2">Varies</td>
                  <td className="p-2">Medium</td>
                  <td className="p-2">Depends</td>
                  <td className="p-2">Good</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Client-Side</td>
                  <td className="p-2">200-800ms</td>
                  <td className="p-2">0-50%</td>
                  <td className="p-2">Medium</td>
                  <td className="p-2">Real-time</td>
                  <td className="p-2">Limited</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="text-center space-y-4">
        <p className="text-muted-foreground">
          Each demo includes detailed performance metrics, implementation code, and architectural explanations.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href={"/features" as Route}>
              ← Back to Features
            </Link>
          </Button>
          <Button asChild>
            <Link href={"/features/caching" as Route}>
              Explore Caching Strategies →
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}