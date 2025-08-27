// Configuration constants with type-safe environment variable access

// Type definition for global environment variables
interface GlobalEnvironment {
  __API_BASE_URL__?: string;
  __API_TIMEOUT__?: number;
  __API_RETRY_ATTEMPTS__?: number;
  __API_RETRY_DELAY__?: number;
  __ENABLE_ANALYTICS__?: boolean;
  __ENABLE_CRASH_REPORTING__?: boolean;
}

// Type-safe global accessor
const getGlobalEnv = (): GlobalEnvironment =>
  globalThis as unknown as GlobalEnvironment;

// API Configuration
export const API_CONFIG = {
  BASE_URL:
    getGlobalEnv().__API_BASE_URL__ || 'https://jsonplaceholder.typicode.com',
  TIMEOUT: getGlobalEnv().__API_TIMEOUT__ || 10000,
  RETRY_ATTEMPTS: getGlobalEnv().__API_RETRY_ATTEMPTS__ || 3,
  RETRY_DELAY: getGlobalEnv().__API_RETRY_DELAY__ || 1000,
} as const;

// Auth Configuration
export const AUTH_CONFIG = {
  ACCESS_TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'user_data',
  BIOMETRIC_KEY: 'biometric_enabled',
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  THEME_MODE: 'theme_mode',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  LANGUAGE: 'app_language',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  ANALYTICS_CONSENT: 'analytics_consent',
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'Vyzor',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  SUPPORT_EMAIL: 'support@vyzor.com',
  PRIVACY_POLICY_URL: 'https://vyzor.com/privacy',
  TERMS_OF_SERVICE_URL: 'https://vyzor.com/terms',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: getGlobalEnv().__ENABLE_ANALYTICS__ || false,
  ENABLE_CRASH_REPORTING: getGlobalEnv().__ENABLE_CRASH_REPORTING__ || false,
  ENABLE_BIOMETRIC_AUTH: true,
  DEBUG_API_LOGS: __DEV__,
  DEBUG_REDUX_LOGS: __DEV__,
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 254,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR:
    'Network connection failed. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  BIOMETRIC_NOT_AVAILABLE:
    'Biometric authentication is not available on this device.',
  BIOMETRIC_PERMISSION_DENIED:
    'Biometric authentication permission was denied.',
} as const;
