import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientSidePage, { metadata } from '../page';

// Container をモック
vi.mock('../_containers/container', () => ({
  ClientSideContainer: () => <div data-testid="client-side-container">Client Side Container</div>,
}));

describe('ClientSidePage', () => {
  it('should render ClientSideContainer', () => {
    const { getByTestId } = render(<ClientSidePage />);
    expect(getByTestId('client-side-container')).toBeInTheDocument();
  });

  it('should have correct metadata', () => {
    expect(metadata.title).toBe('Client-Side Data Fetching Demo');
    expect(metadata.description).toBe('Client-side data fetching with useEffect and SWR patterns');
  });
});