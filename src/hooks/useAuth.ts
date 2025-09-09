import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { queryKeys } from '../services/queryClient';
import { showSuccessToast, showErrorToast } from '../components/toast';
import { DebugConsole } from '../utils/debug';

// Interface for user profile update data
interface UpdateProfileData {
  name?: string;
  email?: string;
  avatar?: string | null;
  // Add other profile fields as needed
}

// Login mutation
export const useLogin = () => {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const success = await login(email, password);
      if (!success) {
        throw new Error('Login failed');
      }
      return success;
    },
    onSuccess: () => {
      showSuccessToast(
        'Welcome back!',
        'You have been logged in successfully.',
      );
    },
    onError: (error: Error) => {
      console.log('Login error:', error);
      // showErrorToast('Login Failed', error.message);
    },
  });
};

// Register mutation
export const useRegister = () => {
  const { register } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      firstname,
      lastname,
      email,
      dateOfBirth,
      password,
      confirmPassword,
      phoneNumber,
    }: {
      firstname: string;
      lastname: string;
      email: string;
      dateOfBirth: string;
      password: string;
      confirmPassword: string;
      phoneNumber: string;
    }) => {
      const success = await register(
        firstname,
        lastname,
        email,
        dateOfBirth,
        password,
        confirmPassword,
        phoneNumber,
      );
      if (!success) {
        throw new Error('Registration failed');
      }
      return success;
    },
    onSuccess: data => {
      // Show success toast but don't navigate - let the screen handle navigation
      showSuccessToast(
        'Account Created!',
        'Welcome to Vyzor! Your account has been created successfully.',
      );
      console.log(
        '✅ Registration mutation successful, screen will handle navigation',
      );
    },
    onError: (error: Error) => {
      // Show error toast but don't navigate - let the screen handle staying on register
      showErrorToast('Registration Failed', error.message);
      console.log(
        '❌ Registration mutation failed, staying on register screen',
      );
    },
  });
};

// Logout mutation
type LogoutOptions = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export const useLogout = (options: LogoutOptions = {}) => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      queryClient.clear();
      showSuccessToast('Goodbye!', 'You have been logged out successfully.');
      if (options.onSuccess) options.onSuccess();
    },
    onError: (error: Error) => {
      showErrorToast('Logout Failed', error.message);
      if (options.onError) options.onError(error);
    },
  });
};

// Forgot password mutation
export const useForgotPassword = () => {
  const { forgotPassword } = useAuthStore();

  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const success = await forgotPassword(email);
      if (!success) {
        throw new Error('Failed to send reset email');
      }
      return success;
    },
    onSuccess: () => {
      showSuccessToast(
        'Email Sent!',
        'Password reset instructions have been sent to your email.',
      );
    },
    onError: (error: Error) => {
      showErrorToast('Reset Failed', error.message);
    },
  });
};

// Get current user query
export const useCurrentUser = () => {
  const { user, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch user');
    },
    enabled: isAuthenticated,
    initialData: user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Refresh tokens mutation
export const useRefreshTokens = () => {
  const { refreshTokens } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const success = await refreshTokens();
      if (!success) {
        throw new Error('Failed to refresh tokens');
      }
      return success;
    },
    onError: (error: Error) => {
      DebugConsole.error('useAuth', 'Token refresh failed', error);
      // Don't show toast for token refresh failures as they happen automatically
    },
  });
};
