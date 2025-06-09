import { render, screen, fireEvent } from '@testing-library/react';
import { LoginButton } from './LoginButton';
import { AuthProvider } from './AuthProvider';

// Mock the Google OAuth provider
jest.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess, onError }: any) => (
    <button
      data-testid="google-login"
      onClick={() => onSuccess({ credential: 'test-credential' })}
    >
      Sign in with Google
    </button>
  ),
}));

describe('LoginButton', () => {
  it('renders Google login button when not authenticated', () => {
    render(
      <AuthProvider>
        <LoginButton />
      </AuthProvider>
    );

    expect(screen.getByTestId('google-login')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
  });

  it('renders sign out button when authenticated', () => {
    // Mock the useAuth hook to return authenticated state
    jest.spyOn(require('./AuthProvider'), 'useAuth').mockReturnValue({
      isAuthenticated: true,
      logout: jest.fn(),
    });

    render(
      <AuthProvider>
        <LoginButton />
      </AuthProvider>
    );

    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('calls logout when sign out button is clicked', () => {
    const mockLogout = jest.fn();
    jest.spyOn(require('./AuthProvider'), 'useAuth').mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(
      <AuthProvider>
        <LoginButton />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Sign Out'));
    expect(mockLogout).toHaveBeenCalled();
  });
}); 