import type { ReactNode } from 'react';

/** Small helper for inline error messages. */
export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <p className="error-message" role="alert">
      {children}
    </p>
  );
}