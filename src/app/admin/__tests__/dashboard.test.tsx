/**
 * Sanity tests for Admin Dashboard
 * Tests stats cards, quick actions, and authentication checks
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminDashboard from '../dashboard/page';
import { adminClient } from '@/lib/adminClient';
import { mockAdminStats } from '@/__tests__/utils/mockHandlers';

// Mock the admin client
jest.mock('@/lib/adminClient');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAdminStats();
  });

  it('should render loading state initially', () => {
    (adminClient.getStats as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<AdminDashboard />);
    
    expect(screen.getByText(/Зареждане/i)).toBeInTheDocument();
  });

  it('should render stats cards after loading', async () => {
    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Общо потребители/i)).toBeInTheDocument();
      expect(screen.getByText(/Чакащи обяви/i)).toBeInTheDocument();
      expect(screen.getByText(/Общо обяви/i)).toBeInTheDocument();
      expect(screen.getByText(/Сигнализирано съдържание/i)).toBeInTheDocument();
    });
  });

  it('should render quick actions section', async () => {
    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Бързи действия/i)).toBeInTheDocument();
    });
  });

  it('should render review pending link', async () => {
    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Преглед на чакащи/i)).toBeInTheDocument();
    });
  });

  it('should render check flagged link', async () => {
    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Проверка на сигнализирани/i)).toBeInTheDocument();
    });
  });

  it('should render manage users link', async () => {
    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Управление на потребители/i)).toBeInTheDocument();
    });
  });

  it('should render user statistics section', async () => {
    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Потребители по роля/i)).toBeInTheDocument();
      expect(screen.getByText(/Потребители по статус/i)).toBeInTheDocument();
    });
  });

  it('should render listing statistics section', async () => {
    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Обяви по статус/i)).toBeInTheDocument();
    });
  });

  it('should render recent activity section', async () => {
    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Последна активност/i)).toBeInTheDocument();
    });
  });

  it('should display error state on API failure', async () => {
    (adminClient.getStats as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Не може да се свърже с базата данни/i)).toBeInTheDocument();
    });
  });

  it('should have retry button on error', async () => {
    (adminClient.getStats as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Опитай отново/i })).toBeInTheDocument();
    });
  });

  it('should handle retry button click', async () => {
    const user = userEvent.setup();
    (adminClient.getStats as jest.Mock)
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValueOnce({
        users: {
          total: 100,
          todayRegistrations: 5,
          byRole: { user: 80, moderator: 10, admin: 10 },
          byStatus: { active: 95, suspended: 5 },
        },
        listings: {
          total: 250,
          todayListings: 10,
          byStatus: { active: 200, pending: 20 },
        },
        recentActivity: [],
      });

    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Опитай отново/i })).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /Опитай отново/i });
    await user.click(retryButton);

    await waitFor(() => {
      expect(adminClient.getStats).toHaveBeenCalledTimes(2);
    });
  });
});

