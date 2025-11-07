/**
 * Unit tests for authClient
 * Tests login, register, and password reset functionality
 */

import { authClient, authStorage } from '../authClient'
import type { AuthResponse } from '../authClient'
import type { User } from '@/types/user'

// Mock fetch
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('authStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('test-token')
      const token = authStorage.getToken()
      expect(token).toBe('test-token')
      expect(localStorageMock.getItem).toHaveBeenCalledWith('token')
    })

    it('should return null if no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null)
      const token = authStorage.getToken()
      expect(token).toBeNull()
    })
  })

  describe('setToken', () => {
    it('should store token in localStorage', () => {
      authStorage.setToken('new-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-token')
    })

    it('should remove token from localStorage when null', () => {
      authStorage.setToken(null)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    })
  })
})

describe('authClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        status: 'active',
        verifiedAt: new Date().toISOString(),
        trustLevel: 'bronze',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      }

      const mockResponse: AuthResponse = {
        user: mockUser,
        token: 'test-token-123',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await authClient.login('test@example.com', 'password123')

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        })
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token-123')
    })

    it('should throw error on invalid credentials', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Invalid credentials',
      })

      await expect(authClient.login('test@example.com', 'wrong-password')).rejects.toThrow(
        'Invalid credentials'
      )
    })

    it('should throw error on network failure', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      await expect(authClient.login('test@example.com', 'password123')).rejects.toThrow(
        'Network error'
      )
    })

    it('should handle missing email', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: async () => 'Email is required',
      })

      await expect(authClient.login('', 'password123')).rejects.toThrow('Email is required')
    })

    it('should handle missing password', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: async () => 'Password is required',
      })

      await expect(authClient.login('test@example.com', '')).rejects.toThrow(
        'Password is required'
      )
    })
  })

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockUser: User = {
        id: '2',
        name: 'New User',
        email: 'newuser@example.com',
        role: 'user',
        status: 'active',
        verifiedAt: null,
        trustLevel: 'bronze',
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
      }

      const mockResponse: AuthResponse = {
        user: mockUser,
        token: 'new-user-token',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await authClient.register('New User', 'newuser@example.com', 'password123')

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'New User',
            email: 'newuser@example.com',
            password: 'password123',
            password_confirmation: 'password123',
          }),
        })
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-user-token')
    })

    it('should throw error when email already exists', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: async () => 'Email already exists',
      })

      await expect(
        authClient.register('Test User', 'existing@example.com', 'password123')
      ).rejects.toThrow('Email already exists')
    })

    it('should throw error on weak password', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: async () => 'Password must be at least 8 characters',
      })

      await expect(
        authClient.register('Test User', 'test@example.com', '123')
      ).rejects.toThrow('Password must be at least 8 characters')
    })

    it('should handle missing required fields', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: async () => 'All fields are required',
      })

      await expect(authClient.register('', '', '')).rejects.toThrow('All fields are required')
    })
  })

  describe('requestPasswordReset', () => {
    it('should successfully request password reset', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Password reset email sent' }),
      })

      await expect(authClient.requestPasswordReset('test@example.com')).resolves.not.toThrow()

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/forgot-password',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      )
    })

    it('should handle invalid email format', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: async () => 'Invalid email format',
      })

      await expect(authClient.requestPasswordReset('invalid-email')).rejects.toThrow(
        'Invalid email format'
      )
    })

    it('should succeed even for non-existent email (security)', async () => {
      // For security, the API should not reveal if an email exists or not
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'If the email exists, a reset link has been sent' }),
      })

      await expect(
        authClient.requestPasswordReset('nonexistent@example.com')
      ).resolves.not.toThrow()
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      await expect(authClient.requestPasswordReset('test@example.com')).rejects.toThrow(
        'Network error'
      )
    })

    it('should handle missing email', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: async () => 'Email is required',
      })

      await expect(authClient.requestPasswordReset('')).rejects.toThrow('Email is required')
    })
  })

  describe('logout', () => {
    it('should successfully logout with token', async () => {
      localStorageMock.getItem.mockReturnValue('test-token')
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Logged out successfully' }),
      })

      await authClient.logout()

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/logout',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
        })
      )
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    })

    it('should clear token even without API call', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      await authClient.logout()

      expect(global.fetch).not.toHaveBeenCalled()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    })
  })

  describe('resetPassword', () => {
    it('should successfully reset password with valid token', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Password reset successfully' }),
      })

      await expect(
        authClient.resetPassword({
          email: 'test@example.com',
          token: 'reset-token-123',
          password: 'newpassword123',
          confirmPassword: 'newpassword123',
        })
      ).resolves.not.toThrow()

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/reset-password',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            token: 'reset-token-123',
            password: 'newpassword123',
            password_confirmation: 'newpassword123',
          }),
        })
      )
    })

    it('should throw error with invalid token', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: async () => 'Invalid or expired reset token',
      })

      await expect(
        authClient.resetPassword({
          email: 'test@example.com',
          token: 'invalid-token',
          password: 'newpassword123',
          confirmPassword: 'newpassword123',
        })
      ).rejects.toThrow('Invalid or expired reset token')
    })
  })

  describe('me', () => {
    it('should return user data with valid token', async () => {
      localStorageMock.getItem.mockReturnValue('valid-token')

      const mockUser: User = {
        id: '1',
        name: 'Test Admin',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active',
        verifiedAt: new Date().toISOString(),
        trustLevel: 'gold',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      }

      const result = await authClient.me()

      expect(result).toBeDefined()
      expect(result?.email).toBe('admin@example.com')
    })

    it('should return null without token', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = await authClient.me()

      expect(result).toBeNull()
    })
  })
})

