import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { supabase } from '@/utils/supabase';

// Mock supabase
vi.mock('@/utils/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  },
}));

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Test component that uses the AuthContext
const TestComponent = () => {
  const { 
    user, 
    loading, 
    signIn, 
    signUp, 
    signOut, 
    resetPassword, 
    signInWithProvider, 
    signInWithGoogle,
    googleMapsApiKey
  } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{user ? user.id : 'No User'}</div>
      <div data-testid="google-maps-api-key">{googleMapsApiKey}</div>
      
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => signUp('test@example.com', 'password', 'Test User')}>Sign Up</button>
      <button onClick={() => signOut()}>Sign Out</button>
      <button onClick={() => resetPassword('test@example.com')}>Reset Password</button>
      <button onClick={() => signInWithProvider('google')}>Sign In with Provider</button>
      <button onClick={() => signInWithGoogle()}>Sign In with Google</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:3000',
        hostname: 'localhost',
        hash: '',
      },
      writable: true,
    });
    
    // Default mock implementations
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    (supabase.auth.onAuthStateChange as any).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('provides initial state with no user and loading true', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially loading should be true
    expect(screen.getByTestId('loading').textContent).toBe('Loading');
    
    // After auth initialization, loading should be false and no user
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('Not Loading');
      expect(screen.getByTestId('user').textContent).toBe('No User');
    });
  });

  it('provides Google Maps API key', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('google-maps-api-key').textContent).toBe('AIzaSyBkVNRDYcQLBkA2c5nTKrDHvUGqraW9cX8');
    });
  });

  it('calls signIn with correct parameters', async () => {
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: { id: 'user-123' }, session: { user: { id: 'user-123' } } },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('Not Loading');
    });

    // Click sign in button
    fireEvent.click(screen.getByText('Sign In'));

    // Check if signInWithPassword was called with correct parameters
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('calls signUp with correct parameters', async () => {
    (supabase.auth.signUp as any).mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('Not Loading');
    });

    // Click sign up button
    fireEvent.click(screen.getByText('Sign Up'));

    // Check if signUp was called with correct parameters
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
      options: {
        data: {
          full_name: 'Test User',
        }
      }
    });
  });

  it('calls signOut when sign out button is clicked', async () => {
    (supabase.auth.signOut as any).mockResolvedValue({
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('Not Loading');
    });

    // Click sign out button
    fireEvent.click(screen.getByText('Sign Out'));

    // Check if signOut was called
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('calls resetPassword with correct parameters', async () => {
    (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('Not Loading');
    });

    // Click reset password button
    fireEvent.click(screen.getByText('Reset Password'));

    // Check if resetPasswordForEmail was called with correct parameters
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      {
        redirectTo: 'http://localhost:3000/reset-password',
      }
    );
  });

  it('calls signInWithOAuth with correct parameters for provider', async () => {
    (supabase.auth.signInWithOAuth as any).mockResolvedValue({
      data: {},
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('Not Loading');
    });

    // Click sign in with provider button
    fireEvent.click(screen.getByText('Sign In with Provider'));

    // Check if signInWithOAuth was called with correct parameters
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000',
        scopes: 'email profile',
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline'
        }
      }
    });
  });

  it('calls signInWithOAuth with correct parameters for Google', async () => {
    (supabase.auth.signInWithOAuth as any).mockResolvedValue({
      data: {},
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('Not Loading');
    });

    // Click sign in with Google button
    fireEvent.click(screen.getByText('Sign In with Google'));

    // Check if signInWithOAuth was called with correct parameters
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
        scopes: 'email profile',
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline'
        }
      }
    });
  });

  it('handles auth state change', async () => {
    // Mock initial session
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    // Setup auth state change handler
    let authStateChangeHandler: (event: string, session: any) => void;
    (supabase.auth.onAuthStateChange as any).mockImplementation((handler) => {
      authStateChangeHandler = handler;
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('Not Loading');
      expect(screen.getByTestId('user').textContent).toBe('No User');
    });

    // Simulate auth state change
    act(() => {
      authStateChangeHandler('SIGNED_IN', {
        user: { id: 'user-123' },
      });
    });

    // User should be updated
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('user-123');
    });
  });

  it('throws an error when useAuth is used outside of AuthProvider', () => {
    // Suppress console.error for this test
    const originalConsoleError = console.error;
    console.error = vi.fn();

    // Expect an error when rendering TestComponent without AuthProvider
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    // Restore console.error
    console.error = originalConsoleError;
  });
});
