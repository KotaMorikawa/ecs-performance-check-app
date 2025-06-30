import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SsgIndexPage, { metadata } from '../page';

// Global fetch のモック
const mockFetch = vi.fn();

// モックデータ
const mockCategories = [
  {
    id: 1,
    name: 'Technology',
    slug: 'technology',
  },
  {
    id: 2,
    name: 'Science',
    slug: 'science',
  },
];

describe('SsgIndexPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  it('should render page with categories', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockCategories }),
    } as Response);

    render(await SsgIndexPage());

    expect(screen.getByText('SSG Data Fetching Demo')).toBeInTheDocument();
    expect(screen.getByText(/Static Site Generation/)).toBeInTheDocument();
    expect(screen.getByText('Available Categories:')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
    expect(screen.getByText('(technology)')).toBeInTheDocument();
    expect(screen.getByText('(science)')).toBeInTheDocument();
  });

  it('should handle fetch error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error('Fetch failed'));

    render(await SsgIndexPage());

    expect(screen.getByText('SSG Data Fetching Demo')).toBeInTheDocument();
    expect(screen.getByText('No categories available. Make sure the backend is running.')).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching categories:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should handle empty categories response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    render(await SsgIndexPage());

    expect(screen.getByText('No categories available. Make sure the backend is running.')).toBeInTheDocument();
  });

  it('should handle API response failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(await SsgIndexPage());

    expect(screen.getByText('No categories available. Make sure the backend is running.')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should call API with correct parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockCategories }),
    } as Response);

    await SsgIndexPage();

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('should have correct metadata', () => {
    expect(metadata.title).toBe('SSG Data Fetching Demo');
    expect(metadata.description).toBe('Static Site Generation demonstration with generateStaticParams');
  });

  it('should render category links with correct hrefs', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockCategories }),
    } as Response);

    render(await SsgIndexPage());

    const technologyLink = screen.getByRole('link', { name: /Technology/ });
    const scienceLink = screen.getByRole('link', { name: /Science/ });

    expect(technologyLink).toHaveAttribute('href', '/features/data-fetching/ssg/technology');
    expect(scienceLink).toHaveAttribute('href', '/features/data-fetching/ssg/science');
  });
});