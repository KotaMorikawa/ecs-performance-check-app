import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SsrPresentational } from '../_containers/presentational';
import type { DataFetchMetrics, UserProfile } from '../../_shared/types';

// モックデータ
const mockUserProfile: UserProfile = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  bio: 'Test bio for SSR demonstration',
  avatar: 'https://example.com/avatar.jpg',
  isVerified: true,
  postsCount: 42,
  joinedAt: '2024-01-01T00:00:00Z',
  followersCount: 150,
  followingCount: 75,
};

const mockMetrics: DataFetchMetrics = {
  source: 'ssr',
  duration: 85,
  timestamp: '2024-01-01T12:00:00Z',
  dataSize: 1024,
  cached: false,
};

describe('SsrPresentational', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render SSR demo correctly', () => {
    render(
      <SsrPresentational
        userProfile={mockUserProfile}
        metrics={mockMetrics}
        error={null}
      />
    );

    // ヘッダーが表示されていることを確認
    expect(screen.getByText('SSR Data Fetching Demo')).toBeInTheDocument();
    expect(screen.getByText(/Server-Side Rendering with real-time data/)).toBeInTheDocument();
  });

  it('should display user profile information', () => {
    render(
      <SsrPresentational
        userProfile={mockUserProfile}
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test bio for SSR demonstration')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument(); // Post count
    expect(screen.getByText('Posts')).toBeInTheDocument(); // Post label
  });

  it('should handle null user profile', () => {
    render(
      <SsrPresentational
        userProfile={null}
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText('No user profile data available')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    const errorMessage = 'Failed to fetch user profile';

    render(
      <SsrPresentational
        userProfile={null}
        metrics={null}
        error={errorMessage}
      />
    );

    expect(screen.getByText(`Error loading SSR content: ${errorMessage}`)).toBeInTheDocument();
  });

  it('should toggle code display', () => {
    render(
      <SsrPresentational
        userProfile={mockUserProfile}
        metrics={mockMetrics}
        error={null}
      />
    );

    // 初期状態ではコードが表示されていない
    expect(screen.queryByText('ソースコード')).not.toBeInTheDocument();

    // Show Codeボタンをクリック
    const toggleButton = screen.getByRole('button', { name: /show code/i });
    fireEvent.click(toggleButton);

    // コードが表示される
    expect(screen.getByText('ソースコード')).toBeInTheDocument();
    expect(screen.getByText(/この機能の実装コードを確認できます/)).toBeInTheDocument();

    // Hide Codeボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: /hide code/i }));

    // コードが非表示になる
    expect(screen.queryByText('ソースコード')).not.toBeInTheDocument();
  });

  it('should display performance metrics tab', () => {
    render(
      <SsrPresentational
        userProfile={mockUserProfile}
        metrics={mockMetrics}
        error={null}
      />
    );

    // Performance タブをクリック
    const performanceTab = screen.getByRole('tab', { name: /performance/i });
    fireEvent.click(performanceTab);

    // タブパネルが表示されることを確認
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('should display explanation tab', () => {
    render(
      <SsrPresentational
        userProfile={mockUserProfile}
        metrics={mockMetrics}
        error={null}
      />
    );

    // Explanation タブをクリック
    const explanationTab = screen.getByRole('tab', { name: /how ssr works/i });
    fireEvent.click(explanationTab);

    // タブパネルが表示されることを確認
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    
    // 基本的な説明コンテンツが表示されることを確認
    expect(screen.getByText('How SSR Works')).toBeInTheDocument();
  });

  it('should display user avatar initial', () => {
    render(
      <SsrPresentational
        userProfile={mockUserProfile}
        metrics={mockMetrics}
        error={null}
      />
    );

    // 名前の最初の文字が表示される
    expect(screen.getByText('T')).toBeInTheDocument(); // Test User の T
  });

  it('should handle anonymous user', () => {
    const dataWithAnonymousUser: UserProfile = {
      ...mockUserProfile,
      name: 'Anonymous User',
    };

    render(
      <SsrPresentational
        userProfile={dataWithAnonymousUser}
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText('Anonymous User')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument(); // Avatar fallback
  });

  it('should display user verification status', () => {
    const unverifiedUser: UserProfile = {
      ...mockUserProfile,
      isVerified: false,
    };

    render(
      <SsrPresentational
        userProfile={unverifiedUser}
        metrics={mockMetrics}
        error={null}
      />
    );

    // Verifiedバッジが表示されないことを確認
    expect(screen.queryByText('Verified')).not.toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument(); // posts countは表示される
    expect(screen.getByText('Posts')).toBeInTheDocument();
  });

  it('should display creation and update timestamps', () => {
    render(
      <SsrPresentational
        userProfile={mockUserProfile}
        metrics={mockMetrics}
        error={null}
      />
    );

    // タイムスタンプラベルが表示されることを確認（複数箇所に表示される）
    expect(screen.getAllByText('Joined')[0]).toBeInTheDocument();
  });

  it('should display SSR characteristics alert', () => {
    render(
      <SsrPresentational
        userProfile={mockUserProfile}
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText(/Real-time data:/)).toBeInTheDocument();
  });

  it('should handle missing bio', () => {
    const userWithoutBio: UserProfile = {
      ...mockUserProfile,
      bio: undefined,
    };

    render(
      <SsrPresentational
        userProfile={userWithoutBio}
        metrics={mockMetrics}
        error={null}
      />
    );

    // bioが表示されないことを確認
    expect(screen.queryByText('Test bio for SSR demonstration')).not.toBeInTheDocument();
    // 他の情報は表示される
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should display tabs correctly', () => {
    render(
      <SsrPresentational
        userProfile={mockUserProfile}
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByRole('tab', { name: /content/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /performance/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /how ssr works/i })).toBeInTheDocument();
  });

  it('should handle metrics without performance data', () => {
    render(
      <SsrPresentational
        userProfile={mockUserProfile}
        metrics={null}
        error={null}
      />
    );

    // Performance タブをクリック
    const performanceTab = screen.getByRole('tab', { name: /performance/i });
    fireEvent.click(performanceTab);

    // タブパネルが表示されることを確認
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('should show real-time data characteristics', () => {
    render(
      <SsrPresentational
        userProfile={mockUserProfile}
        metrics={mockMetrics}
        error={null}
      />
    );

    // Real-time data の特徴が表示されることを確認
    expect(screen.getByText(/Server-Side Rendering with real-time data/)).toBeInTheDocument();
  });

  it('should handle different post counts correctly', () => {
    const userWithManyPosts: UserProfile = {
      ...mockUserProfile,
      postsCount: 1000,
    };

    render(
      <SsrPresentational
        userProfile={userWithManyPosts}
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('Posts')).toBeInTheDocument();
  });

  it('should handle single post count', () => {
    const userWithOnePost: UserProfile = {
      ...mockUserProfile,
      postsCount: 1,
    };

    render(
      <SsrPresentational
        userProfile={userWithOnePost}
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument(); 
    expect(screen.getByText('Posts')).toBeInTheDocument();
  });

  it('should handle zero posts', () => {
    const userWithNoPosts: UserProfile = {
      ...mockUserProfile,
      postsCount: 0,
    };

    render(
      <SsrPresentational
        userProfile={userWithNoPosts}
        metrics={mockMetrics}
        error={null}
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Posts')).toBeInTheDocument();
  });
});