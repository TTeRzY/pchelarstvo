/**
 * Sanity tests for Login flow
 * Tests login modal rendering, form interactions, and authentication
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthModal from '@/components/auth/AuthModal';
import { useModal } from '@/components/modal/ModalProvider';
import { useAuth } from '@/context/AuthProvider';
import { mockUser } from '@/__tests__/utils/mockData';
import { mockAuthLogin } from '@/__tests__/utils/mockHandlers';

// Mock the hooks
jest.mock('@/context/AuthProvider');
jest.mock('@/components/modal/ModalProvider');

const mockLogin = jest.fn();
const mockClose = jest.fn();
const mockOpen = jest.fn();

describe('Login Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    });
    (useModal as jest.Mock).mockReturnValue({
      type: 'login',
      close: mockClose,
      open: mockOpen,
      payload: null,
    });
    mockAuthLogin();
  });

  it('should render login modal when type is login', () => {
    render(<AuthModal />);
    
    expect(screen.getByRole('heading', { name: 'Вход' })).toBeInTheDocument();
    expect(screen.getByText(/Влезте в профила си/i)).toBeInTheDocument();
  });

  it('should render login form fields', () => {
    render(<AuthModal />);
    
    expect(screen.getByLabelText('Имейл')).toBeInTheDocument();
    expect(screen.getByLabelText('Парола')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /вход/i })).toBeInTheDocument();
  });

  it('should successfully login with valid credentials', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);

    render(<AuthModal />);
    
    await user.type(screen.getByLabelText('Имейл'), 'test@example.com');
    await user.type(screen.getByLabelText('Парола'), 'password123');
    await user.click(screen.getByRole('button', { name: /вход/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should show error when email is missing', async () => {
    const user = userEvent.setup();

    render(<AuthModal />);
    
    await user.type(screen.getByLabelText('Парола'), 'password123');
    await user.click(screen.getByRole('button', { name: /вход/i }));

    await waitFor(() => {
      expect(screen.getByText(/Моля, попълнете имейл и парола/i)).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should show error when password is missing', async () => {
    const user = userEvent.setup();

    render(<AuthModal />);
    
    await user.type(screen.getByLabelText('Имейл'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /вход/i }));

    await waitFor(() => {
      expect(screen.getByText(/Моля, попълнете имейл и парола/i)).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should show error on failed login', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(<AuthModal />);
    
    await user.type(screen.getByLabelText('Имейл'), 'test@example.com');
    await user.type(screen.getByLabelText('Парола'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /вход/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
    expect(mockClose).not.toHaveBeenCalled();
  });

  it('should close modal after successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);

    render(<AuthModal />);
    
    await user.type(screen.getByLabelText('Имейл'), 'test@example.com');
    await user.type(screen.getByLabelText('Парола'), 'password123');
    await user.click(screen.getByRole('button', { name: /вход/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('should open forgot password modal when link is clicked', async () => {
    const user = userEvent.setup();

    render(<AuthModal />);
    
    const forgotPasswordLink = screen.getByText(/Забравена парола/i);
    await user.click(forgotPasswordLink);

    expect(mockOpen).toHaveBeenCalledWith('forgotPassword');
  });
});

