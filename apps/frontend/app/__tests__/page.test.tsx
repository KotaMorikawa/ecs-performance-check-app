import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from '../page';

// TDD: ホームページの実装済みページリンクテスト
describe('Home Page', () => {
  it('プロジェクトタイトルを表示すべき', () => {
    render(<Home />);
    
    expect(
      screen.getByText(/ECS Performance Check App/i)
    ).toBeInTheDocument();
  });

  it('プロジェクトの説明を表示すべき', () => {
    render(<Home />);
    
    expect(
      screen.getByText(/Next.js 15.3.4の主要機能をAWS ECS環境で動作させ、パフォーマンスメトリクスを可視化するデモアプリケーション/i)
    ).toBeInTheDocument();
  });

  it('実装済み機能セクションを表示すべき', () => {
    render(<Home />);
    
    expect(
      screen.getByText('実装済み機能')
    ).toBeInTheDocument();
  });

  it('基本ルーティング機能へのリンクを表示すべき', () => {
    render(<Home />);
    
    const routingLink = screen.getByRole('link', { name: /基本ルーティング/i });
    expect(routingLink).toBeInTheDocument();
    expect(routingLink).toHaveAttribute('href', '/features/routing/basic');
  });

  it('実装予定機能セクションを表示すべき', () => {
    render(<Home />);
    
    expect(
      screen.getByText('実装予定機能')
    ).toBeInTheDocument();
  });

  it('実装予定機能のリストを表示すべき', () => {
    render(<Home />);
    
    // 実装予定の機能名を確認
    expect(screen.getByText('Server Actions')).toBeInTheDocument();
    expect(screen.getByText('データフェッチング')).toBeInTheDocument();
    expect(screen.getByText('キャッシュ戦略')).toBeInTheDocument();
    expect(screen.getByText('Middleware')).toBeInTheDocument();
  });

  it('プロジェクト概要セクションを表示すべき', () => {
    render(<Home />);
    
    expect(
      screen.getByText('プロジェクト概要')
    ).toBeInTheDocument();
    
    expect(
      screen.getByText(/AWS ECSサイドカーパターン/i)
    ).toBeInTheDocument();
  });

  it('技術スタック情報を表示すべき', () => {
    render(<Home />);
    
    // 技術スタックセクションの見出しを確認
    expect(screen.getByText('技術スタック')).toBeInTheDocument();
    
    // Badgeコンポーネント内の技術名を確認
    const techStackBadges = screen.getAllByText('Next.js 15.3.4');
    expect(techStackBadges.length).toBeGreaterThan(0);
    expect(screen.getByText('React 18')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Tailwind CSS')).toBeInTheDocument();
  });

  it('GitHub リポジトリへのリンクを表示すべき', () => {
    render(<Home />);
    
    const githubLink = screen.getByRole('link', { name: /GitHub で見る/i });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('target', '_blank');
  });
});