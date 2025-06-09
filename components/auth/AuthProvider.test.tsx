import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Mock the fetch function
global.fetch = jest.fn();

// Mock the Google OAuth provider
jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => children,
  GoogleLogin: () => <button data-testid="google-login">Login with Google</button>,
}));

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <AuthProvider>
        <div data-testid="test-child">Test Child</div>
      </AuthProvider>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('initializes with unauthenticated state', () => {
    const TestComponent = () => {
      const { isAuthenticated, user } = useAuth();
      return (
        <div>
          <div data-testid="auth-status">{isAuthenticated.toString()}</div>
          <div data-testid="user">{user ? 'user' : 'no-user'}</div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('handles successful session check', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ isAuthenticated: true, user: mockUser }),
    });

    const TestComponent = () => {
      const { isAuthenticated, user } = useAuth();
      return (
        <div>
          <div data-testid="auth-status">{isAuthenticated.toString()}</div>
          <div data-testid="user-email">{user?.email}</div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  it('handles session check error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Session check failed'));

    render(
      <AuthProvider>
        <div>Test</div>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Session check failed:', expect.any(Error));
    });

    consoleError.mockRestore();
  });

  it('handles logout correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({});

    const TestComponent = () => {
      const { isAuthenticated, logout } = useAuth();
      return (
        <div>
          <div data-testid="auth-status">{isAuthenticated.toString()}</div>
          <button onClick={logout}>Logout</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
      });
    });
  });
}); 