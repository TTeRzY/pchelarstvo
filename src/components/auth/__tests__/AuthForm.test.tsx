/**
 * Component tests for AuthForm
 * Tests login and register form functionality
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthForm from '../AuthForm'
import { useAuth } from '@/context/AuthProvider'
import { useModal } from '@/components/modal/ModalProvider'

// Mock the hooks
jest.mock('@/context/AuthProvider')
jest.mock('@/components/modal/ModalProvider')

const mockLogin = jest.fn()
const mockRegister = jest.fn()
const mockClose = jest.fn()
const mockOpen = jest.fn()

describe('AuthForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      register: mockRegister,
    })
    ;(useModal as jest.Mock).mockReturnValue({
      close: mockClose,
      open: mockOpen,
    })
  })

  describe('Login Mode', () => {
    it('should render login form correctly', () => {
      render(<AuthForm mode="login" />)

      expect(screen.getByText('Влезте в профила си.')).toBeInTheDocument()
      expect(screen.getByLabelText('Имейл')).toBeInTheDocument()
      expect(screen.getByLabelText('Парола')).toBeInTheDocument()
      expect(screen.getByText('Забравена парола?')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /вход/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /затвори/i })).toBeInTheDocument()
    })

    it('should not render name field in login mode', () => {
      render(<AuthForm mode="login" />)

      expect(screen.queryByLabelText('Име')).not.toBeInTheDocument()
    })

    it('should successfully login with valid credentials', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValueOnce(undefined)

      render(<AuthForm mode="login" />)

      await user.type(screen.getByLabelText('Имейл'), 'test@example.com')
      await user.type(screen.getByLabelText('Парола'), 'password123')
      await user.click(screen.getByRole('button', { name: /вход/i }))

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
        expect(mockClose).toHaveBeenCalled()
      })
    })

    it('should show error when email is missing', async () => {
      const user = userEvent.setup()

      render(<AuthForm mode="login" />)

      await user.type(screen.getByLabelText('Парола'), 'password123')
      await user.click(screen.getByRole('button', { name: /вход/i }))

      await waitFor(() => {
        expect(screen.getByText('Моля, попълнете имейл и парола.')).toBeInTheDocument()
      })
      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('should show error when password is missing', async () => {
      const user = userEvent.setup()

      render(<AuthForm mode="login" />)

      await user.type(screen.getByLabelText('Имейл'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /вход/i }))

      await waitFor(() => {
        expect(screen.getByText('Моля, попълнете имейл и парола.')).toBeInTheDocument()
      })
      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('should show error on failed login', async () => {
      const user = userEvent.setup()
      mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'))

      render(<AuthForm mode="login" />)

      await user.type(screen.getByLabelText('Имейл'), 'test@example.com')
      await user.type(screen.getByLabelText('Парола'), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /вход/i }))

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
      expect(mockClose).not.toHaveBeenCalled()
    })

    it('should disable submit button while submitting', async () => {
      const user = userEvent.setup()
      mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

      render(<AuthForm mode="login" />)

      await user.type(screen.getByLabelText('Имейл'), 'test@example.com')
      await user.type(screen.getByLabelText('Парола'), 'password123')

      const submitButton = screen.getByRole('button', { name: /вход/i })
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
      expect(screen.getByText('Моля, изчакайте...')).toBeInTheDocument()
    })

    it('should open forgot password modal when clicking forgot password link', async () => {
      const user = userEvent.setup()

      render(<AuthForm mode="login" />)

      await user.click(screen.getByText('Забравена парола?'))

      expect(mockOpen).toHaveBeenCalledWith('forgotPassword')
    })

    it('should close modal when clicking close button', async () => {
      const user = userEvent.setup()

      render(<AuthForm mode="login" />)

      await user.click(screen.getByRole('button', { name: /затвори/i }))

      expect(mockClose).toHaveBeenCalled()
    })
  })

  describe('Register Mode', () => {
    it('should render register form correctly', () => {
      render(<AuthForm mode="register" />)

      expect(screen.getByText('Създайте нов акаунт.')).toBeInTheDocument()
      expect(screen.getByLabelText('Име')).toBeInTheDocument()
      expect(screen.getByLabelText('Имейл')).toBeInTheDocument()
      expect(screen.getByLabelText('Парола')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /регистрация/i })).toBeInTheDocument()
      expect(screen.queryByText('Забравена парола?')).not.toBeInTheDocument()
    })

    it('should successfully register with valid data', async () => {
      const user = userEvent.setup()
      mockRegister.mockResolvedValueOnce(undefined)

      render(<AuthForm mode="register" />)

      await user.type(screen.getByLabelText('Име'), 'Test User')
      await user.type(screen.getByLabelText('Имейл'), 'newuser@example.com')
      await user.type(screen.getByLabelText('Парола'), 'password123')
      await user.click(screen.getByRole('button', { name: /регистрация/i }))

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith('Test User', 'newuser@example.com', 'password123')
        expect(mockClose).toHaveBeenCalled()
      })
    })

    it('should show error when name is missing', async () => {
      const user = userEvent.setup()

      render(<AuthForm mode="register" />)

      await user.type(screen.getByLabelText('Имейл'), 'test@example.com')
      await user.type(screen.getByLabelText('Парола'), 'password123')
      await user.click(screen.getByRole('button', { name: /регистрация/i }))

      await waitFor(() => {
        expect(screen.getByText('Моля, попълнете име, имейл и парола.')).toBeInTheDocument()
      })
      expect(mockRegister).not.toHaveBeenCalled()
    })

    it('should show error when email is missing', async () => {
      const user = userEvent.setup()

      render(<AuthForm mode="register" />)

      await user.type(screen.getByLabelText('Име'), 'Test User')
      await user.type(screen.getByLabelText('Парола'), 'password123')
      await user.click(screen.getByRole('button', { name: /регистрация/i }))

      await waitFor(() => {
        expect(screen.getByText('Моля, попълнете име, имейл и парола.')).toBeInTheDocument()
      })
      expect(mockRegister).not.toHaveBeenCalled()
    })

    it('should show error when password is missing', async () => {
      const user = userEvent.setup()

      render(<AuthForm mode="register" />)

      await user.type(screen.getByLabelText('Име'), 'Test User')
      await user.type(screen.getByLabelText('Имейл'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /регистрация/i }))

      await waitFor(() => {
        expect(screen.getByText('Моля, попълнете име, имейл и парола.')).toBeInTheDocument()
      })
      expect(mockRegister).not.toHaveBeenCalled()
    })

    it('should show error on failed registration', async () => {
      const user = userEvent.setup()
      mockRegister.mockRejectedValueOnce(new Error('Email already exists'))

      render(<AuthForm mode="register" />)

      await user.type(screen.getByLabelText('Име'), 'Test User')
      await user.type(screen.getByLabelText('Имейл'), 'existing@example.com')
      await user.type(screen.getByLabelText('Парола'), 'password123')
      await user.click(screen.getByRole('button', { name: /регистрация/i }))

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument()
      })
      expect(mockClose).not.toHaveBeenCalled()
    })

    it('should show generic error message when error has no message', async () => {
      const user = userEvent.setup()
      mockRegister.mockRejectedValueOnce({})

      render(<AuthForm mode="register" />)

      await user.type(screen.getByLabelText('Име'), 'Test User')
      await user.type(screen.getByLabelText('Имейл'), 'test@example.com')
      await user.type(screen.getByLabelText('Парола'), 'password123')
      await user.click(screen.getByRole('button', { name: /регистрация/i }))

      await waitFor(() => {
        expect(screen.getByText('Възникна проблем. Опитайте отново.')).toBeInTheDocument()
      })
    })

    it('should disable submit button while submitting registration', async () => {
      const user = userEvent.setup()
      mockRegister.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

      render(<AuthForm mode="register" />)

      await user.type(screen.getByLabelText('Име'), 'Test User')
      await user.type(screen.getByLabelText('Имейл'), 'test@example.com')
      await user.type(screen.getByLabelText('Парола'), 'password123')

      const submitButton = screen.getByRole('button', { name: /регистрация/i })
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
      expect(screen.getByText('Моля, изчакайте...')).toBeInTheDocument()
    })
  })
})

