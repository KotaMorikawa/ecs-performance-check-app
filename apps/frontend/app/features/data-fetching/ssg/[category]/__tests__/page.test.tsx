import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SsgPage, { metadata, generateStaticParams } from '../page';

// Container をモック
vi.mock('../_containers/container', () => ({
  SsgContainer: ({ category }: { category: string }) => (
    <div data-testid="ssg-container">SSG Container: {category}</div>
  ),
}));

// Global fetch のモック
const mockFetch = vi.fn();

const mockCategories = [
  { slug: 'technology' },
  { slug: 'science' },
  { slug: 'design' },
];

describe('SsgPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  it('should render SsgContainer with correct category', async () => {
    const mockParams = Promise.resolve({ category: 'technology' });
    
    const { getByTestId } = render(await SsgPage({ params: mockParams }));
    
    expect(getByTestId('ssg-container')).toBeInTheDocument();
    expect(getByTestId('ssg-container')).toHaveTextContent('SSG Container: technology');
  });

  it('should handle different category slugs', async () => {
    const mockParams = Promise.resolve({ category: 'science' });
    
    const { getByTestId } = render(await SsgPage({ params: mockParams }));
    
    expect(getByTestId('ssg-container')).toHaveTextContent('SSG Container: science');
  });

  it('should have correct metadata', () => {
    expect(metadata.title).toBe('SSG Category Page');
    expect(metadata.description).toBe('Static Site Generation demonstration with generateStaticParams');
  });
});

describe('generateStaticParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  it('should return static params from API response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockCategories }),
    } as Response);

    const result = await generateStaticParams();

    expect(result).toEqual([
      { category: 'technology' },
      { category: 'science' },
      { category: 'design' },
    ]);

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('should handle API fetch error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await generateStaticParams();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Error in generateStaticParams:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should handle API response error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    } as Response);

    const result = await generateStaticParams();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to fetch categories for generateStaticParams:',
      'Internal Server Error'
    );

    consoleSpy.mockRestore();
  });

  it('should handle empty categories response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    const result = await generateStaticParams();

    expect(result).toEqual([]);
  });

  it('should handle missing data in response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    const result = await generateStaticParams();

    expect(result).toEqual([]);
  });
});