// Simplified API service without axios for now
// Simple inline config instead of separate constants file
const API_CONFIG = {
  BASE_URL: 'https://vyzor.app',
  TIMEOUT: 10000,
} as const;

const AUTH_CONFIG = {
  ACCESS_TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
} as const;

const FEATURE_FLAGS = {
  DEBUG_API_LOGS: __DEV__,
} as const;
import { ApiResponse } from '../types';
import { storage } from './storage';
import { DebugConsole } from '../utils/debug';

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
}

class ApiService {
  private baseURL = API_CONFIG.BASE_URL;

  private async makeRequest<T = unknown>(
    endpoint: string,
    config: RequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      let token: string | null = null;
      try {
        token = await storage.getSecureString(AUTH_CONFIG.ACCESS_TOKEN_KEY);
      } catch (storageError) {
        if (FEATURE_FLAGS.DEBUG_API_LOGS) {
          DebugConsole.warn('Failed to retrieve auth token', storageError);
        }
      }
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...config.headers,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const requestConfig: RequestInit = {
        method: config.method,
        headers,
      };

      if (config.body) {
        requestConfig.body = JSON.stringify(config.body);
      }

      if (FEATURE_FLAGS.DEBUG_API_LOGS) {
        DebugConsole.api(config.method, `${this.baseURL}${endpoint}`, {
          headers,
          body: config.body,
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        API_CONFIG.TIMEOUT,
      );

      requestConfig.signal = controller.signal;
      const response = await fetch(`${this.baseURL}${endpoint}`, requestConfig);
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorMessage += ` - ${errorBody}`;
          }
        } catch {
          // Ignore parsing errors, use default message
        }
        throw new Error(errorMessage);
      }

      let data: T | string;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (FEATURE_FLAGS.DEBUG_API_LOGS) {
        DebugConsole.success(`API Response ${response.status}`, {
          url: `${this.baseURL}${endpoint}`,
          data,
        });
      }

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      console.error('❌ [API EXCEPTION]', error);
      
      if (FEATURE_FLAGS.DEBUG_API_LOGS) {
        DebugConsole.error('API Exception', String(error));
      }

      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async get<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'POST', body: data });
  }

  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'PUT', body: data });
  }

  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'PATCH', body: data });
  }

  async delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  async postFormData<T = unknown>(
    endpoint: string,
    formData: FormData,
  ): Promise<ApiResponse<T>> {
    try {
      let token: string | null = null;
      try {
        token = await storage.getSecureString(AUTH_CONFIG.ACCESS_TOKEN_KEY);
      } catch (storageError) {
        if (FEATURE_FLAGS.DEBUG_API_LOGS) {
          DebugConsole.warn('Failed to retrieve auth token', storageError);
        }
      }

      const headers: Record<string, string> = {
        // Don't set Content-Type for FormData - let the browser set it with boundary
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const requestConfig: RequestInit = {
        method: 'POST',
        headers,
        body: formData,
      };

      if (FEATURE_FLAGS.DEBUG_API_LOGS) {
        DebugConsole.api('POST', `${this.baseURL}${endpoint}`, {
          headers,
          body: 'FormData (cannot display)',
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        API_CONFIG.TIMEOUT,
      );

      requestConfig.signal = controller.signal;
      const response = await fetch(`${this.baseURL}${endpoint}`, requestConfig);
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorMessage += ` - ${errorBody}`;
          }
        } catch {
          // Ignore parsing errors, use default message
        }
        throw new Error(errorMessage);
      }

      let data: T | string;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (FEATURE_FLAGS.DEBUG_API_LOGS) {
        DebugConsole.success(`API Response ${response.status}`, {
          url: `${this.baseURL}${endpoint}`,
          data,
        });
      }

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      if (FEATURE_FLAGS.DEBUG_API_LOGS) {
        Debugconsole.log('ApiService', 'FormData Upload Failed', error);
      }

      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // ApiService
async postFileData<T = unknown>(
  endpoint: string,
  formData: FormData,
  options?: { timeoutMs?: number } // new optional param
): Promise<ApiResponse<T>> {
  try {
    let token: string | null = null;
    try {
      token = await storage.getSecureString(AUTH_CONFIG.ACCESS_TOKEN_KEY);
    } catch (storageError) {
      if (FEATURE_FLAGS.DEBUG_API_LOGS) {
        DebugConsole.warn('Failed to retrieve auth token', storageError);
      }
    }

    const headers: Record<string, string> = { /* no content-type */ };
    if (token) headers.Authorization = `Bearer ${token}`;

    const requestConfig: RequestInit = {
      method: 'POST',
      headers,
      body: formData,
    };

    if (FEATURE_FLAGS.DEBUG_API_LOGS) {
      DebugConsole.api('POST', `${this.baseURL}${endpoint}`, {
        headers,
        body: 'FormData (not logged)',
        extra: options,
      });
    }

    let controller: AbortController | undefined;
    let timeoutId: any;
    if (options?.timeoutMs && options.timeoutMs > 0) {
      controller = new AbortController();
      requestConfig.signal = controller.signal;
      timeoutId = setTimeout(() => controller!.abort(), options.timeoutMs);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, requestConfig);

    if (timeoutId) clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.text();
        if (errorBody) errorMessage += ` - ${errorBody}`;
      } catch {}
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type') || '';
    const data: any = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (FEATURE_FLAGS.DEBUG_API_LOGS) {
      DebugConsole.success(`API Response ${response.status}`, { url: `${this.baseURL}${endpoint}`, data });
    }

    return { success: true, data: data as T };

  } catch (error: any) {
    // Better handling for aborts
    const isAbort = (error && (error.name === 'AbortError' || /aborted|abort/i.test(String(error.message))));
    if (FEATURE_FLAGS.DEBUG_API_LOGS) {
      try {
        DebugConsole.log('ApiService', 'FormData Upload Failed', { error, isAbort });
      } catch (logErr) {
        console.error('Logging failed in postFormData catch', logErr);
      }
    }

    return {
      success: false,
      message: isAbort ? 'Upload aborted (timeout). Try again or increase timeout.' :
               (error instanceof Error ? error.message : 'Unknown error occurred'),
    };
  }
}

}

export const apiService = new ApiService();
