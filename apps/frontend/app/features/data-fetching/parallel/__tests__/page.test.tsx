import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ParallelPage, { metadata } from '../page';

// Container をモック
vi.mock('../_containers/container', () => ({
  ParallelContainer: () => <div data-testid="parallel-container">Parallel Container</div>,
}));

describe('ParallelPage', () => {
  it('should render ParallelContainer', async () => {
    const { getByTestId } = render(await ParallelPage());
    expect(getByTestId('parallel-container')).toBeInTheDocument();
  });

  it('should have correct metadata', () => {
    expect(metadata.title).toBe('Parallel Data Fetching Demo');
    expect(metadata.description).toBe('Parallel data fetching with Promise.all demonstration');
  });
});