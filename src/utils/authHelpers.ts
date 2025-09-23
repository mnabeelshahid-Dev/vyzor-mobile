import { showErrorToast, showSuccessToast } from '../components/toast';
import * as yup from "yup";
/**
 * Generic API response handler
 */
export const handleApiResponse = async <T>(
  apiCall: () => Promise<{ success: boolean; data?: T; message?: string }>,
  successMessage?: string,
  errorMessage?: string
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const response = await apiCall();

    if (response.success && response.data) {
      if (successMessage) {
        showSuccessToast('Success', successMessage);
      }
      return { success: true, data: response.data };
    } else {
      const error = response.message || errorMessage || 'Operation failed';
      showErrorToast('Error', error);
      return { success: false, error };
    }
  } catch (error: any) {
    const errorMsg = error.message || errorMessage || 'Network error occurred';
    showErrorToast('Error', errorMsg);
    return { success: false, error: errorMsg };
  }
};

/**
 * Generic async state handler
 */
export const withAsyncState = async <T>(
  setState: (state: { isLoading: boolean; error: string | null }) => void,
  operation: () => Promise<T>
): Promise<T | null> => {
  setState({ isLoading: true, error: null });

  try {
    const result = await operation();
    setState({ isLoading: false, error: null });
    return result;
  } catch (error: any) {
    const errorMessage = error.message || 'Operation failed';
    setState({ isLoading: false, error: errorMessage });
    return null;
  }
};

/**
 * Storage operations wrapper
 */
export const StorageHelper = {
  async saveUserSession(
    user: any,
    tokens: { accessToken: string; refreshToken: string }
  ) {
    await Promise.all([
      import('../services/storage').then(({ storage }) =>
        storage.setSecureString('access_token', tokens.accessToken)
      ),
      import('../services/storage').then(({ storage }) =>
        storage.setSecureString('refresh_token', tokens.refreshToken)
      ),
      import('../services/storage').then(({ storage }) =>
        storage.setObject('user_data', user)
      ),
    ]);
  },

  async saveTokens(tokens: { accessToken: string; refreshToken: string }) {
    await Promise.all([
      import('../services/storage').then(({ storage }) =>
        storage.setSecureString('access_token', tokens.accessToken)
      ),
      import('../services/storage').then(({ storage }) =>
        storage.setSecureString('refresh_token', tokens.refreshToken)
      ),
    ]);
  },

  async getAccessToken(): Promise<string | null> {
    const { storage } = await import('../services/storage');
    return storage.getSecureString('access_token');
  },

  async getRefreshToken(): Promise<string | null> {
    const { storage } = await import('../services/storage');
    return storage.getSecureString('refresh_token');
  },

  async clearUserSession() {
    await Promise.all([
      import('../services/storage').then(({ storage }) =>
        storage.removeSecureString('access_token')
      ),
      import('../services/storage').then(({ storage }) =>
        storage.removeSecureString('refresh_token')
      ),
      import('../services/storage').then(({ storage }) =>
        storage.removeItem('user_data')
      ),
    ]);
  },

  async getUserSession() {
    const { storage } = await import('../services/storage');
    return Promise.all([
      storage.getSecureString('access_token'),
      storage.getSecureString('refresh_token'),
      storage.getObject('user_data'),
    ]);
  },
};

/**
 * Auth operation wrapper
 */
export const createAuthOperation = <T extends any[]>(
  operation: (...args: T) => Promise<any>,
  successMessage: string,
  errorMessage: string = 'Operation failed'
) => {
  return async (...args: T) => {
    return handleApiResponse(
      () => operation(...args),
      successMessage,
      errorMessage
    );
  };
};

export const isValidEmail = (email: string): boolean => {
  const schema = yup.string().email().matches(/^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/, "Invalid email address");
  try {
    schema.validateSync(email);
    return true;
  } catch {
    return false
  }
};