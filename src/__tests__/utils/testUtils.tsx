import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import LocaleProvider from '@/context/LocaleProvider';
import ModalProvider from '@/components/modal/ModalProvider';
import AuthProvider from '@/context/AuthProvider';

// Custom render function that includes all providers
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <ModalProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ModalProvider>
    </LocaleProvider>
  );
}

// Custom render with providers
function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: AllTheProviders,
    ...options,
  });
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

