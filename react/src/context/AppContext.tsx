import React from 'react';
import type { ReactNode } from 'react';

/**
 * Pass-through provider kept for future use. The previous implementation
 * exposed a global isLoading/error state but no screen consumed it; every
 * screen uses its own local `useState` instead. The provider remains so
 * descendants can subscribe to a shared value when one is introduced.
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
