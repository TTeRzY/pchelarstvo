/**
 * Sanity tests for Admin Users page
 * Tests user list, filters, and actions
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AdminUsersPage from '../users/page';
import { adminClient } from '@/lib/adminClient';
import { mockUser, mockAdminUser } from '@/__tests__/utils/mockData';

// Mock the admin client
jest.mock('@/lib/adminClient');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/admin/users',
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

describe('AdminUsersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (adminClient.getUsers as jest.Mock).mockResolvedValue({
      users: [mockUser, mockAdminUser],
      total: 2,
      page: 1,
      perPage: 20,
    });
  });

  it('should render page with title', async () => {
    render(<AdminUsersPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Управление на потребители/i)).toBeInTheDocument();
    });
  });

  it('should render filters section', async () => {
    render(<AdminUsersPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Филтри/i)).toBeInTheDocument();
    });
  });

  it('should render search input', async () => {
    render(<AdminUsersPage />);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Име или имейл/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('should render user list after loading', async () => {
    render(<AdminUsersPage />);
    
    await waitFor(() => {
      expect(adminClient.getUsers).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    });
  });

  it('should display loading state', () => {
    (adminClient.getUsers as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<AdminUsersPage />);
    
    expect(screen.getByText(/Зареждане на потребители/i)).toBeInTheDocument();
  });

  it('should display empty state when no users found', async () => {
    (adminClient.getUsers as jest.Mock).mockResolvedValueOnce({
      users: [],
      total: 0,
      page: 1,
      perPage: 20,
    });

    render(<AdminUsersPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Не са намерени потребители/i)).toBeInTheDocument();
    });
  });

  it('should handle search input', async () => {
    const user = userEvent.setup();
    render(<AdminUsersPage />);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Име или имейл/i);
      expect(searchInput).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Име или имейл/i);
    await user.type(searchInput, 'Test');
    
    // Wait for debounced search
    await waitFor(() => {
      expect(adminClient.getUsers).toHaveBeenCalled();
    }, { timeout: 500 });
  });

  it('should handle API errors gracefully', async () => {
    (adminClient.getUsers as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<AdminUsersPage />);
    
    // Page should still render even if API fails
    await waitFor(() => {
      expect(screen.getByText(/Управление на потребители/i)).toBeInTheDocument();
    });
  });
});

