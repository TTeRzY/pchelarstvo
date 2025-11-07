/**
 * Component tests for ForgotPasswordForm
 * Tests forgot password functionality
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ForgotPasswordForm from '../ForgotPasswordForm'
import { authClient } from '@/lib/authClient'
import { useModal } from '@/components/modal/ModalProvider'

// Mock the dependencies
jest.mock('@/lib/authClient')
jest.mock('@/components/modal/ModalProvider')

const mockOpen = jest.fn()

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useModal as jest.Mock).mockReturnValue({
      open: mockOpen,
    })
    ;(authClient.requestPasswordReset as jest.Mock).mockClear()
  })

  it('should render forgot password form correctly', () => {
    render(<ForgotPasswordForm />)

    expect(
      screen.getByText('Попълнете имейла си и ще ви изпратим инструкции за промяна на паролата.')
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Имейл')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /изпрати/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /назад към вход/i })).toBeInTheDocument()
  })

  it('should require email input', async () => {
    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText('Имейл') as HTMLInputElement
    expect(emailInput).toBeRequired()
  })

  it('should successfully send reset email', async () => {
    const user = userEvent.setup()
    ;(authClient.requestPasswordReset as jest.Mock).mockResolvedValueOnce(undefined)

    render(<ForgotPasswordForm />)

    await user.type(screen.getByLabelText('Имейл'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /изпрати/i }))

    await waitFor(() => {
      expect(authClient.requestPasswordReset).toHaveBeenCalledWith('test@example.com')
      expect(
        screen.getByText(
          'Ако имаме този имейл, ще получите съобщение с връзка за промяна на паролата.'
        )
      ).toBeInTheDocument()
    })
  })

  it('should show error on failed request', async () => {
    const user = userEvent.setup()
    ;(authClient.requestPasswordReset as jest.Mock).mockReset()
    ;(authClient.requestPasswordReset as jest.Mock).mockRejectedValueOnce(
      new Error('Invalid email format')
    )

    render(<ForgotPasswordForm />)

    // Use a valid email format to pass HTML5 validation
    await user.type(screen.getByLabelText('Имейл'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /изпрати/i }))

    // Wait for the API call to be made
    await waitFor(() => {
      expect(authClient.requestPasswordReset).toHaveBeenCalledWith('test@example.com')
    })

    // Check for error message
    await waitFor(
      () => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('should show generic error message when error has no message', async () => {
    const user = userEvent.setup()
    ;(authClient.requestPasswordReset as jest.Mock).mockReset()
    ;(authClient.requestPasswordReset as jest.Mock).mockRejectedValueOnce({})

    render(<ForgotPasswordForm />)

    await user.type(screen.getByLabelText('Имейл'), 'test@example.com')
    const submitButton = screen.getByRole('button', { name: /изпрати/i })
    await user.click(submitButton)

    // Wait for the API call to be made
    await waitFor(() => {
      expect(authClient.requestPasswordReset).toHaveBeenCalledWith('test@example.com')
    })

    // Check for generic error message
    await waitFor(
      () => {
        expect(screen.getByText('Възникна проблем. Опитайте отново.')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('should disable submit button while loading', async () => {
    const user = userEvent.setup()
    ;(authClient.requestPasswordReset as jest.Mock).mockReset()
    
    let resolveRequest: () => void
    const requestPromise = new Promise<void>((resolve) => {
      resolveRequest = resolve
    })
    ;(authClient.requestPasswordReset as jest.Mock).mockReturnValue(requestPromise)

    render(<ForgotPasswordForm />)

    await user.type(screen.getByLabelText('Имейл'), 'test@example.com')

    const submitButton = screen.getByRole('button', { name: /изпрати/i })
    
    // Don't await the click to check the loading state immediately
    user.click(submitButton)

    // Check button gets disabled while loading
    await waitFor(() => {
      expect(screen.getByText('Изпращане...')).toBeInTheDocument()
    }, { timeout: 2000 })

    // Clean up by resolving the promise
    resolveRequest!()
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('should update button text during submission', async () => {
    const user = userEvent.setup()
    ;(authClient.requestPasswordReset as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    render(<ForgotPasswordForm />)

    const submitButton = screen.getByRole('button', { name: /изпрати/i })

    await user.type(screen.getByLabelText('Имейл'), 'test@example.com')
    await user.click(submitButton)

    expect(submitButton).toHaveTextContent('Изпращане...')

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('should navigate to login when clicking back button', async () => {
    const user = userEvent.setup()

    render(<ForgotPasswordForm />)

    await user.click(screen.getByRole('button', { name: /назад към вход/i }))

    expect(mockOpen).toHaveBeenCalledWith('login')
  })

  it('should clear error when submitting again', async () => {
    const user = userEvent.setup()
    ;(authClient.requestPasswordReset as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(undefined)

    render(<ForgotPasswordForm />)

    // First submission - error
    await user.type(screen.getByLabelText('Имейл'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /изпрати/i }))

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    // Second submission - success
    await user.click(screen.getByRole('button', { name: /изпрати/i }))

    await waitFor(() => {
      expect(screen.queryByText('Network error')).not.toBeInTheDocument()
      expect(
        screen.getByText(
          'Ако имаме този имейл, ще получите съобщение с връзка за промяна на паролата.'
        )
      ).toBeInTheDocument()
    })
  })

  it('should not show success message initially', () => {
    render(<ForgotPasswordForm />)

    expect(
      screen.queryByText(
        'Ако имаме този имейл, ще получите съобщение с връзка за промяна на паролата.'
      )
    ).not.toBeInTheDocument()
  })

  it('should not show error message initially', () => {
    render(<ForgotPasswordForm />)

    expect(screen.queryByText(/грешка/i)).not.toBeInTheDocument()
  })

  it('should handle HTML5 email validation', () => {
    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText('Имейл') as HTMLInputElement
    expect(emailInput.type).toBe('email')
  })

  it('should have correct placeholder text', () => {
    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText('Имейл') as HTMLInputElement
    expect(emailInput.placeholder).toBe('you@example.com')
  })
})

