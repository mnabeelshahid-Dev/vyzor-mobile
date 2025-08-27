import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  style?: any;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'small',
  color,
  style,
}) => {
  const { theme } = useTheme();
  const spinnerColor = color || theme.colors.primary;

  return <ActivityIndicator size={size} color={spinnerColor} style={style} />;
};

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  transparent = false,
}) => {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <View
      style={[
        styles.overlay,
        {
          backgroundColor: transparent
            ? 'transparent'
            : `${theme.colors.background}CC`,
        },
      ]}
    >
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <LoadingSpinner size="large" />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          {message}
        </Text>
      </View>
    </View>
  );
};

interface LoadingButtonProps {
  loading: boolean;
  onPress: () => void;
  title: string;
  loadingTitle?: string;
  style?: any;
  textStyle?: any;
  disabled?: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  onPress,
  title,
  loadingTitle = 'Loading...',
  style,
  textStyle,
  disabled = false,
}) => {
  const { theme } = useTheme();

  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isDisabled
            ? theme.colors.border
            : theme.colors.primary,
        },
        style,
      ]}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
    >
      <View style={styles.buttonContent}>
        {loading && (
          <LoadingSpinner
            size="small"
            color="#FFFFFF"
            style={styles.buttonSpinner}
          />
        )}
        <Text
          style={[
            styles.buttonText,
            {
              color: '#FFFFFF',
              marginLeft: loading ? 8 : 0,
            },
            textStyle,
          ]}
        >
          {loading ? loadingTitle : title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

interface InlineLoadingProps {
  loading: boolean;
  message?: string;
  size?: 'small' | 'large';
}

const InlineLoading: React.FC<InlineLoadingProps> = ({
  loading,
  message = 'Loading...',
  size = 'small',
}) => {
  const { theme } = useTheme();

  if (!loading) return null;

  return (
    <View style={styles.inlineContainer}>
      <LoadingSpinner size={size} />
      {message && (
        <Text style={[styles.inlineText, { color: theme.colors.text }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSpinner: {
    marginRight: 8,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  inlineText: {
    marginLeft: 8,
    fontSize: 14,
  },
});

export { LoadingSpinner, LoadingOverlay, LoadingButton, InlineLoading };
