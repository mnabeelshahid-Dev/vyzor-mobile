import { showErrorToast, showSuccessToast } from '../components/toast';
import { debugFetch } from './networkDebugger';

// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request configuration
export interface RequestConfig {
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

// Generic fetch wrapper with error handling
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
  }

  // Generic request method
  async request<T>(
    endpoint: string,
    method: HttpMethod = 'GET',
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = { ...this.defaultHeaders, ...config.headers };

      const requestInit: RequestInit = {
        method,
        headers,
      };

      // Handle body for POST/PUT/PATCH requests
      if (config.body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        if (config.body instanceof FormData) {
          requestInit.body = config.body;
          // Remove Content-Type for FormData (browser sets it automatically)
          delete headers['Content-Type'];
        } else if (config.body instanceof URLSearchParams) {
          requestInit.body = config.body.toString();
          // Keep the application/x-www-form-urlencoded content-type
        } else {
          requestInit.body = JSON.stringify(config.body);
        }
      }

      const response = await debugFetch(url, requestInit);

      // Handle empty response body
      let data;
      try {
        const responseText = await response.text();
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.warn('Failed to parse response JSON:', parseError);
        data = { message: 'Invalid response format' };
      }

      if (response.ok) {
        return {
          success: true,
          data,
          message: data.message,
        };
      } else {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
          message:
            data.message || `Request failed with status ${response.status}`,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
        message: error.message || 'Failed to connect to server',
      };
    }
  }

  // Convenience methods
  get<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, 'GET', config);
  }

  post<T>(endpoint: string, body?: any, config?: RequestConfig) {
    return this.request<T>(endpoint, 'POST', { ...config, body });
  }

  put<T>(endpoint: string, body?: any, config?: RequestConfig) {
    return this.request<T>(endpoint, 'PUT', { ...config, body });
  }

  delete<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, 'DELETE', config);
  }

  patch<T>(endpoint: string, body?: any, config?: RequestConfig) {
    return this.request<T>(endpoint, 'PATCH', { ...config, body });
  }
}

// Generic error handler for API responses
export const handleApiError = (
  response: ApiResponse,
  customMessage?: string
): void => {
  const errorMessage =
    customMessage || response.message || response.error || 'An error occurred';
  showErrorToast('Error', errorMessage);
};

// Generic success handler for API responses
export const handleApiSuccess = (
  response: ApiResponse,
  customMessage?: string
): void => {
  const successMessage =
    customMessage || response.message || 'Operation successful';
  showSuccessToast('Success', successMessage);
};

// Generic API operation wrapper with loading state
export const withApiOperation = async <T>(
  operation: () => Promise<ApiResponse<T>>,
  setLoading: (loading: boolean) => void,
  successMessage?: string,
  errorMessage?: string
): Promise<T | null> => {
  setLoading(true);

  try {
    const response = await operation();

    if (response.success) {
      if (successMessage) {
        handleApiSuccess(response, successMessage);
      }
      return response.data || null;
    } else {
      handleApiError(response, errorMessage);
      return null;
    }
  } catch (error: any) {
    showErrorToast(
      'Error',
      errorMessage || error.message || 'Operation failed'
    );
    return null;
  } finally {
    setLoading(false);
  }
};

// Create authenticated API client
export const createAuthenticatedClient = (
  baseURL: string,
  getAuthToken: () => string | null
): ApiClient => {
  return new ApiClient(baseURL, {
    get Authorization() {
      const token = getAuthToken();
      return token ? `Bearer ${token}` : '';
    },
  });
};

// Form data helper
export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value.toString());
    }
  });

  return formData;
};

// URL params helper
export const createUrlParams = (data: Record<string, any>): URLSearchParams => {
  const params = new URLSearchParams();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      params.append(key, value.toString());
    }
  });

  return params;
};

// Default API client instance
export const apiClient = new ApiClient('https://vyzor.app/api');

// Example usage patterns:
/*
// Basic usage:
const response = await apiClient.get('/users');

// With error handling:
const result = await withApiOperation(
  () => apiClient.post('/users', userData),
  setLoading,
  'User created successfully',
  'Failed to create user'
);

// With authentication:
const authClient = createAuthenticatedClient(
  'https://vyzor.app/api',
  () => getStoredToken()
);

// Form data request:
const formData = createFormData({ name: 'John', file: fileBlob });
await apiClient.post('/upload', formData);
*/
