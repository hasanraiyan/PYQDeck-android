// Export all context providers and hooks from a single file
import { AuthProvider, useAuth } from './AuthContext';
import { AppProvider, useApp } from './AppContext';

// Combined provider that wraps both contexts
export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <AppProvider>{children}</AppProvider>
    </AuthProvider>
  );
};

// Export individual providers and hooks
export { AuthProvider, useAuth, AppProvider, useApp };