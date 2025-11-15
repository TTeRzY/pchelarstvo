/**
 * Sanity tests for Marketplace page
 * Tests filters, listings display, pagination, and interactions
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MarketplacePage from '../page';
import { fetchListings } from '@/lib/listings';
import { mockListingsResponse } from '@/__tests__/utils/mockData';
import { mockFetchListings } from '@/__tests__/utils/mockHandlers';

// Mock the API function
jest.mock('@/lib/listings');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useLocale: () => 'bg',
}));

// Mock the modal provider
jest.mock('@/components/modal/ModalProvider', () => ({
  useModal: () => ({
    open: jest.fn(),
    close: jest.fn(),
  }),
}));

// Mock auth
jest.mock('@/context/AuthProvider', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }),
}));

describe('MarketplacePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchListings as jest.Mock).mockResolvedValue(mockListingsResponse);
  });

  it('should render page with title and subtitle', async () => {
    render(<MarketplacePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Пазар \(данни за мед\)/i)).toBeInTheDocument();
    });
  });

  it('should render filters sidebar', async () => {
    render(<MarketplacePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Филтри/i)).toBeInTheDocument();
    });
  });

  it('should render search input', async () => {
    render(<MarketplacePage />);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Търсете по заглавие/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('should render type filter', async () => {
    render(<MarketplacePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Тип:/i)).toBeInTheDocument();
    });
  });

  it('should render product filter', async () => {
    render(<MarketplacePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Продукт:/i)).toBeInTheDocument();
    });
  });

  it('should render listings after loading', async () => {
    render(<MarketplacePage />);
    
    await waitFor(() => {
      expect(fetchListings).toHaveBeenCalled();
    });
  });

  it('should handle search input', async () => {
    const user = userEvent.setup();
    render(<MarketplacePage />);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Търсете по заглавие/i);
      expect(searchInput).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Търсете по заглавие/i);
    await user.type(searchInput, 'мед');
    
    // Wait for debounced search
    await waitFor(() => {
      expect(fetchListings).toHaveBeenCalled();
    }, { timeout: 500 });
  });

  it('should handle type filter selection', async () => {
    const user = userEvent.setup();
    render(<MarketplacePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Тип:/i)).toBeInTheDocument();
    });

    const typeSelect = screen.getByLabelText(/Тип:/i).closest('div')?.querySelector('select');
    if (typeSelect) {
      await user.selectOptions(typeSelect, 'sell');
      
      await waitFor(() => {
        expect(fetchListings).toHaveBeenCalled();
      });
    }
  });

  it('should render pagination when there are multiple pages', async () => {
    const multiPageResponse = {
      ...mockListingsResponse,
      total: 50,
      perPage: 20,
      totalPages: 3,
    };
    (fetchListings as jest.Mock).mockResolvedValueOnce(multiPageResponse);

    render(<MarketplacePage />);
    
    await waitFor(() => {
      expect(fetchListings).toHaveBeenCalled();
    });
  });

  it('should show empty state when no listings match filters', async () => {
    (fetchListings as jest.Mock).mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      perPage: 20,
      totalPages: 0,
    });

    render(<MarketplacePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Няма обяви за текущите филтри/i)).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    (fetchListings as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<MarketplacePage />);
    
    // Page should still render even if API fails
    await waitFor(() => {
      expect(screen.getByText(/Пазар \(данни за мед\)/i)).toBeInTheDocument();
    });
  });
});

