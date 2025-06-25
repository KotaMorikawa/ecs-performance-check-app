import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BasicRoutingPage from '../page';

// TDD: 基本ルーティング機能の統合テスト
describe('Basic Routing Page - Integration Tests', () => {
  it('ページタイトルを表示すべき', () => {
    render(<BasicRoutingPage />);
    
    expect(
      screen.getByRole('heading', { 
        name: /Basic App Router/i 
      })
    ).toBeInTheDocument();
  });

  it('App Routerの説明を表示すべき', () => {
    render(<BasicRoutingPage />);
    
    // ヘッダー部分の説明
    expect(
      screen.getByText(/Next.js 15.3.4 の App Router を使用した基本的なルーティング機能のデモ$/i)
    ).toBeInTheDocument();
  });

  it('パフォーマンスメトリクス表示エリアを含むべき', () => {
    render(<BasicRoutingPage />);
    
    expect(
      screen.getByTestId('performance-metrics')
    ).toBeInTheDocument();
  });

  it('コード表示機能を含むべき', () => {
    render(<BasicRoutingPage />);
    
    expect(
      screen.getByRole('button', { name: /コードを表示/i })
    ).toBeInTheDocument();
  });

  it('レンダリング時間を測定・表示すべき', () => {
    render(<BasicRoutingPage />);
    
    const renderTimeElement = screen.getByTestId('render-time');
    expect(renderTimeElement).toBeInTheDocument();
    
    // レンダリング時間の具体的な表示を確認
    expect(renderTimeElement).toHaveTextContent(/クライアントレンダリング時間:/);
    expect(renderTimeElement).toHaveTextContent(/サーバータイムスタンプ:/);
  });

  it('Core Web Vitalsメトリクスを表示すべき', () => {
    render(<BasicRoutingPage />);
    
    // パフォーマンスメトリクスセクション内でCore Web Vitals表示確認
    const metricsSection = screen.getByTestId('performance-metrics');
    expect(metricsSection).toBeInTheDocument();
    
    // Core Web Vitalsセクションの確認（複数要素があるため getAllByText を使用）
    const coreWebVitalsElements = screen.getAllByText('Core Web Vitals');
    expect(coreWebVitalsElements.length).toBeGreaterThan(0);
    
    // メトリクス名の確認（大文字表記）
    expect(screen.getByText('LCP')).toBeInTheDocument();
    expect(screen.getByText('CLS')).toBeInTheDocument();
    expect(screen.getByText('INP')).toBeInTheDocument();
    
    // 追加のパフォーマンスメトリクスセクションの確認
    expect(screen.getByText('追加のパフォーマンスメトリクス')).toBeInTheDocument();
    expect(screen.getByText('FCP')).toBeInTheDocument();
    expect(screen.getByText('TTFB')).toBeInTheDocument();
  });

  it('機能説明セクションを表示すべき', () => {
    render(<BasicRoutingPage />);
    
    // 機能説明コンポーネントが表示されることを確認
    expect(screen.getByText('実現可能な機能')).toBeInTheDocument();
    expect(screen.getByText('確認方法')).toBeInTheDocument();
    expect(screen.getByText('ファイルベースルーティング')).toBeInTheDocument();
  });

  it('App Router機能の詳細情報を表示すべき', () => {
    render(<BasicRoutingPage />);
    
    // App Router固有の機能説明
    expect(screen.getByText(/Server Components/)).toBeInTheDocument();
    expect(screen.getByText(/Client Components/)).toBeInTheDocument();
    expect(screen.getByText(/URLアクセス/)).toBeInTheDocument();
  });
});