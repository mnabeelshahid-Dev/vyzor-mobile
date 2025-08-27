import { QueryClient } from '@tanstack/react-query';

// Simple API config
const API_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  RETRY_ATTEMPTS: 3, // Number of retry attempts
} as const;

// Create a query client with default configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default stale time (5 minutes)
      staleTime: API_CONFIG.STALE_TIME,

      // Default cache time (10 minutes)
      gcTime: API_CONFIG.CACHE_TIME,

      // Retry configuration
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors except 401 (unauthorized)
        const httpError = error as { status?: number };
        if (
          httpError?.status &&
          httpError.status >= 400 &&
          httpError.status < 500 &&
          httpError.status !== 401
        ) {
          return false;
        }

        // Retry up to 3 times for other errors
        return failureCount < API_CONFIG.RETRY_ATTEMPTS;
      },

      // Retry delay
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus in development
      refetchOnWindowFocus: __DEV__,

      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,

      // Retry delay for mutations
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Query keys for better organization
export const queryKeys = {
  // Auth queries
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
  },

  // User queries
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // Posts queries (example)
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.posts.lists(), { filters }] as const,
    details: () => [...queryKeys.posts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.posts.details(), id] as const,
  },
} as const;
