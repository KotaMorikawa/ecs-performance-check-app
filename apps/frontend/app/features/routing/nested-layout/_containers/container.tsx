'use client';

import { useEffect, useState } from 'react';
import { NestedLayoutPresentational } from './presentational';

interface LayoutLevel {
  name: string;
  path: string;
  level: number;
  description: string;
}

export function NestedLayoutContainer() {
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
  }, []);

  const layoutHierarchy: LayoutLevel[] = [
    {
      name: 'Root Layout',
      path: 'app/layout.tsx',
      level: 1,
      description: 'HTML, Body, グローバルスタイルを提供'
    },
    {
      name: 'Features Layout',
      path: 'app/features/layout.tsx',
      level: 2,
      description: '機能共通のナビゲーションやスタイル'
    },
    {
      name: 'Routing Layout',
      path: 'app/features/routing/layout.tsx',
      level: 3,
      description: 'ルーティング機能専用のレイアウト'
    },
    {
      name: 'Nested Layout',
      path: 'app/features/routing/nested-layout/layout.tsx',
      level: 4,
      description: 'ネストされたページ専用のサイドバーとヘッダー'
    },
    {
      name: 'Page Component',
      path: 'app/features/routing/nested-layout/page.tsx',
      level: 5,
      description: '実際のページコンテンツ'
    }
  ];

  return (
    <NestedLayoutPresentational
      renderTime={renderTime}
      layoutHierarchy={layoutHierarchy}
    />
  );
}