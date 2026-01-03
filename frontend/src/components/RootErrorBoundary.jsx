import React from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Root Error Boundary
 * Wraps the entire app to catch any errors during initialization
 */
const RootErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

export default RootErrorBoundary;

