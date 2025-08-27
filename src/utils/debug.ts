/**
 * Debug utilities for development environment
 * Provides consistent logging and debugging helpers
 * @fileoverview Enterprise-grade debugging utilities with proper TypeScript interfaces
 */

/**
 * Feature flags interface for debug configuration
 */
interface IFeatureFlags {
  readonly DEBUG_API_LOGS: boolean;
  readonly DEBUG_REDUX_LOGS: boolean;
}

/**
 * Debug configuration flags
 */
const FEATURE_FLAGS: IFeatureFlags = {
  DEBUG_API_LOGS: true,
  DEBUG_REDUX_LOGS: true,
} as const;

/**
 * User interface for authentication logging
 */
interface IAuthUser {
  readonly id?: string;
  readonly email?: string;
}

/**
 * Error object interface with stack trace
 */
interface IErrorWithStack {
  readonly stack?: string;
  readonly message?: string;
  readonly name?: string;
}

/**
 * Enterprise debug console with structured logging
 * Provides type-safe debugging methods for development environment
 */
export class DebugConsole {
  /**
   * General debug logging with optional context data
   * @param message - Debug message to log
   * @param data - Optional context data to include
   */
  static log(message: string, data?: unknown): void {
    if (__DEV__ && FEATURE_FLAGS.DEBUG_REDUX_LOGS) {
      console.log(`🔍 [DEBUG] ${message}`, data ?? '');
    }
  }

  /**
   * Error logging with comprehensive stack trace handling
   * @param context - Context where error occurred (e.g., 'StorageService', 'AuthStore')
   * @param message - Error message to log
   * @param error - Error object or unknown error data
   */
  static error(context: string, message: string, error?: unknown): void {
    if (__DEV__) {
      console.error(`❌ [ERROR] ${context}: ${message}`, error ?? '');

      const errorObj = error as IErrorWithStack;
      if (errorObj?.stack) {
        console.error('Stack trace:', errorObj.stack);
      }

      // Log additional error properties if available
      if (errorObj?.name && errorObj?.message) {
        console.error(`Error details: ${errorObj.name} - ${errorObj.message}`);
      }
    }
  }

  /**
   * HTTP API request/response logging with structured data
   * @param method - HTTP method (GET, POST, etc.)
   * @param url - Request URL
   * @param data - Request payload data
   * @param response - Response data
   */
  static api(
    method: string,
    url: string,
    data?: unknown,
    response?: unknown
  ): void {
    if (__DEV__ && FEATURE_FLAGS.DEBUG_API_LOGS) {
      console.group(`🌐 [API] ${method.toUpperCase()} ${url}`);
      if (data !== undefined) {
        console.log('Request:', data);
      }
      if (response !== undefined) {
        console.log('Response:', response);
      }
      console.groupEnd();
    }
  }

  /**
   * Navigation action logging for React Navigation
   * @param action - Navigation action (navigate, goBack, etc.)
   * @param screen - Target screen name
   * @param params - Navigation parameters
   */
  static navigation(action: string, screen: string, params?: unknown): void {
    if (__DEV__) {
      console.log(`🧭 [NAV] ${action} → ${screen}`, params ?? '');
    }
  }

  /**
   * State management logging for stores/reducers
   * @param storeName - Name of the store or reducer
   * @param action - Action being performed
   * @param payload - Action payload data
   */
  static state(storeName: string, action: string, payload?: unknown): void {
    if (__DEV__ && FEATURE_FLAGS.DEBUG_REDUX_LOGS) {
      console.group(`🏪 [STATE] ${storeName}`);
      console.log('Action:', action);
      if (payload !== undefined) {
        console.log('Payload:', payload);
      }
      console.groupEnd();
    }
  }

  /**
   * Performance timing utilities for measuring execution time
   * @param label - Unique label for the timing measurement
   */
  static time(label: string): void {
    if (__DEV__) {
      console.time(`⏱️ [PERF] ${label}`);
    }
  }

  /**
   * End performance timing measurement
   * @param label - Label that matches the corresponding time() call
   */
  static timeEnd(label: string): void {
    if (__DEV__) {
      console.timeEnd(`⏱️ [PERF] ${label}`);
    }
  }

  /**
   * React component lifecycle logging
   * @param name - Component name
   * @param lifecycle - Lifecycle method or event
   * @param props - Component props (sanitized for logging)
   */
  static component(name: string, lifecycle: string, props?: unknown): void {
    if (__DEV__) {
      console.log(`⚛️ [COMPONENT] ${name} → ${lifecycle}`, props ?? '');
    }
  }

  /**
   * Authentication flow logging with user data sanitization
   * @param action - Authentication action (login, logout, register, etc.)
   * @param user - User data (only id and email are logged for privacy)
   */
  static auth(action: string, user?: IAuthUser): void {
    if (__DEV__) {
      const sanitizedUser = user
        ? { id: user.id, email: user.email }
        : undefined;
      console.log(`🔐 [AUTH] ${action}`, sanitizedUser ?? '');
    }
  }

  /**
   * Theme system logging
   * @param newTheme - New theme name being applied
   */
  static theme(newTheme: string): void {
    if (__DEV__) {
      console.log(`🎨 [THEME] Changed to ${newTheme}`);
    }
  }

  /**
   * Warning message logging
   * @param message - Warning message
   * @param data - Optional context data
   */
  static warn(message: string, data?: unknown): void {
    if (__DEV__) {
      console.warn(`⚠️ [WARN] ${message}`, data ?? '');
    }
  }

  /**
   * Success message logging
   * @param message - Success message
   * @param data - Optional context data
   */
  static success(message: string, data?: unknown): void {
    if (__DEV__) {
      console.log(`✅ [SUCCESS] ${message}`, data ?? '');
    }
  }
}

/**
 * Network debugging helper with comprehensive request/response logging
 * Automatically logs fetch requests when debugging is enabled
 * @param url - Request URL
 * @param options - Fetch request options
 * @param response - Fetch response object
 */
export const debugNetworkRequest = (
  url: string,
  options?: RequestInit,
  response?: Response
): void => {
  if (__DEV__ && FEATURE_FLAGS.DEBUG_API_LOGS) {
    console.group(`🌐 [NETWORK] ${options?.method ?? 'GET'} ${url}`);

    // Log request headers if present
    if (options?.headers) {
      console.log('Headers:', options.headers);
    }

    // Log request body with proper JSON parsing
    if (options?.body) {
      try {
        const body =
          typeof options.body === 'string'
            ? JSON.parse(options.body)
            : options.body;
        console.log('Request Body:', body);
      } catch {
        // Log original body if JSON parsing fails
        console.log('Request Body:', options.body);
      }
    }

    // Log response details if available
    if (response) {
      console.log('Status:', response.status, response.statusText);
      console.log(
        'Response Headers:',
        Object.fromEntries(response.headers.entries())
      );
    }

    console.groupEnd();
  }
};

/**
 * Global interface for window object with Redux DevTools Extension
 */
declare global {
  interface Window {
    readonly __REDUX_DEVTOOLS_EXTENSION__?: {
      connect(options: {
        readonly name: string;
        readonly trace: boolean;
        readonly traceLimit: number;
      }): unknown;
    };
  }
}

/**
 * Global interface for debugging hooks
 */
interface IGlobalWithDebugHooks {
  readonly nativeCallSyncHook?: unknown;
  readonly __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown;
}

/**
 * Redux DevTools connection helper with proper typing
 * @returns Redux DevTools connection or null if not available
 */
export const connectReduxDevTools = (): unknown | null => {
  if (__DEV__ && typeof window !== 'undefined') {
    return (
      window.__REDUX_DEVTOOLS_EXTENSION__?.connect({
        name: 'Vyzor App State',
        trace: true,
        traceLimit: 25,
      }) ?? null
    );
  }
  return null;
};

/**
 * React Native Debugger connection status checker
 * @returns true if debugger is connected, false otherwise
 */
export const isDebuggerConnected = (): boolean => {
  if (__DEV__) {
    try {
      const global = globalThis as unknown as IGlobalWithDebugHooks;
      // Check if remote debugger is connected
      return !!(
        global.nativeCallSyncHook || global.__REACT_DEVTOOLS_GLOBAL_HOOK__
      );
    } catch (error) {
      // If checking fails, assume not connected
      DebugConsole.warn('Failed to check debugger connection status', error);
      return false;
    }
  }
  return false;
};

/**
 * Log current debugger connection status with helpful instructions
 */
export const logDebuggerStatus = (): void => {
  if (__DEV__) {
    const connected = isDebuggerConnected();
    console.log(
      `🐛 [DEBUGGER] React Native Debugger: ${
        connected ? '✅ Connected' : '❌ Not Connected'
      }`
    );

    if (!connected) {
      console.log(
        '💡 To connect: Open React Native Debugger app and enable debugging in your app'
      );
    }
  }
};

export default DebugConsole;
