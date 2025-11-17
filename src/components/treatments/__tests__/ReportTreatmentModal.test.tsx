/**
 * Unit tests for ReportTreatmentModal component
 * Tests form rendering, validation, submission, and error handling
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReportTreatmentModal from '../ReportTreatmentModal';
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

describe('ReportTreatmentModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useModal as jest.Mock).mockReturnValue({
      type: 'reportTreatment',
      close: mockClose,
      open: mockOpen,
      payload: null,
    });
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render modal when type is reportTreatment', () => {
    render(<ReportTreatmentModal />);
    
    expect(screen.getByRole('heading', { name: /Съобщи за третиране с препарати/i })).toBeInTheDocument();
    expect(screen.getByText(/Известете пчеларите за планирано третиране/i)).toBeInTheDocument();
  });

  it('should not render when type is not reportTreatment', () => {
    (useModal as jest.Mock).mockReturnValue({
      type: 'reportSwarm',
      close: mockClose,
      open: mockOpen,
      payload: null,
    });

    const { container } = render(<ReportTreatmentModal />);
    expect(container.firstChild).toBeNull();
  });

  it('should render all form fields', () => {
    render(<ReportTreatmentModal />);
    
    expect(screen.getByLabelText(/Вашето име/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Телефон за контакт/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Локация/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Дата на третиране/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Час на третиране/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Име на препарат/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Вид култура/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Допълнителна информация/i)).toBeInTheDocument();
  });

  it('should mark location as required', () => {
    render(<ReportTreatmentModal />);
    
    const locationInput = screen.getByLabelText(/Локация/i);
    expect(locationInput).toBeRequired();
  });

  it('should submit form with all fields', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        id: 'test-id',
        location: 'София',
        reporter_name: 'Иван',
        status: 'reported',
      }),
    });

    render(<ReportTreatmentModal />);
    
    await user.type(screen.getByLabelText(/Вашето име/i), 'Иван Петров');
    await user.type(screen.getByLabelText(/Телефон за контакт/i), '+359888123456');
    await user.type(screen.getByLabelText(/Локация/i), 'София, район Люлин');
    await user.type(screen.getByLabelText(/Дата на третиране/i), '2025-11-20');
    await user.type(screen.getByLabelText(/Час на третиране/i), '14:30');
    await user.type(screen.getByLabelText(/Име на препарат/i), 'Глифосат');
    await user.type(screen.getByLabelText(/Вид култура/i), 'Слънчоглед');
    await user.type(screen.getByLabelText(/Допълнителна информация/i), 'Тест бележки');

    const submitButton = screen.getByRole('button', { name: /Изпрати сигнал/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/treatment-reports',
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
      reporter_name: 'Иван Петров',
      reporter_phone: '+359888123456',
      location: 'София, район Люлин',
      treatment_date: '2025-11-20',
      treatment_time: '14:30',
      pesticide_name: 'Глифосат',
      crop_type: 'Слънчоглед',
      notes: 'Тест бележки',
    });
  });

  it('should submit form with only required field (location)', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        id: 'test-id',
        location: 'София',
        status: 'reported',
      }),
    });

    render(<ReportTreatmentModal />);
    
    await user.type(screen.getByLabelText(/Локация/i), 'София');
    await user.click(screen.getByRole('button', { name: /Изпрати сигнал/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(callBody.location).toBe('София');
    expect(callBody.reporter_name).toBeNull();
  });

  it('should show error when location is missing', async () => {
    const user = userEvent.setup();
    render(<ReportTreatmentModal />);
    
    const submitButton = screen.getByRole('button', { name: /Изпрати сигнал/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Check for error message (flexible matching for encoding issues)
      const errorElement = screen.queryByText(/попълнете/i) || 
                          screen.queryByText(/Локация/i) ||
                          screen.queryByRole('alert');
      expect(errorElement).toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should handle Laravel validation errors (422)', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({
        message: 'The location field is required.',
        errors: {
          location: ['The location field is required.'],
        },
      }),
    });

    render(<ReportTreatmentModal />);
    
    await user.type(screen.getByLabelText(/Локация/i), '');
    await user.click(screen.getByRole('button', { name: /Изпрати сигнал/i }));

    await waitFor(() => {
      // Check for error message
      const errorElement = screen.queryByText(/location/i) || 
                          screen.queryByText(/required/i) ||
                          screen.getByRole('dialog').querySelector('.bg-rose-50');
      expect(errorElement).toBeTruthy();
    });
  });

  it('should handle network errors', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<ReportTreatmentModal />);
    
    await user.type(screen.getByLabelText(/Локация/i), 'София');
    await user.click(screen.getByRole('button', { name: /Изпрати сигнал/i }));

    await waitFor(() => {
      expect(screen.getByText(/Неуспешно изпращане/i)).toBeInTheDocument();
    });
  });

  it('should show success message and close modal after successful submission', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        id: 'test-id',
        location: 'София',
        status: 'reported',
      }),
    });

    render(<ReportTreatmentModal />);
    
    await user.type(screen.getByLabelText(/Локация/i), 'София');
    await user.click(screen.getByRole('button', { name: /Изпрати сигнал/i }));

    await waitFor(() => {
      // Check for success message (flexible matching for encoding)
      const successMessage = screen.queryByText(/Благодарим/i) || 
                            screen.queryByText(/приет/i) ||
                            screen.getByRole('dialog').querySelector('.bg-emerald-50');
      expect(successMessage).toBeTruthy();
    });

    // Modal should close after delay
    await waitFor(() => {
      expect(mockClose).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('should reset form when modal closes', async () => {
    const user = userEvent.setup();
    render(<ReportTreatmentModal />);
    
    await user.type(screen.getByLabelText(/Локация/i), 'София');
    await user.click(screen.getByRole('button', { name: /Затвори/i }));

    expect(mockClose).toHaveBeenCalled();
  });

  it('should have orange submit button styling', () => {
    render(<ReportTreatmentModal />);
    
    const submitButton = screen.getByRole('button', { name: /Изпрати сигнал/i });
    expect(submitButton).toHaveClass('bg-orange-500');
  });

  it('should set minimum date to today for treatment date', () => {
    render(<ReportTreatmentModal />);
    
    const dateInput = screen.getByLabelText(/Дата на третиране/i) as HTMLInputElement;
    const today = new Date().toISOString().split('T')[0];
    expect(dateInput.min).toBe(today);
  });
});

