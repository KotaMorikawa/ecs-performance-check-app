import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClientSidePresentational } from '../_containers/presentational';
import type { Category } from '../../_shared/types';

// Global fetch のモック
const mockFetch = vi.fn();

// モックデータ
const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Technology',
    slug: 'technology',
    description: 'Tech-related posts',
    postCount: 10,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z',
  },
  {
    id: 2,
    name: 'Science',
    slug: 'science',
    description: 'Science-related posts',
    postCount: 5,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T12:00:00Z',
  },
];

const mockApiResponse = {
  data: mockCategories,
  success: true,
};

describe('ClientSidePresentational', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Global fetch をモック
    global.fetch = mockFetch;
    // Performance API のモック
    global.performance.now = vi.fn().mockReturnValue(1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show loading state initially', () => {
    // fetch が pending の状態をシミュレート
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<ClientSidePresentational />);

    expect(screen.getByText(/loading categories/i)).toBeInTheDocument();
  });

  it('should display data when loaded successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    render(<ClientSidePresentational />);

    await waitFor(() => {
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Science')).toBeInTheDocument();
    });

    expect(screen.getByText('10 posts')).toBeInTheDocument();
    expect(screen.getByText('5 posts')).toBeInTheDocument();
  });

  it('should show error state when fetch fails', async () => {
    const errorMessage = 'Failed to fetch data';
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));

    render(<ClientSidePresentational />);

    await waitFor(() => {
      expect(screen.getByText(/error loading client-side content/i)).toBeInTheDocument();
    }, { timeout: 10000 });

    // エラー詳細メッセージを部分一致で確認
    expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
  });

  it('should allow manual refetch', async () => {
    // 初回の fetch をモック
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    render(<ClientSidePresentational />);

    // 初回データが読み込まれるまで待機
    await waitFor(() => {
      expect(screen.getByText('Technology')).toBeInTheDocument();
    }, { timeout: 10000 });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    
    await act(async () => {
      fireEvent.click(refreshButton);
    });

    // fetch が2回呼ばれることを確認（初回 + リフレッシュ）
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    }, { timeout: 10000 });
  });

  it('should display basic UI elements', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    render(<ClientSidePresentational />);

    // データが読み込まれるまで待機
    await waitFor(() => {
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    // 基本的なUIエレメントの存在確認
    expect(screen.getByRole('tab', { name: /content/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /performance/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /how client-side fetching works/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show code/i })).toBeInTheDocument();
  });

  it('should handle component mounting', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    render(<ClientSidePresentational />);

    // コンポーネントが正常にマウントされ、初回データ取得が行われることを確認
    await waitFor(() => {
      expect(screen.getByText('Technology')).toBeInTheDocument();
    }, { timeout: 10000 });

    // 初回のfetch呼び出しを確認
    expect(mockFetch).toHaveBeenCalledWith('/api/categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });
  });

  it('should increment refresh count when manually refreshed', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    render(<ClientSidePresentational />);

    // 初回データが読み込まれるまで待機
    await waitFor(() => {
      expect(screen.getByText('Technology')).toBeInTheDocument();
    }, { timeout: 10000 });

    // リフレッシュボタンをクリック
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    
    await act(async () => {
      fireEvent.click(refreshButton);
    });

    // 手動リフレッシュ後、リフレッシュカウントが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('Refreshed 1 times')).toBeInTheDocument();
    }, { timeout: 10000 });

    // fetchが2回呼ばれることを確認（初回 + リフレッシュ）
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});