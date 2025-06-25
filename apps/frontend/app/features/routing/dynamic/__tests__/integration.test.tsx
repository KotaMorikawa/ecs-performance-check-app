import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DynamicRoutingPage from '../[id]/page';

// Next.js のルーティングパラメータをモック
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-123' }),
  useRouter: vi.fn()
}));

describe('Dynamic Routing Page', () => {
  it('動的IDパラメータを表示すべき', () => {
    render(<DynamicRoutingPage />);
    
    expect(screen.getByText(/test-123/)).toBeInTheDocument();
  });

  it('ページタイトルを表示すべき', () => {
    render(<DynamicRoutingPage />);
    
    expect(
      screen.getByRole('heading', { name: /Dynamic Routing/i })
    ).toBeInTheDocument();
  });

  it('動的ルーティングの説明を表示すべき', () => {
    render(<DynamicRoutingPage />);
    
    expect(
      screen.getByText(/URLパラメータに基づいて動的にページを生成/i)
    ).toBeInTheDocument();
  });

  it('パフォーマンスメトリクスを表示すべき', () => {
    render(<DynamicRoutingPage />);
    
    expect(screen.getByTestId('performance-metrics')).toBeInTheDocument();
    
    // Core Web Vitalsセクションの確認（複数要素があるため getAllByText を使用）
    const coreWebVitalsElements = screen.getAllByText('Core Web Vitals');
    expect(coreWebVitalsElements.length).toBeGreaterThan(0);
  });

  it('パラメータ情報カードを表示すべき', () => {
    render(<DynamicRoutingPage />);
    
    expect(screen.getByTestId('parameter-info')).toBeInTheDocument();
    expect(screen.getByText('パラメータ情報')).toBeInTheDocument();
  });

  it('動的データの読み込み状態を表示すべき', () => {
    render(<DynamicRoutingPage />);
    
    // 初期状態では読み込み中または空の状態
    const dataSection = screen.getByTestId('dynamic-data');
    expect(dataSection).toBeInTheDocument();
  });

  it('機能説明セクションを表示すべき', () => {
    render(<DynamicRoutingPage />);
    
    expect(screen.getByText('実現可能な機能')).toBeInTheDocument();
    expect(screen.getByText('確認方法')).toBeInTheDocument();
    expect(screen.getByText('動的セグメント ([id])')).toBeInTheDocument();
  });
});