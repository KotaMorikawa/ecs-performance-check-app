'use client';

import { useState, useCallback, useRef } from 'react';

interface OperationMetric {
  id: string;
  operation: 'create' | 'update' | 'delete';
  mode: 'optimistic' | 'traditional' | 'comparison';
  startTime: number;
  endTime: number;
  duration: number;
  userPerceivedTime: number; // ユーザー体感時間
  success: boolean;
  timestamp: string;
}

interface PerformanceStats {
  totalOperations: number;
  optimisticAvg: number;
  traditionalAvg: number;
  improvementRate: number;
  timeSaved: number;
  userSatisfactionImprovement: number;
}

/**
 * パフォーマンス測定用カスタムフック
 * 
 * Features:
 * - 操作時間の高精度測定
 * - 楽観的更新と従来動作の比較
 * - リアルタイム統計計算
 * - 操作履歴の管理
 */
export function usePerformanceMeasurement() {
  const [operationHistory, setOperationHistory] = useState<OperationMetric[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const currentOperation = useRef<{
    id: string;
    operation: string;
    mode: string;
    startTime: number;
  } | null>(null);

  // 操作測定の開始
  const startMeasurement = useCallback((
    operation: 'create' | 'update' | 'delete',
    mode: 'optimistic' | 'traditional' | 'comparison'
  ): string => {
    const id = crypto.randomUUID();
    const startTime = performance.now();
    
    currentOperation.current = {
      id,
      operation,
      mode,
      startTime,
    };
    
    setIsRecording(true);
    return id;
  }, []);

  // 操作測定の終了
  const endMeasurement = useCallback((id: string, success: boolean = true) => {
    if (!currentOperation.current || currentOperation.current.id !== id) {
      console.warn('Invalid measurement ID or no active measurement');
      return;
    }

    const endTime = performance.now();
    const { operation, mode, startTime } = currentOperation.current;
    const duration = endTime - startTime;
    
    // ユーザー体感時間の計算
    // 楽観的更新の場合は体感時間0、従来動作は実測時間
    const userPerceivedTime = mode === 'optimistic' ? 0 : duration;

    const metric: OperationMetric = {
      id,
      operation: operation as 'create' | 'update' | 'delete',
      mode: mode as 'optimistic' | 'traditional' | 'comparison',
      startTime,
      endTime,
      duration,
      userPerceivedTime,
      success,
      timestamp: new Date().toISOString(),
    };

    setOperationHistory(prev => [...prev, metric]);
    setIsRecording(false);
    currentOperation.current = null;

    return metric;
  }, []);

  // 測定付きアクション実行
  const measureAction = useCallback(async <T>(
    operation: 'create' | 'update' | 'delete',
    mode: 'optimistic' | 'traditional' | 'comparison',
    action: () => Promise<T>
  ): Promise<T> => {
    const measurementId = startMeasurement(operation, mode);
    
    try {
      const result = await action();
      endMeasurement(measurementId, true);
      return result;
    } catch (error) {
      endMeasurement(measurementId, false);
      throw error;
    }
  }, [startMeasurement, endMeasurement]);

  // 統計計算
  const calculateStats = useCallback((): PerformanceStats => {
    if (operationHistory.length === 0) {
      return {
        totalOperations: 0,
        optimisticAvg: 0,
        traditionalAvg: 0,
        improvementRate: 0,
        timeSaved: 0,
        userSatisfactionImprovement: 0,
      };
    }

    const optimisticMetrics = operationHistory.filter(m => m.mode === 'optimistic');
    const traditionalMetrics = operationHistory.filter(m => m.mode === 'traditional');
    
    const optimisticAvg = optimisticMetrics.length > 0
      ? optimisticMetrics.reduce((sum, m) => sum + m.userPerceivedTime, 0) / optimisticMetrics.length
      : 0;
    
    const traditionalAvg = traditionalMetrics.length > 0
      ? traditionalMetrics.reduce((sum, m) => sum + m.userPerceivedTime, 0) / traditionalMetrics.length
      : 0;

    const improvementRate = traditionalAvg > 0
      ? ((traditionalAvg - optimisticAvg) / traditionalAvg) * 100
      : 0;

    const timeSaved = traditionalAvg - optimisticAvg;
    
    // ユーザー満足度改善率の計算（体感速度改善に基づく）
    const userSatisfactionImprovement = Math.min(improvementRate * 1.2, 100);

    return {
      totalOperations: operationHistory.length,
      optimisticAvg: Math.round(optimisticAvg),
      traditionalAvg: Math.round(traditionalAvg),
      improvementRate: Math.round(improvementRate * 10) / 10,
      timeSaved: Math.round(timeSaved),
      userSatisfactionImprovement: Math.round(userSatisfactionImprovement * 10) / 10,
    };
  }, [operationHistory]);

  // 操作別統計
  const getOperationStats = useCallback((operation: 'create' | 'update' | 'delete') => {
    const operationMetrics = operationHistory.filter(m => m.operation === operation);
    const optimistic = operationMetrics.filter(m => m.mode === 'optimistic');
    const traditional = operationMetrics.filter(m => m.mode === 'traditional');
    
    return {
      count: operationMetrics.length,
      optimisticAvg: optimistic.length > 0
        ? Math.round(optimistic.reduce((sum, m) => sum + m.userPerceivedTime, 0) / optimistic.length)
        : 0,
      traditionalAvg: traditional.length > 0
        ? Math.round(traditional.reduce((sum, m) => sum + m.userPerceivedTime, 0) / traditional.length)
        : 0,
    };
  }, [operationHistory]);

  // 今日の統計
  const getTodayStats = useCallback(() => {
    const today = new Date().toDateString();
    const todayMetrics = operationHistory.filter(m => 
      new Date(m.timestamp).toDateString() === today
    );
    
    const createCount = todayMetrics.filter(m => m.operation === 'create').length;
    const updateCount = todayMetrics.filter(m => m.operation === 'update').length;
    const deleteCount = todayMetrics.filter(m => m.operation === 'delete').length;
    
    return {
      total: todayMetrics.length,
      creates: createCount,
      updates: updateCount,
      deletes: deleteCount,
    };
  }, [operationHistory]);

  // 履歴クリア
  const clearHistory = useCallback(() => {
    setOperationHistory([]);
  }, []);

  // 最新メトリクス（リアルタイム表示用）
  const latestMetrics = operationHistory.slice(-5).reverse();

  return {
    // 状態
    operationHistory,
    isRecording,
    latestMetrics,
    
    // アクション
    startMeasurement,
    endMeasurement,
    measureAction,
    clearHistory,
    
    // 統計
    calculateStats,
    getOperationStats,
    getTodayStats,
  };
}