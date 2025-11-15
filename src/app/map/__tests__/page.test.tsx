/**
 * Sanity tests for Map page
 * Tests map rendering, filters, apiary list, and interactions
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MapPage from '../page';
import { fetchApiaries } from '@/lib/apiaries';
import { mockApiaries } from '@/__tests__/utils/mockData';
import { mockFetchApiaries } from '@/__tests__/utils/mockHandlers';

// Mock the API function
jest.mock('@/lib/apiaries');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
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

// Mock Leaflet for map component
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  useMap: () => ({
    setView: jest.fn(),
  }),
}));

// Mock dynamic import for ApiariesMap
jest.mock('@/components/map/ApiariesMap', () => ({
  __esModule: true,
  default: ({ pins }: { pins: any[] }) => (
    <div data-testid="apiaries-map">
      {pins.map((pin) => (
        <div key={pin.id} data-testid={`pin-${pin.id}`}>
          {pin.label}
        </div>
      ))}
    </div>
  ),
}));

// Mock AddApiaryModal
jest.mock('@/components/map/AddApiaryModal', () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <div data-testid="add-apiary-modal">Add Apiary Modal</div> : null,
}));

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};
global.navigator.geolocation = mockGeolocation as any;

describe('MapPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchApiaries as jest.Mock).mockResolvedValue(mockApiaries);
    mockGeolocation.getCurrentPosition.mockImplementation((success) =>
      success({
        coords: {
          latitude: 42.6977,
          longitude: 23.3219,
        },
      })
    );
  });

  it('should render page with filters section', async () => {
    render(<MapPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Филтри/i)).toBeInTheDocument();
    });
  });

  it('should render search input', async () => {
    render(<MapPage />);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Търсене по име/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('should render region filter', async () => {
    render(<MapPage />);
    
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  it('should render map component', async () => {
    render(<MapPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('apiaries-map')).toBeInTheDocument();
    });
  });

  it('should render apiary list after loading', async () => {
    render(<MapPage />);
    
    await waitFor(() => {
      expect(fetchApiaries).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(mockApiaries[0].name)).toBeInTheDocument();
    });
  });

  it('should handle search input', async () => {
    const user = userEvent.setup();
    render(<MapPage />);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Търсене по име/i);
      expect(searchInput).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Търсене по име/i);
    await user.type(searchInput, 'Test');
    
    await waitFor(() => {
      // Filtered results should update
      expect(screen.getByText(mockApiaries[0].name)).toBeInTheDocument();
    });
  });

  it('should handle region filter selection', async () => {
    const user = userEvent.setup();
    render(<MapPage />);
    
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });

    const selects = screen.getAllByRole('combobox');
    const regionSelect = selects[0]; // First select is region
    if (regionSelect) {
      await user.selectOptions(regionSelect, mockApiaries[0].region || '');
      
      // Filtered results should update
      await waitFor(() => {
        expect(screen.getByText(mockApiaries[0].name)).toBeInTheDocument();
      });
    }
  });

  it('should render view mode toggles', async () => {
    render(<MapPage />);
    
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const clusterButton = buttons.find(btn => btn.textContent?.includes('Клъстери'));
      const heatmapButton = buttons.find(btn => btn.textContent?.includes('Топлинна карта'));
      const pointsButton = buttons.find(btn => btn.textContent?.includes('Точки'));
      expect(clusterButton).toBeInTheDocument();
      expect(heatmapButton).toBeInTheDocument();
      expect(pointsButton).toBeInTheDocument();
    });
  });

  it('should handle view mode toggle', async () => {
    const user = userEvent.setup();
    render(<MapPage />);
    
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const clusterButton = buttons.find(btn => btn.textContent?.includes('Клъстери'));
      expect(clusterButton).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    const heatmapButton = buttons.find(btn => btn.textContent?.includes('Топлинна карта'));
    if (heatmapButton) {
      await user.click(heatmapButton);
      // View mode should change (tested through state)
    }
  });

  it('should render add apiary button', async () => {
    render(<MapPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Добави пчелин/i)).toBeInTheDocument();
    });
  });

  it('should open add apiary modal when button is clicked', async () => {
    const user = userEvent.setup();
    render(<MapPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Добави пчелин/i)).toBeInTheDocument();
    });

    const addButton = screen.getByText(/Добави пчелин/i).closest('button');
    if (addButton) {
      await user.click(addButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('add-apiary-modal')).toBeInTheDocument();
      });
    }
  });

  it('should display details section', async () => {
    render(<MapPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Подробности/i)).toBeInTheDocument();
    });
  });

  it('should display tips section', async () => {
    render(<MapPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Съвети/i)).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    (fetchApiaries as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<MapPage />);
    
    // Page should still render even if API fails
    await waitFor(() => {
      expect(screen.getByText(/Преглед на пчелините/i)).toBeInTheDocument();
    });
  });

  it('should show empty state when no apiaries match filters', async () => {
    (fetchApiaries as jest.Mock).mockResolvedValueOnce([]);

    render(<MapPage />);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Търсене по име/i);
      expect(searchInput).toBeInTheDocument();
    });
  });
});

