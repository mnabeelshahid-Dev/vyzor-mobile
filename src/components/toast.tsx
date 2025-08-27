import React from 'react';
import { View, StyleSheet } from 'react-native';
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
  BaseToastProps,
} from 'react-native-toast-message';
import { useTheme } from '../contexts/ThemeContext';

// Type definitions for toast props
interface ToastComponentProps extends BaseToastProps {
  text1?: string;
  text2?: string;
}

// Use the same interface for ErrorToast as it extends BaseToast
interface ErrorToastComponentProps extends BaseToastProps {
  text1?: string;
  text2?: string;
}

// Custom themed toast components with proper typing
const ThemedSuccessToast = React.memo<ToastComponentProps>(props => {
  const { theme } = useTheme();

  return (
    <View
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={
        props.text1 ? `Success: ${props.text1}` : 'Success notification'
      }
    >
      <BaseToast
        {...props}
        style={[
          styles.toastContainer,
          { backgroundColor: theme.colors.success },
        ]}
        contentContainerStyle={styles.contentContainer}
        text1Style={styles.text1}
        text2Style={styles.text2}
      />
    </View>
  );
});

const ThemedErrorToast = React.memo<ErrorToastComponentProps>(props => {
  const { theme } = useTheme();

  return (
    <View
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={
        props.text1 ? `Error: ${props.text1}` : 'Error notification'
      }
    >
      <ErrorToast
        {...props}
        style={[styles.toastContainer, { backgroundColor: theme.colors.error }]}
        text1Style={styles.text1}
        text2Style={styles.text2}
      />
    </View>
  );
});

const ThemedInfoToast = React.memo<ToastComponentProps>(props => {
  const { theme } = useTheme();

  return (
    <View
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={
        props.text1 ? `Info: ${props.text1}` : 'Info notification'
      }
    >
      <BaseToast
        {...props}
        style={[styles.toastContainer, { backgroundColor: theme.colors.info }]}
        contentContainerStyle={styles.contentContainer}
        text1Style={styles.text1}
        text2Style={styles.text2}
      />
    </View>
  );
});

// Add display names for better debugging
ThemedSuccessToast.displayName = 'ThemedSuccessToast';
ThemedErrorToast.displayName = 'ThemedErrorToast';
ThemedInfoToast.displayName = 'ThemedInfoToast';

// Toast configuration with themed components
export const getToastConfig = (): ToastConfig => ({
  success: props => <ThemedSuccessToast {...props} />,
  error: props => <ThemedErrorToast {...props} />,
  info: props => <ThemedInfoToast {...props} />,
});

// Type definitions for toast parameters
/**
 * Enhanced toast functions with better error categorization
 */

// Error message mappings for better user experience
const ERROR_MESSAGES = {
  NETWORK: {
    title: 'Connection Error',
    message: 'Please check your internet connection and try again',
  },
  UNAUTHORIZED: {
    title: 'Authentication Failed',
    message: 'Invalid email or password. Please try again',
  },
  FORBIDDEN: {
    title: 'Access Denied',
    message: "You don't have permission to access this resource",
  },
  NOT_FOUND: {
    title: 'Not Found',
    message: 'The requested resource was not found',
  },
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later',
  },
  VALIDATION: {
    title: 'Invalid Input',
    message: 'Please check your input and try again',
  },
  TIMEOUT: {
    title: 'Request Timeout',
    message: 'The request took too long. Please try again',
  },
  GENERAL: {
    title: 'Error',
    message: 'Something went wrong. Please try again',
  },
};

// Success message mappings
const SUCCESS_MESSAGES = {
  LOGIN: {
    title: 'Welcome Back!',
    message: 'You have been successfully logged in',
  },
  REGISTER: {
    title: 'Account Created!',
    message: 'Welcome to Vyzor! Your account has been created',
  },
  LOGOUT: {
    title: 'See You Soon!',
    message: 'You have been successfully logged out',
  },
  PASSWORD_RESET: {
    title: 'Reset Email Sent',
    message: 'Check your email for password reset instructions',
  },
  PROFILE_UPDATE: {
    title: 'Profile Updated',
    message: 'Your profile has been successfully updated',
  },
  GENERAL: {
    title: 'Success',
    message: 'Operation completed successfully',
  },
};

type ErrorType = keyof typeof ERROR_MESSAGES;
type SuccessType = keyof typeof SUCCESS_MESSAGES;

/**
 * Shows a categorized error toast with appropriate messaging
 */
export const showErrorToast = (
  type: ErrorType | string = 'GENERAL',
  customMessage?: string,
  details?: string
): void => {
  const errorType = type.toUpperCase() as ErrorType;
  const errorConfig = ERROR_MESSAGES[errorType] || ERROR_MESSAGES.GENERAL;

  Toast.show({
    type: 'error',
    text1: errorConfig.title,
    text2: customMessage || details || errorConfig.message,
    visibilityTime: 5000,
    autoHide: true,
  });
};

/**
 * Shows a categorized success toast with appropriate messaging
 */
export const showSuccessToast = (
  type: SuccessType | string = 'GENERAL',
  customMessage?: string,
  details?: string
): void => {
  const successType = type.toUpperCase() as SuccessType;
  const successConfig =
    SUCCESS_MESSAGES[successType] || SUCCESS_MESSAGES.GENERAL;

  Toast.show({
    type: 'success',
    text1: successConfig.title,
    text2: customMessage || details || successConfig.message,
    visibilityTime: 3000,
    autoHide: true,
  });
};

/**
 * Shows an info toast notification
 */
export const showInfoToast = (title: string, message?: string): void => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    visibilityTime: 4000,
    autoHide: true,
  });
};

/**
 * Shows a warning toast notification
 */
export const showWarningToast = (title: string, message?: string): void => {
  Toast.show({
    type: 'info', // Using info type for warnings
    text1: title,
    text2: message,
    visibilityTime: 4000,
    autoHide: true,
  });
};

/**
 * Auto-categorizes error based on HTTP status or error type
 */
export const showApiErrorToast = (error: any, customMessage?: string): void => {
  let errorType: ErrorType = 'GENERAL';

  if (error?.status || error?.response?.status) {
    const status = error.status || error.response.status;
    switch (status) {
      case 401:
        errorType = 'UNAUTHORIZED';
        break;
      case 403:
        errorType = 'FORBIDDEN';
        break;
      case 404:
        errorType = 'NOT_FOUND';
        break;
      case 408:
        errorType = 'TIMEOUT';
        break;
      case 422:
        errorType = 'VALIDATION';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorType = 'SERVER_ERROR';
        break;
      default:
        errorType = 'GENERAL';
    }
  } else if (error?.message) {
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('connection')) {
      errorType = 'NETWORK';
    } else if (message.includes('timeout')) {
      errorType = 'TIMEOUT';
    } else if (
      message.includes('unauthorized') ||
      message.includes('invalid credentials')
    ) {
      errorType = 'UNAUTHORIZED';
    }
  }

  showErrorToast(errorType, customMessage, error?.message);
};

/**
 * Hides any currently visible toast
 */
export const hideToast = (): void => {
  Toast.hide();
};

const styles = StyleSheet.create({
  toastContainer: {
    borderLeftWidth: 0,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  text1: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  text2: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
  },
});

export default Toast;
