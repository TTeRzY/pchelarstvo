/**
 * Unit tests for BaseReportModal component
 * Tests the reusable base modal functionality
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BaseReportModal, { type ReportConfig } from '../BaseReportModal';
import { useModal } from '@/components/modal/ModalProvider';

// Mock the modal provider
jest.mock('@/components/modal/ModalProvider');
jest.mock('@/components/modal/Modal', () => {
  return function MockModal({ children, title }: { children: React.ReactNode; title?: string }) {
    return (
      <div role="dialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        {children}
      </div>
    );
  };
});

// Mock fetch
global.fetch = jest.fn();

const mockClose = jest.fn();
const mockOpen = jest.fn();

describe('BaseReportModal', () => {
  const mockConfig: ReportConfig = {
    modalType: 'testModal',
    title: 'Test Modal',
    description: 'Test description',
    apiEndpoint: '/api/test',
    updateEvent: 'test:updated',
    submitButtonText: 'Submit',
    fields: [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        placeholder: 'Enter name',
      },
      {
        key: 'email',
        label: 'Email',
        type: 'email',
        required: true,
      },
      {
        key: 'notes',
        label: 'Notes',
        type: 'textarea',
        rows: 4,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useModal as jest.Mock).mockReturnValue({
      type: 'testModal',
      close: mockClose,
      open: mockOpen,
      payload: null,
    });
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render modal when type matches', () => {
    render(<BaseReportModal config={mockConfig} />);
    
    expect(screen.getByRole('heading', { name: 'Test Modal' })).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should not render when type does not match', () => {
    (useModal as jest.Mock).mockReturnValue({
      type: 'otherModal',
      close: mockClose,
      open: mockOpen,
      payload: null,
    });

    const { container } = render(<BaseReportModal config={mockConfig} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render all configured fields', () => {
    render(<BaseReportModal config={mockConfig} />);
    
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
  });

  it('should mark required fields', () => {
    render(<BaseReportModal config={mockConfig} />);
    
    const emailInput = screen.getByLabelText(/Email/i);
    expect(emailInput).toBeRequired();
    
    const nameInput = screen.getByLabelText(/Name/i);
    expect(nameInput).not.toBeRequired();
  });

  it('should show required indicator for required fields', () => {
    render(<BaseReportModal config={mockConfig} />);
    
    const emailLabel = screen.getByText(/Email/i);
    expect(emailLabel).toHaveTextContent('Email *');
  });

  it('should submit form with correct payload', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 'test-id' }),
    });

    render(<BaseReportModal config={mockConfig} />);
    
    await user.type(screen.getByLabelText(/Name/i), 'John Doe');
    await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/Notes/i), 'Test notes');
    
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(callBody).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
      notes: 'Test notes',
    });
  });

  it('should use custom payload transformer if provided', async () => {
    const user = userEvent.setup();
    const configWithTransformer: ReportConfig = {
      ...mockConfig,
      transformPayload: (form) => ({
        custom_name: form.name,
        custom_email: form.email,
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 'test-id' }),
    });

    render(<BaseReportModal config={configWithTransformer} />);
    
    await user.type(screen.getByLabelText(/Name/i), 'John');
    await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(callBody).toEqual({
      custom_name: 'John',
      custom_email: 'john@example.com',
    });
  });

  it('should validate required fields before submission', async () => {
    const user = userEvent.setup();
    render(<BaseReportModal config={mockConfig} />);
    
    // Don't fill required email field
    await user.type(screen.getByLabelText(/Name/i), 'John');
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/Моля, попълнете полето/i)).toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should use custom validation if provided', async () => {
    const user = userEvent.setup();
    const configWithValidation: ReportConfig = {
      ...mockConfig,
      validate: (form) => {
        if (form.name && form.name.length < 3) {
          return 'Name must be at least 3 characters';
        }
        return null;
      },
    };

    render(<BaseReportModal config={configWithValidation} />);
    
    await user.type(screen.getByLabelText(/Name/i), 'Jo'); // Too short
    await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/Name must be at least 3 characters/i)).toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should handle grouped fields (date/time)', () => {
    const configWithGrouping: ReportConfig = {
      ...mockConfig,
      fields: [
        {
          key: 'date',
          label: 'Date',
          type: 'date',
          groupWithNext: true,
        },
        {
          key: 'time',
          label: 'Time',
          type: 'time',
        },
      ],
    };

    render(<BaseReportModal config={configWithGrouping} />);
    
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Time/i)).toBeInTheDocument();
  });

  it('should dispatch update event on successful submission', async () => {
    const user = userEvent.setup();
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 'test-id' }),
    });

    render(<BaseReportModal config={mockConfig} />);
    
    await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'test:updated',
      }));
    });

    dispatchSpy.mockRestore();
  });
});

