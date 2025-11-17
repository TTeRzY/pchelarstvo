# Authentication Testing Documentation

This document provides an overview of the unit tests for the authentication functionality in the Pchelarstvo.bg project.

## Test Coverage

### 1. **authClient Tests** (`src/lib/__tests__/authClient.test.ts`)

Comprehensive unit tests for the authentication client library.

#### Test Suites:

**authStorage**
- ✅ Get token from localStorage
- ✅ Return null when no token exists
- ✅ Store token in localStorage
- ✅ Remove token when setting to null

**authClient.login**
- ✅ Successfully login with valid credentials
- ✅ Store token in localStorage after login
- ✅ Throw error on invalid credentials (401)
- ✅ Throw error on network failure
- ✅ Handle missing email
- ✅ Handle missing password

**authClient.register**
- ✅ Successfully register a new user
- ✅ Store token after registration
- ✅ Throw error when email already exists
- ✅ Throw error on weak password
- ✅ Handle missing required fields

**authClient.requestPasswordReset**
- ✅ Successfully request password reset
- ✅ Handle invalid email format
- ✅ Succeed even for non-existent email (security)
- ✅ Handle network errors
- ✅ Handle missing email

**authClient.logout**
- ✅ Successfully logout with token
- ✅ Send Authorization header with token
- ✅ Clear token from localStorage
- ✅ Handle logout without token

**authClient.resetPassword**
- ✅ Successfully reset password with valid token
- ✅ Send correct payload to API
- ✅ Throw error with invalid/expired token

**authClient.me**
- ✅ Return user data with valid token
- ✅ Return null without token

### 2. **AuthForm Component Tests** (`src/components/auth/__tests__/AuthForm.test.tsx`)

Integration tests for the login and registration form component.

#### Test Suites:

**Login Mode**
- ✅ Render login form correctly
- ✅ Not render name field in login mode
- ✅ Successfully login with valid credentials
- ✅ Show error when email is missing
- ✅ Show error when password is missing
- ✅ Show error on failed login
- ✅ Disable submit button while submitting
- ✅ Open forgot password modal
- ✅ Close modal when clicking close button

**Register Mode**
- ✅ Render register form correctly
- ✅ Show name field in register mode
- ✅ Not show forgot password link
- ✅ Successfully register with valid data
- ✅ Show error when name is missing
- ✅ Show error when email is missing
- ✅ Show error when password is missing
- ✅ Show error on failed registration
- ✅ Show generic error message when error has no message
- ✅ Disable submit button while submitting

### 3. **ForgotPasswordForm Component Tests** (`src/components/auth/__tests__/ForgotPasswordForm.test.tsx`)

Integration tests for the forgot password form component.

#### Test Suites:

**Rendering**
- ✅ Render forgot password form correctly
- ✅ Require email input
- ✅ Have correct placeholder text
- ✅ Handle HTML5 email validation

**Functionality**
- ✅ Successfully send reset email
- ✅ Show success message after sending
- ✅ Show error on failed request
- ✅ Show generic error message when error has no message
- ✅ Clear error when submitting again

**UI States**
- ✅ Disable submit button while loading
- ✅ Update button text during submission
- ✅ Not show success message initially
- ✅ Not show error message initially

**Navigation**
- ✅ Navigate to login when clicking back button

## Running Tests

### Install Dependencies

First, install the testing dependencies:

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

## Test Setup

The project uses the following testing stack:

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Additional Jest matchers

### Configuration Files

- **jest.config.js**: Jest configuration for Next.js
- **jest.setup.js**: Global test setup (mocks, utilities)

### Mocked Dependencies

The following are globally mocked in `jest.setup.js`:

- `next/navigation` - Next.js routing hooks
- `localStorage` - Browser localStorage API
- `fetch` - Global fetch API

## Test Patterns

### 1. **Arrange-Act-Assert**

All tests follow the AAA pattern:

```typescript
it('should successfully login', async () => {
  // Arrange
  const mockResponse = { user: mockUser, token: 'token' }
  ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockResponse })

  // Act
  const result = await authClient.login('test@example.com', 'password')

  // Assert
  expect(result).toEqual(mockResponse)
})
```

### 2. **User-Centric Testing**

Component tests focus on user interactions:

```typescript
it('should login when form is submitted', async () => {
  const user = userEvent.setup()

  render(<AuthForm mode="login" />)

  await user.type(screen.getByLabelText('Имейл'), 'test@example.com')
  await user.type(screen.getByLabelText('Парола'), 'password')
  await user.click(screen.getByRole('button', { name: /вход/i }))

  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalled()
  })
})
```

### 3. **Error Handling**

All tests include error scenarios:

```typescript
it('should show error on failed login', async () => {
  mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'))

  // ... interact with form ...

  await waitFor(() => {
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })
})
```

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## CI/CD Integration

Tests can be integrated into your CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test -- --coverage
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Clarity**: Test names should describe behavior
3. **Mocking**: Mock external dependencies
4. **Coverage**: Aim for high code coverage
5. **Maintenance**: Keep tests up to date with code changes

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module '@/...'"
**Solution**: Check `jest.config.js` moduleNameMapper configuration

**Issue**: "localStorage is not defined"
**Solution**: Ensure `jest.setup.js` includes localStorage mock

**Issue**: "fetch is not defined"
**Solution**: Ensure `jest.setup.js` includes fetch mock

## Future Enhancements

- [ ] Add E2E tests with Playwright/Cypress
- [ ] Add visual regression tests
- [ ] Add performance tests
- [ ] Increase coverage to 90%+
- [ ] Add mutation testing

## Contact

For questions or issues with tests, please open an issue or contact the development team.

