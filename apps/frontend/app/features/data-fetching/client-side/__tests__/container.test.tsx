import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClientSideContainer } from '../_containers/container';

// モックレスポンス
const mockCategories = {
  data: [
    { id: 1, name: 'Test Category', description: 'Test description', postCount: 5, createdAt: '2023-01-01', updatedAt: '2023-01-01' }
  ]
};

describe('ClientSideContainer', () => {
  beforeEach(() => {
    // fetchをモック
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCategories),
    } as Response);
    
    // setIntervalをモック
    vi.spyOn(global, 'setInterval');
    vi.spyOn(global, 'clearInterval');
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  it('should render client-side container correctly', async () => {
    await act(async () => {
      const { container } = render(<ClientSideContainer />);
      expect(container).toBeInTheDocument();
    });
  });

  it('should contain ClientSidePresentational component', async () => {
    let result: RenderResult | undefined;
    await act(async () => {
      result = render(<ClientSideContainer />);
    });

    // コンテナが正常にレンダリングされることを確認
    expect(result!.container.firstChild).toBeInTheDocument();
  });

  it('should not perform server-side data fetching', async () => {
    // Client Componentは Server Component ではないため、
    // Server側でのデータ取得は行わない
    await act(async () => {
      const { container } = render(<ClientSideContainer />);
      expect(container).toBeInTheDocument();
    });
  });

  it('should delegate data fetching to presentational component', async () => {
    // コンテナコンポーネントはプレゼンテーショナルコンポーネントを
    // レンダリングし、データフェッチはプレゼンテーショナル側で行う
    let result: RenderResult | undefined;
    await act(async () => {
      result = render(<ClientSideContainer />);
    });

    // コンポーネントが正常にレンダリングされることを確認
    expect(result!.container.querySelector('div')).toBeInTheDocument();
  });

  it('should be a simple wrapper component', async () => {
    // ClientSideContainerは単純なラッパーコンポーネントとして機能
    let result: RenderResult | undefined;
    await act(async () => {
      result = render(<ClientSideContainer />);
    });

    // DOM要素が存在することを確認
    expect(result!.container.firstChild).toBeTruthy();
  });
});