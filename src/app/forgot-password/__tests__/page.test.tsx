/**
 * Sanity tests for Forgot Password page
 * Tests form submission, success states, and error handling
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/__tests__/utils/testUtils';
import ForgotPasswordPage from '../page';
import { authClient } from '@/lib/authClient';

// Mock authClient
jest.mock('@/lib/authClient', () => ({
  authClient: {
    me: jest.fn().mockResolvedValue(null),
    requestPasswordReset: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
  authStorage: {
    getToken: jest.fn().mockReturnValue(null),
    setToken: jest.fn(),
    removeToken: jest.fn(),
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render page with email input', () => {
    render(<ForgotPasswordPage />);
    
    expect(screen.getByText(/Забравена парола/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Имейл адрес/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Изпрати инструкции/i })).toBeInTheDocument();
  });

  it('should submit form with valid email', async () => {
    const user = userEvent.setup();
    (authClient.requestPasswordReset as jest.Mock).mockResolvedValueOnce(undefined);

    render(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText(/Имейл адрес/i);
    await user.type(emailInput, 'test@example.com');
    
    const submitButton = screen.getByRole('button', { name: /Изпрати инструкции/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(authClient.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('should display success message after submission', async () => {
    const user = userEvent.setup();
    (authClient.requestPasswordReset as jest.Mock).mockResolvedValueOnce(undefined);

    render(<ForgotPasswordPage />);
    
    await user.type(screen.getByLabelText(/Имейл адрес/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /Изпрати инструкции/i }));

    await waitFor(() => {
      expect(screen.getByText(/Ако този имейл съществува в системата/i)).toBeInTheDocument();
    });
  });

  it('should display error message on failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Email not found';
    (authClient.requestPasswordReset as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    render(<ForgotPasswordPage />);
    
    await user.type(screen.getByLabelText(/Имейл адрес/i), 'nonexistent@example.com');
    await user.click(screen.getByRole('button', { name: /Изпрати инструкции/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should disable submit button while loading', async () => {
    const user = userEvent.setup();
    (authClient.requestPasswordReset as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<ForgotPasswordPage />);
    
    await user.type(screen.getByLabelText(/Имейл адрес/i), 'test@example.com');
    const submitButton = screen.getByRole('button', { name: /Изпрати инструкции/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/Изпращане/i)).toBeInTheDocument();
  });

  it('should have link to login page', () => {
    render(<ForgotPasswordPage />);
    
    const loginLink = screen.getByText(/Обратно към вход/i);
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    (authClient.requestPasswordReset as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 50))
    );

    render(<ForgotPasswordPage />);
    
    await user.type(screen.getByLabelText(/Имейл адрес/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /Изпрати инструкции/i }));

    expect(screen.getByText(/Изпращане/i)).toBeInTheDocument();
  });
});

