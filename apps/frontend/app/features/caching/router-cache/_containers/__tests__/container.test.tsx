// RouterCacheContainer Server Componentのテスト

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterCacheContainer } from '../container';
import { cacheTestApi } from '../../../_shared/cache-api-client';

// モック設定
vi.mock('../../../_shared/cache-api-client');
vi.mock('../presentational', () => ({
  RouterCachePresentational: () => (
    <div data-testid="presentational">
      <div data-testid="data-count">0</div>
      <div>Router Cache Demo Component</div>
    </div>
  ),
}));

// performance.now のモック
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: { now: mockPerformanceNow },
  writable: true,
});

const mockCacheTestApi = vi.mocked(cacheTestApi);

describe('RouterCacheContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceNow.mockReturnValue(100);
  });

  describe('正常なレンダリング', () => {
    it('should render successfully', async () => {
      // Act
      const Component = await RouterCacheContainer();
      render(Component);

      // Assert
      expect(screen.getByTestId('presentational')).toBeInTheDocument();
      expect(screen.getByTestId('data-count')).toHaveTextContent('0');
      expect(screen.getByText('Router Cache Demo Component')).toBeInTheDocument();
    });

    it('should not call API since router cache is client-side focused', async () => {
      // Act
      await RouterCacheContainer();

      // Assert
      expect(mockCacheTestApi.getTestData).not.toHaveBeenCalled();
    });

    it('should render suspense fallback', async () => {
      // Act
      const Component = await RouterCacheContainer();

      // Assert
      expect(Component.props.fallback).toEqual(<div>Loading router cache demo...</div>);
    });
  });

  describe('コンポーネント動作', () => {
    it('should render router cache demo component', async () => {
      // Act
      const Component = await RouterCacheContainer();
      render(Component);

      // Assert
      expect(screen.getByTestId('presentational')).toBeInTheDocument();
      expect(screen.getByText('Router Cache Demo Component')).toBeInTheDocument();
    });

    it('should not perform data fetching operations', async () => {
      // Act
      await RouterCacheContainer();

      // Assert
      expect(mockCacheTestApi.getTestData).not.toHaveBeenCalled();
    });
  });

  describe('Suspense integration', () => {
    it('should render with Suspense wrapper', async () => {
      // Act
      const Component = await RouterCacheContainer();

      // Assert
      expect(Component.props.fallback).toEqual(
        <div>Loading router cache demo...</div>
      );
    });
  });
});