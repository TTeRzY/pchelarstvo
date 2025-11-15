/**
 * Sanity tests for Marketplace Listing Details page
 * Tests listing display, seller info, contact buttons, and error states
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ListingDetailsPage from '../page';
import { fetchListing } from '@/lib/listings';
import { mockListing } from '@/__tests__/utils/mockData';
import { mockFetchListing, mockFetchListingError } from '@/__tests__/utils/mockHandlers';

// Mock the API function
jest.mock('@/lib/listings');
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({
    push: jest.fn(),
  }),
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

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

describe('ListingDetailsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchListing as jest.Mock).mockResolvedValue(mockListing);
  });

  it('should render loading state initially', () => {
    (fetchListing as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<ListingDetailsPage />);
    
    expect(screen.getByText(/Зареждане/i)).toBeInTheDocument();
  });

  it('should render listing details after loading', async () => {
    render(<ListingDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(mockListing.title)).toBeInTheDocument();
    });
  });

  it('should display seller info section', async () => {
    render(<ListingDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Публикувано от:/i)).toBeInTheDocument();
    });
  });

  it('should display listing type', async () => {
    render(<ListingDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Тип:/i)).toBeInTheDocument();
    });
  });

  it('should display product information', async () => {
    render(<ListingDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Продукт:/i)).toBeInTheDocument();
      expect(screen.getByText(mockListing.product)).toBeInTheDocument();
    });
  });

  it('should display quantity and price', async () => {
    render(<ListingDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Количество:/i)).toBeInTheDocument();
      expect(screen.getByText(/Цена\/kg:/i)).toBeInTheDocument();
    });
  });

  it('should display description if available', async () => {
    render(<ListingDetailsPage />);
    
    await waitFor(() => {
      if (mockListing.description) {
        expect(screen.getByText(/Описание/i)).toBeInTheDocument();
        expect(screen.getByText(mockListing.description)).toBeInTheDocument();
      }
    });
  });

  it('should render contact button', async () => {
    render(<ListingDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Свържи се/i })).toBeInTheDocument();
    });
  });

  it('should render copy link button', async () => {
    render(<ListingDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Копирай връзката/i })).toBeInTheDocument();
    });
  });

  it('should copy link to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost:3000/marketplace/1' },
      writable: true,
    });

    render(<ListingDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Копирай връзката/i })).toBeInTheDocument();
    });

    const copyButton = screen.getByRole('button', { name: /Копирай връзката/i });
    await user.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3000/marketplace/1');
  });

  it('should display error state when listing not found', async () => {
    (fetchListing as jest.Mock).mockResolvedValueOnce(null);

    render(<ListingDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Обявата не е намерена/i)).toBeInTheDocument();
    });
  });

  it('should display error message on API failure', async () => {
    (fetchListing as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<ListingDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Обявата не е намерена/i)).toBeInTheDocument();
    });
  });

  it('should display back to listings link', async () => {
    (fetchListing as jest.Mock).mockResolvedValueOnce(null);

    render(<ListingDetailsPage />);
    
    await waitFor(() => {
      const backLink = screen.getByText(/Виж всички обяви/i);
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest('a')).toHaveAttribute('href', '/marketplace');
    });
  });

  it('should display total value when quantity and price are available', async () => {
    render(<ListingDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Обща стойност:/i)).toBeInTheDocument();
    });
  });
});

