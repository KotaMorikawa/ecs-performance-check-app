import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoadingErrorPage from '../page';

// console.errorをモック
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Loading Error Page', () => {
  afterEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('ページタイトルを表示すべき', () => {
    render(<LoadingErrorPage />);
    
    expect(
      screen.getByRole('heading', { name: /Loading & Error Handling/i })
    ).toBeInTheDocument();
  });

  it('ローディング・エラーハンドリングの説明を表示すべき', () => {
    render(<LoadingErrorPage />);
    
    expect(
      screen.getByText(/Next.js 15.3.4のローディングUIとエラーバウンダリ機能のデモ/i)
    ).toBeInTheDocument();
  });

  it('ローディング状態のデモを表示すべき', () => {
    render(<LoadingErrorPage />);
    
    expect(screen.getByTestId('loading-demo')).toBeInTheDocument();
    expect(screen.getByText('ローディング状態のデモ')).toBeInTheDocument();
  });

  it('エラーハンドリングのデモを表示すべき', () => {
    render(<LoadingErrorPage />);
    
    expect(screen.getByTestId('error-demo')).toBeInTheDocument();
    expect(screen.getByText('エラーハンドリングのデモ')).toBeInTheDocument();
  });

  it('データを読み込むボタンが動作すべき', async () => {
    render(<LoadingErrorPage />);
    
    const loadDataButton = screen.getByText('データを読み込む');
    expect(loadDataButton).toBeInTheDocument();
    
    fireEvent.click(loadDataButton);
    
    // ローディング状態の確認（複数要素があるため getAllByText を使用）
    const loadingElements = screen.getAllByText('読み込み中...');
    expect(loadingElements.length).toBeGreaterThan(0);
    
    // データ読み込み完了の確認
    await waitFor(() => {
      expect(screen.getByText(/データ読み込み完了/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('エラーを発生させるボタンが動作すべき', async () => {
    render(<LoadingErrorPage />);
    
    const errorButton = screen.getByText('エラーを発生させる');
    expect(errorButton).toBeInTheDocument();
    
    fireEvent.click(errorButton);
    
    // エラー状態の確認
    await waitFor(() => {
      expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
    });
  });

  it('パフォーマンスメトリクスを表示すべき', () => {
    render(<LoadingErrorPage />);
    
    expect(screen.getByTestId('performance-metrics')).toBeInTheDocument();
    
    // Core Web Vitalsセクションの確認（複数要素があるため getAllByText を使用）
    const coreWebVitalsElements = screen.getAllByText('Core Web Vitals');
    expect(coreWebVitalsElements.length).toBeGreaterThan(0);
  });

  it('機能説明セクションを表示すべき', () => {
    render(<LoadingErrorPage />);
    
    expect(screen.getByText('実現可能な機能')).toBeInTheDocument();
    expect(screen.getByText('確認方法')).toBeInTheDocument();
    expect(screen.getByText('Loading UI')).toBeInTheDocument();
  });
});