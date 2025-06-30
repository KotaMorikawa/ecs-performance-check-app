import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import IsrPage, { metadata } from '../page';

// Container をモック
vi.mock('../_containers/container', () => ({
  IsrContainer: () => <div data-testid="isr-container">ISR Container</div>,
}));

describe('IsrPage', () => {
  it('should render IsrContainer', async () => {
    const { getByTestId } = render(await IsrPage());
    expect(getByTestId('isr-container')).toBeInTheDocument();
  });

  it('should have correct metadata', () => {
    expect(metadata.title).toBe('ISR Data Fetching Demo');
    expect(metadata.description).toBe('Incremental Static Regeneration demonstration with time-based revalidation');
  });
});