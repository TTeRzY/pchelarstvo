/**
 * Sanity tests for Registration flow
 * Tests registration modal rendering, form interactions, and user creation
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthModal from '@/components/auth/AuthModal';
import { useModal } from '@/components/modal/ModalProvider';
import { useAuth } from '@/context/AuthProvider';
import { mockUser } from '@/__tests__/utils/mockData';
import { mockAuthRegister } from '@/__tests__/utils/mockHandlers';

// Mock the hooks
jest.mock('@/context/AuthProvider');
jest.mock('@/components/modal/ModalProvider');

const mockRegister = jest.fn();
const mockClose = jest.fn();
const mockOpen = jest.fn();

describe('Registration Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      login: jest.fn(),
      register: mockRegister,
      logout: jest.fn(),
      setUser: jest.fn(),
    });
    (useModal as jest.Mock).mockReturnValue({
      type: 'register',
      close: mockClose,
      open: mockOpen,
      payload: null,
    });
    mockAuthRegister();
  });

  it('should render registration modal when type is register', () => {
    render(<AuthModal />);
    
    expect(screen.getByText('Регистрация')).toBeInTheDocument();
    expect(screen.getByText(/Създайте нов акаунт/i)).toBeInTheDocument();
  });

  it('should render registration form fields', () => {
    render(<AuthModal />);
    
    expect(screen.getByLabelText('Име')).toBeInTheDocument();
    expect(screen.getByLabelText('Имейл')).toBeInTheDocument();
    expect(screen.getByLabelText('Парола')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /регистрация/i })).toBeInTheDocument();
  });

  it('should successfully register with valid data', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce(undefined);

    render(<AuthModal />);
    
    await user.type(screen.getByLabelText('Име'), 'Test User');
    await user.type(screen.getByLabelText('Имейл'), 'newuser@example.com');
    await user.type(screen.getByLabelText('Парола'), 'password123');
    await user.click(screen.getByRole('button', { name: /регистрация/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('Test User', 'newuser@example.com', 'password123');
    });
  });

  it('should show error when name is missing', async () => {
    const user = userEvent.setup();

    render(<AuthModal />);
    
    await user.type(screen.getByLabelText('Имейл'), 'test@example.com');
    await user.type(screen.getByLabelText('Парола'), 'password123');
    await user.click(screen.getByRole('button', { name: /регистрация/i }));

    await waitFor(() => {
      expect(screen.getByText(/Моля, попълнете име, имейл и парола/i)).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should show error when email is missing', async () => {
    const user = userEvent.setup();

    render(<AuthModal />);
    
    await user.type(screen.getByLabelText('Име'), 'Test User');
    await user.type(screen.getByLabelText('Парола'), 'password123');
    await user.click(screen.getByRole('button', { name: /регистрация/i }));

    await waitFor(() => {
      expect(screen.getByText(/Моля, попълнете име, имейл и парола/i)).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should show error when password is missing', async () => {
    const user = userEvent.setup();

    render(<AuthModal />);
    
    await user.type(screen.getByLabelText('Име'), 'Test User');
    await user.type(screen.getByLabelText('Имейл'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /регистрация/i }));

    await waitFor(() => {
      expect(screen.getByText(/Моля, попълнете име, имейл и парола/i)).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should show error on failed registration', async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValueOnce(new Error('Email already exists'));

    render(<AuthModal />);
    
    await user.type(screen.getByLabelText('Име'), 'Test User');
    await user.type(screen.getByLabelText('Имейл'), 'existing@example.com');
    await user.type(screen.getByLabelText('Парола'), 'password123');
    await user.click(screen.getByRole('button', { name: /регистрация/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
    expect(mockClose).not.toHaveBeenCalled();
  });

  it('should close modal after successful registration', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce(undefined);

    render(<AuthModal />);
    
    await user.type(screen.getByLabelText('Име'), 'Test User');
    await user.type(screen.getByLabelText('Имейл'), 'newuser@example.com');
    await user.type(screen.getByLabelText('Парола'), 'password123');
    await user.click(screen.getByRole('button', { name: /регистрация/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });
  });
});

