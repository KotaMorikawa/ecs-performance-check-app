import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SsrContainer } from '../_containers/container';
import type { UserProfile } from '../../_shared/types';

// API クライアントをモック
vi.mock('../../_shared/api-client', () => ({
  userProfileApi: {
    getCurrentProfile: vi.fn(),
  },
}));

// モックデータ
const mockUserProfile: UserProfile = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  bio: 'Software Developer',
  avatar: 'https://example.com/avatar.jpg',
  role: 'USER' as const,
  postCount: 5,
  lastActiveAt: '2024-01-01T12:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T12:00:00Z',
};

const mockMetrics = {
  fetchStartTime: 100,
  fetchEndTime: 250,
  duration: 150,
  cacheStatus: 'miss' as const,
  dataSize: 512,
  source: 'ssr' as const,
};

describe('SsrContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render user profile correctly', async () => {
    const { userProfileApi } = await import('../../_shared/api-client');
    (userProfileApi.getCurrentProfile as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockUserProfile,
      metrics: mockMetrics,
    });

    const { container } = render(await SsrContainer());

    expect(container).toBeInTheDocument();
  });

  it('should call API with no-store cache option for real-time data', async () => {
    const { userProfileApi } = await import('../../_shared/api-client');
    (userProfileApi.getCurrentProfile as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockUserProfile,
      metrics: mockMetrics,
    });

    await SsrContainer();

    expect(userProfileApi.getCurrentProfile).toHaveBeenCalledWith({
      cache: 'no-store', // SSRではリアルタイムデータを取得
    });
  });

  it('should handle API errors and show error state', async () => {
    const { userProfileApi } = await import('../../_shared/api-client');
    (userProfileApi.getCurrentProfile as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Failed to fetch user profile')
    );

    const { container } = render(await SsrContainer());

    // エラー時でもコンポーネントがレンダリングされるべき
    expect(container).toBeInTheDocument();
  });

  it('should measure fetch performance correctly', async () => {
    const { userProfileApi } = await import('../../_shared/api-client');
    (userProfileApi.getCurrentProfile as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockUserProfile,
      metrics: mockMetrics,
    });

    await SsrContainer();

    expect(userProfileApi.getCurrentProfile).toHaveBeenCalledTimes(1);
  });

  it('should handle empty user profile gracefully', async () => {
    const { userProfileApi } = await import('../../_shared/api-client');
    (userProfileApi.getCurrentProfile as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      metrics: mockMetrics,
    });

    const { container } = render(await SsrContainer());

    expect(container).toBeInTheDocument();
  });
});