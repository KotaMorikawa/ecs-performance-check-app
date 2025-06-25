import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ParallelInterceptPage from '../page';

describe('Parallel & Intercepting Routes Page', () => {
  it('ページタイトルを表示すべき', () => {
    render(<ParallelInterceptPage />);
    
    expect(
      screen.getByRole('heading', { name: /Parallel & Intercepting Routes/i })
    ).toBeInTheDocument();
  });

  it('並列・インターセプトルートの説明を表示すべき', () => {
    render(<ParallelInterceptPage />);
    
    expect(
      screen.getByText(/Next.js 15.3.4の並列ルート（Parallel Routes）とインターセプトルート（Intercepting Routes）機能のデモ/i)
    ).toBeInTheDocument();
  });

  it('並列ルートのデモセクションを表示すべき', () => {
    render(<ParallelInterceptPage />);
    
    expect(screen.getByTestId('parallel-routes-demo')).toBeInTheDocument();
    expect(screen.getByText('並列ルート（Parallel Routes）デモ')).toBeInTheDocument();
  });

  it('インターセプトルートのデモセクションを表示すべき', () => {
    render(<ParallelInterceptPage />);
    
    expect(screen.getByTestId('intercepting-routes-demo')).toBeInTheDocument();
    expect(screen.getByText('インターセプトルート（Intercepting Routes）デモ')).toBeInTheDocument();
  });

  it('並列コンテンツの切り替えボタンが動作すべき', () => {
    render(<ParallelInterceptPage />);
    
    const analyticsButton = screen.getByRole('button', { name: /Analytics/i });
    const teamButton = screen.getByRole('button', { name: /Team/i });
    const settingsButton = screen.getByRole('button', { name: /Settings/i });
    
    expect(analyticsButton).toBeInTheDocument();
    expect(teamButton).toBeInTheDocument();
    expect(settingsButton).toBeInTheDocument();
    
    // Teamボタンをクリック
    fireEvent.click(teamButton);
    expect(screen.getByText('並列スロット (@team)')).toBeInTheDocument();
    expect(screen.getByText('チームメンバー: 8人')).toBeInTheDocument();
    
    // Settingsボタンをクリック
    fireEvent.click(settingsButton);
    expect(screen.getByText('並列スロット (@settings)')).toBeInTheDocument();
    expect(screen.getByText('言語: 日本語')).toBeInTheDocument();
  });

  it('モーダル表示ボタンが動作すべき', () => {
    render(<ParallelInterceptPage />);
    
    const modalButton = screen.getByRole('button', { name: /画像をモーダルで表示/i });
    expect(modalButton).toBeInTheDocument();
    
    // モーダルを開く
    fireEvent.click(modalButton);
    expect(screen.getByText('インターセプトルートモーダル')).toBeInTheDocument();
    expect(screen.getByText('画像プレースホルダー')).toBeInTheDocument();
    
    // モーダルを閉じる
    const closeButton = screen.getByRole('button', { name: /閉じる/i });
    fireEvent.click(closeButton);
    expect(screen.queryByText('インターセプトルートモーダル')).not.toBeInTheDocument();
  });

  it('パフォーマンスメトリクスを表示すべき', () => {
    render(<ParallelInterceptPage />);
    
    expect(screen.getByTestId('performance-metrics')).toBeInTheDocument();
    
    // Core Web Vitalsセクションの確認（複数要素があるため getAllByText を使用）
    const coreWebVitalsElements = screen.getAllByText('Core Web Vitals');
    expect(coreWebVitalsElements.length).toBeGreaterThan(0);
  });

  it('実現可能な機能セクションを表示すべき', () => {
    render(<ParallelInterceptPage />);
    
    expect(screen.getByText('実現可能な機能')).toBeInTheDocument();
    expect(screen.getByText('並列ルート')).toBeInTheDocument();
    expect(screen.getByText('インターセプトルート')).toBeInTheDocument();
    expect(screen.getByText('ダッシュボードの複数セクション同時表示')).toBeInTheDocument();
    expect(screen.getByText('画像ギャラリーのモーダル表示')).toBeInTheDocument();
  });

  it('確認方法セクションを表示すべき', () => {
    render(<ParallelInterceptPage />);
    
    expect(screen.getByText('確認方法')).toBeInTheDocument();
    expect(screen.getByText('並列ルート (@slot)')).toBeInTheDocument();
    expect(screen.getByText('インターセプト (.) (..) (...)')).toBeInTheDocument();
  });

  it('インターセプトルートの仕組み説明を表示すべき', () => {
    render(<ParallelInterceptPage />);
    
    expect(screen.getByText('インターセプトルートの仕組み')).toBeInTheDocument();
    expect(screen.getByText(/\(\.\) - 同じレベルのセグメントをインターセプト/)).toBeInTheDocument();
    expect(screen.getByText(/\(\.\.\) - 1つ上のレベルのセグメントをインターセプト/)).toBeInTheDocument();
  });
});