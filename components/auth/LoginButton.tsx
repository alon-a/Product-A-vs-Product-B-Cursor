'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from './AuthProvider';

export const LoginButton = () => {
  const { isAuthenticated, logout, login, authError } = useAuth();

  if (isAuthenticated) {
    return (
      <button
        onClick={logout}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Sign Out
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <GoogleLogin
        onSuccess={login}
        onError={() => {
          console.error('Login Failed');
        }}
        useOneTap
        theme="filled_blue"
        shape="rectangular"
        text="signin_with"
        locale="en"
      />
    </div>
  );
}; 