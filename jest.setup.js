// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock next-intl to avoid ESM issues
jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
  useLocale: () => 'bg',
  useFormatter: () => ({
    dateTime: (date) => date.toISOString(),
    number: (num) => num.toString(),
  }),
  NextIntlClientProvider: ({ children }) => children,
}));

