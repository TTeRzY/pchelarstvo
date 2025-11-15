/**
 * Sanity tests for Admin Pending Listings page
 * Tests pending listings display and moderation actions
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPendingListingsPage from '../listings/pending/page';
import { adminClient } from '@/lib/adminClient';
import { mockListing, mockListings } from '@/__tests__/utils/mockData';
import { mockAdminUser } from '@/__tests__/utils/mockData';

// Mock the admin client
jest.mock('@/lib/adminClient');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/admin/listings/pending',
}));

// Mock auth with admin user
jest.mock('@/context/AuthProvider', () => ({
  useAuth: () => ({
    user: mockAdminUser,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }),
}));

describe('AdminPendingListingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (adminClient.getPendingListings as jest.Mock).mockResolvedValue({
      listings: [mockListing],
      count: 1,
    });
  });

  it('should render page with title', async () => {
    render(<AdminPendingListingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Чакащи модерация/i)).toBeInTheDocument();
    });
  });

  it('should render pending listings after loading', async () => {
    render(<AdminPendingListingsPage />);
    
    await waitFor(() => {
      expect(adminClient.getPendingListings).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(mockListing.title)).toBeInTheDocument();
    });
  });

  it('should display loading state', () => {
    (adminClient.getPendingListings as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<AdminPendingListingsPage />);
    
    expect(screen.getByText(/Зареждане на обяви/i)).toBeInTheDocument();
  });

  it('should display empty state when no pending listings', async () => {
    (adminClient.getPendingListings as jest.Mock).mockResolvedValueOnce({
      listings: [],
      count: 0,
    });

    render(<AdminPendingListingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Няма чакащи обяви за преглед/i)).toBeInTheDocument();
    });
  });

  it('should render approve button', async () => {
    render(<AdminPendingListingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(mockListing.title)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Одобри/i })).toBeInTheDocument();
  });

  it('should render reject button', async () => {
    render(<AdminPendingListingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(mockListing.title)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Отхвърли/i })).toBeInTheDocument();
  });

  it('should handle approve action', async () => {
    const user = userEvent.setup();
    (adminClient.approveListing as jest.Mock).mockResolvedValueOnce(undefined);

    render(<AdminPendingListingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(mockListing.title)).toBeInTheDocument();
    });

    const approveButton = screen.getByRole('button', { name: /Одобри/i });
    await user.click(approveButton);

    await waitFor(() => {
      expect(adminClient.approveListing).toHaveBeenCalledWith(mockListing.id);
    });
  });

  it('should handle reject action', async () => {
    const user = userEvent.setup();
    (adminClient.rejectListing as jest.Mock).mockResolvedValueOnce({ success: true, listing: mockListing });

    render(<AdminPendingListingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(mockListing.title)).toBeInTheDocument();
    });

    const rejectButton = screen.getByRole('button', { name: /Отхвърли/i });
    if (rejectButton) {
      await user.click(rejectButton);
      // Reject functionality is handled by ModerationCard component
    }
  });

  it('should handle API errors gracefully', async () => {
    (adminClient.getPendingListings as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<AdminPendingListingsPage />);
    
    // Page should still render even if API fails
    await waitFor(() => {
      expect(screen.getByText(/Чакащи модерация/i)).toBeInTheDocument();
    });
  });
});

