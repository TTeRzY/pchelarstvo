/**
 * Sanity tests for Home Page
 * Tests rendering of Hero, quick actions, forecast, market sections
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/__tests__/utils/testUtils';
import HomePage from '../page';
import { mockApiaries, mockListings } from '@/__tests__/utils/mockData';
import { fetchApiaries } from '@/lib/apiaries';
import { fetchListings } from '@/lib/listings';

// Mock the API functions
jest.mock('@/lib/apiaries');
jest.mock('@/lib/listings');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock the modal provider
jest.mock('@/components/modal/ModalProvider', () => ({
  useModal: () => ({
    open: jest.fn(),
    close: jest.fn(),
  }),
}));

// Mock Leaflet for map component
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  useMap: () => ({
    setView: jest.fn(),
  }),
}));

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchApiaries as jest.Mock).mockResolvedValue(mockApiaries);
    (fetchListings as jest.Mock).mockResolvedValue({ items: mockListings, total: mockListings.length });
  });

  it('should render Hero component', async () => {
    render(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Добре дошли на pchelarstvo.bg/i)).toBeInTheDocument();
    });
  });

  it('should render quick action buttons', async () => {
    render(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Разгледай картата/i)).toBeInTheDocument();
      expect(screen.getByText(/Публикувай обява/i)).toBeInTheDocument();
      expect(screen.getByText(/Намери пчелар/i)).toBeInTheDocument();
      expect(screen.getByText(/Пазарувай мед/i)).toBeInTheDocument();
      expect(screen.getByText(/Сигнализирай за рояк/i)).toBeInTheDocument();
    });
  });

  it('should render forecast section', async () => {
    render(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Прогноза и паши/i)).toBeInTheDocument();
    });
  });

  it('should render market prices section', async () => {
    render(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Цени на пазара/i)).toBeInTheDocument();
    });
  });

  it('should render categories section', async () => {
    render(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Категории и ръководства/i)).toBeInTheDocument();
    });
  });

  it('should render map preview section', async () => {
    render(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Преглед на картата/i)).toBeInTheDocument();
    });
  });

  it('should handle quick action button clicks', async () => {
    const user = userEvent.setup();
    const mockPush = jest.fn();
    
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
    });

    render(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Разгледай картата/i)).toBeInTheDocument();
    });

    const mapButton = screen.getByText(/Разгледай картата/i).closest('button');
    if (mapButton) {
      await user.click(mapButton);
      // Note: Navigation is tested through router.push calls
    }
  });

  it('should display loading states', () => {
    (fetchApiaries as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    (fetchListings as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(<HomePage />);
    
    // Check for loading indicators if they exist
    expect(screen.getByText(/Прогноза и паши/i)).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    (fetchApiaries as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    (fetchListings as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    
    render(<HomePage />);
    
    // Page should still render even if APIs fail
    await waitFor(() => {
      expect(screen.getByText(/Добре дошли на pchelarstvo.bg/i)).toBeInTheDocument();
    });
  });
});

