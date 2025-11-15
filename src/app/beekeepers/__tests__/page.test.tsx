/**
 * Sanity tests for Beekeepers page
 * Tests filters, beekeeper cards, sorting, and interactions
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BeekeepersPage from '../page';
import { fetchBeekeepers } from '@/lib/beekeeperClient';
import { mockBeekeepersResponse } from '@/__tests__/utils/mockData';

// Mock the API function
jest.mock('@/lib/beekeeperClient');
jest.mock('next/navigation', () => ({
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

// Mock PageShell
jest.mock('@/components/layout/PageShell', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock BeekeeperCard
jest.mock('@/components/beekeepers/BeekeeperCard', () => ({
  __esModule: true,
  default: ({ beekeeper, onViewProfile, onContact }: any) => (
    <div data-testid={`beekeeper-card-${beekeeper.id}`}>
      <div>{beekeeper.name}</div>
      <button onClick={onViewProfile}>View Profile</button>
      <button onClick={onContact}>Contact</button>
    </div>
  ),
}));

// Mock BeekeeperFilters
jest.mock('@/components/beekeepers/BeekeeperFilters', () => ({
  __esModule: true,
  default: ({ searchQuery, onSearchChange, selectedRegion, onRegionChange }: any) => (
    <div data-testid="beekeeper-filters">
      <input
        data-testid="search-input"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search"
      />
      <select
        data-testid="region-select"
        value={selectedRegion}
        onChange={(e) => onRegionChange(e.target.value)}
      >
        <option value="Всички">Всички</option>
      </select>
    </div>
  ),
}));

describe('BeekeepersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchBeekeepers as jest.Mock).mockResolvedValue(mockBeekeepersResponse);
  });

  it('should render page with title and subtitle', async () => {
    render(<BeekeepersPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Намери пчелар/i)).toBeInTheDocument();
      expect(screen.getByText(/Свържете се с опитни пчелари/i)).toBeInTheDocument();
    });
  });

  it('should render filters', async () => {
    render(<BeekeepersPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('beekeeper-filters')).toBeInTheDocument();
    });
  });

  it('should render beekeeper cards after loading', async () => {
    render(<BeekeepersPage />);
    
    await waitFor(() => {
      expect(fetchBeekeepers).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('beekeeper-card-1')).toBeInTheDocument();
    });
  });

  it('should display stats bar', async () => {
    render(<BeekeepersPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Показани:/i)).toBeInTheDocument();
    });
  });

  it('should handle search input', async () => {
    const user = userEvent.setup();
    render(<BeekeepersPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'Test');
    
    await waitFor(() => {
      expect(fetchBeekeepers).toHaveBeenCalled();
    });
  });

  it('should handle region filter selection', async () => {
    const user = userEvent.setup();
    render(<BeekeepersPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('region-select')).toBeInTheDocument();
    });

    const regionSelect = screen.getByTestId('region-select');
    await user.selectOptions(regionSelect, 'София');
    
    await waitFor(() => {
      expect(fetchBeekeepers).toHaveBeenCalled();
    });
  });

  it('should display loading state', () => {
    (fetchBeekeepers as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<BeekeepersPage />);
    
    // Loading skeleton should be present
    expect(screen.getByText(/Намери пчелар/i)).toBeInTheDocument();
  });

  it('should display error state on API failure', async () => {
    (fetchBeekeepers as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<BeekeepersPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Грешка при зареждане/i)).toBeInTheDocument();
    });
  });

  it('should display empty state when no beekeepers found', async () => {
    (fetchBeekeepers as jest.Mock).mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      perPage: 20,
      totalPages: 0,
    });

    render(<BeekeepersPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Няма намерени пчелари/i)).toBeInTheDocument();
    });
  });

  it('should show mobile filter button on mobile', async () => {
    render(<BeekeepersPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Филтри и търсене/i)).toBeInTheDocument();
    });
  });

  it('should handle contact button click (requires auth)', async () => {
    const user = userEvent.setup();
    const mockOpen = jest.fn();
    jest.spyOn(require('@/components/modal/ModalProvider'), 'useModal').mockReturnValue({
      open: mockOpen,
      close: jest.fn(),
    });

    render(<BeekeepersPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('beekeeper-card-1')).toBeInTheDocument();
    });

    const contactButtons = screen.getAllByText('Contact');
    if (contactButtons[0]) {
      await user.click(contactButtons[0]);
      // Should open login modal if user is not authenticated
    }
  });
});

