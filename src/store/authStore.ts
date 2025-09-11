import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { User, LoadingState } from '../types';
import { storage } from '../services/storage';
import { authApi } from '../api/auth';
import { fetchCurrentUser } from '../api/currentUser';
import {
  handleApiResponse,
  withAsyncState,
  StorageHelper,
  createAuthOperation,
} from '../utils/authHelpers';

interface AuthState extends LoadingState {
  user: User | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  register: (
    firstname: string,
    lastname: string,
    email: string,
    dateOfBirth: string,
    password: string,
    confirmPassword: string,
    phoneNumber: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  refreshTokens: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string): Promise<boolean> => {
        console.log('🏪 [STORE] Starting login process...');
        set({ isLoading: true, error: null });

        try {
          console.log('🏪 [STORE] Calling authApi.login...');
          const response = await authApi.login(email, password);

          console.log('🏪 [STORE] Received response:', {
            success: response.success,
            hasData: !!response.data,
            message: response.message,
          });

          if (response.success && response.data) {
            console.log('🏪 [STORE] Login successful, saving session...');
            const { user, tokens } = response.data;
            await StorageHelper.saveUserSession(user, tokens);

            // Fetch current user details from backend
            const currentUserResp = await fetchCurrentUser();
            let currentUser = user;
            if (currentUserResp.success && currentUserResp.data) {
              // Cast response to User type and safely map fields
              const apiUser = currentUserResp.data as any;
              console.log('====================================');
              console.log('🏪 [STORE] Fetched current user from API:', apiUser);
              console.log('====================================');
              currentUser = {
                id: apiUser?.webId ?? "",
                email: apiUser?.email ?? "",
                name: apiUser?.firstName && apiUser?.lastName
                  ? `${apiUser.firstName} ${apiUser.lastName}`
                  : "",
                ...apiUser,
              };
            }

            set({
              user: currentUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            console.log('🏪 [STORE] Session saved, showing success toast...');
            // Show success toast
            const { showSuccessToast } = await import('../components/toast');
            showSuccessToast('LOGIN');

            console.log('🏪 [STORE] Login completed successfully');
            return true;
          } else {
            console.log('🏪 [STORE] Login failed:', response.message);
            const errorMessage = response.message || 'Login failed';
            set({ isLoading: false, error: errorMessage });

            // Show error toast
            const { showApiErrorToast } = await import('../components/toast');
            showApiErrorToast(
              { status: 401, message: errorMessage },
              'Please check your credentials and try again'
            );

            return false;
          }
        } catch (error: any) {
          console.log('🏪 [STORE] Login exception:', error.message);
          const errorMessage = error.message || 'Login failed';
          set({ isLoading: false, error: errorMessage });

          // Show error toast
          const { showApiErrorToast } = await import('../components/toast');
          showApiErrorToast(error, 'Unable to connect to server');

          return false;
        }
      },

      register: async (
        name: string,
        email: string,
        dateOfBirth: string,
        password: string,
        confirmPassword: string,
        phoneNumber: string
      ): Promise<boolean> => {
        console.log('🏪 [STORE] Starting registration process...');
        set({ isLoading: true, error: null });

        try {
          console.log('🏪 [STORE] Calling authApi.register...');
          const response = await authApi.register(
            name,
            email,
            password,
            confirmPassword,
            phoneNumber,
            dateOfBirth
          );
          console.log('🏪 [STORE] API response:', response);

          if (response.success && response.data) {
            console.log(
              '🏪 [STORE] Registration successful, saving session...'
            );
            const { user, tokens } = response.data;
            await StorageHelper.saveUserSession(user, tokens);

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            console.log('🏪 [STORE] Session saved, showing success toast...');
            // Show success toast
            const { showSuccessToast } = await import('../components/toast');
            showSuccessToast('REGISTER');

            console.log('🏪 [STORE] Registration completed successfully');
            return true;
          } else {
            console.log('🏪 [STORE] Registration failed:', response.message);
            const errorMessage = response.message || 'Registration failed';
            set({ isLoading: false, error: errorMessage });

            // Show error toast
            const { showApiErrorToast } = await import('../components/toast');
            showApiErrorToast(
              { status: 422, message: errorMessage },
              'Please check your information and try again'
            );

            return false;
          }
        } catch (error: any) {
          console.log('🏪 [STORE] Registration exception:', error);
          const errorMessage = error.message || 'Registration failed';
          set({ isLoading: false, error: errorMessage });

          // Show error toast
          const { showApiErrorToast } = await import('../components/toast');
          showApiErrorToast(error, 'Unable to create account');

          return false;
        }
      },

      logout: async (): Promise<void> => {
        await StorageHelper.clearUserSession();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        // Show logout success toast
        const { showSuccessToast } = await import('../components/toast');
        showSuccessToast('LOGOUT');
      },

      forgotPassword: async (email: string): Promise<boolean> => {
        const result = await withAsyncState(
          state => set(state),
          async () => {
            const response = await handleApiResponse(
              () => authApi.forgotPassword(email),
              'Check your email for reset instructions.',
              'Failed to send reset email'
            );

            return response.success;
          }
        );

        return result || false;
      },

      refreshTokens: async (): Promise<boolean> => {
        const result = await withAsyncState(
          state => set(state),
          async () => {
            const refreshToken = await StorageHelper.getRefreshToken();

            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await handleApiResponse(
              () => authApi.refreshToken(refreshToken),
              null, // No success toast for background operation
              'Session expired. Please login again.'
            );

            if (response.success && response.data) {
              await StorageHelper.saveTokens(response.data);
              return true;
            }

            // If refresh fails, clear session and logout
            await StorageHelper.clearUserSession();
            set({
              user: null,
              isAuthenticated: false,
              error: 'Session expired',
            });

            return false;
          }
        );

        return result || false;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          return await storage.getString(name);
        },
        setItem: async (name: string, value: string) => {
          await storage.setString(name, value);
        },
        removeItem: async (name: string) => {
          await storage.removeItem(name);
        },
      })),
      partialize: state => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
