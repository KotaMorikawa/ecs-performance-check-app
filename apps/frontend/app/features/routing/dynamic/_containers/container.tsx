"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DynamicRoutingPresentational } from "./presentational";

export interface DynamicData {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  metadata: {
    type: string;
    category: string;
    tags: string[];
  };
}

export function DynamicRoutingContainer() {
  const params = useParams();
  const [renderTime, setRenderTime] = useState<number>(0);
  const [dynamicData, setDynamicData] = useState<DynamicData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const startTime = performance.now();
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
  }, []);

  // 動的データの模擬読み込み
  useEffect(() => {
    const loadDynamicData = async () => {
      setIsLoading(true);

      // 実際のAPIコールの代わりに、2秒の遅延をシミュレート
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockData: DynamicData = {
        id: params.id as string,
        title: `動的コンテンツ: ${params.id}`,
        content: `これは ID "${params.id}" に対応する動的に生成されたコンテンツです。実際のアプリケーションでは、この ID を使用してデータベースやAPIからデータを取得します。`,
        timestamp: new Date().toISOString(),
        metadata: {
          type: "dynamic-content",
          category: `${Array.from(params.id as string)[0]?.toUpperCase()}系`,
          tags: ["dynamic", "routing", "nextjs", "demo"],
        },
      };

      setDynamicData(mockData);
      setIsLoading(false);
    };

    if (params.id) {
      loadDynamicData();
    }
  }, [params.id]);

  const handleRefreshData = () => {
    setDynamicData(null);
    setIsLoading(true);

    // データを再読み込み
    setTimeout(() => {
      if (params.id) {
        const refreshedData: DynamicData = {
          id: params.id as string,
          title: `更新された動的コンテンツ: ${params.id}`,
          content: `これは更新された ID "${params.id}" のコンテンツです。タイムスタンプ: ${new Date().toLocaleString()}`,
          timestamp: new Date().toISOString(),
          metadata: {
            type: "refreshed-content",
            category: `${Array.from(params.id as string)[0]?.toUpperCase()}系`,
            tags: ["dynamic", "routing", "nextjs", "refreshed"],
          },
        };
        setDynamicData(refreshedData);
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <DynamicRoutingPresentational
      params={params as { id: string }}
      renderTime={renderTime}
      dynamicData={dynamicData}
      isLoading={isLoading}
      onRefreshData={handleRefreshData}
    />
  );
}
