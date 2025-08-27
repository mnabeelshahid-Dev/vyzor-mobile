import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Theme } from '../../contexts/ThemeContext';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  variant?: 'default' | 'filled' | 'outline';
  size?: 'small' | 'medium' | 'large';
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'default',
  size = 'medium',
  containerStyle,
  inputStyle,
  required = false,
  ...textInputProps
}) => {
  const styles = useThemedStyles(createStyles);

  const hasError = !!error;
  const hasLeftIcon = !!leftIcon;
  const hasRightIcon = !!rightIcon;

  const inputContainerStyle = [
    styles.inputContainer,
    styles[variant as keyof typeof styles],
    styles[size as keyof typeof styles],
    hasError && styles.errorContainer,
    containerStyle,
  ];

  const textInputStyle = [
    styles.input,
    styles[`${size}Input`],
    hasLeftIcon && styles.inputWithLeftIcon,
    hasRightIcon && styles.inputWithRightIcon,
    inputStyle,
  ];

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={inputContainerStyle}>
        {hasLeftIcon && (
          <View style={styles.leftIconContainer}>{leftIcon}</View>
        )}

        <TextInput
          style={textInputStyle}
          placeholderTextColor="#9E9E9E" // Match login screen
          {...textInputProps}
        />

        {hasRightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {hint && !error && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
};

Input.displayName = 'Input';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: 20, // Match login screen spacing
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 8,
    },
    required: {
      color: theme.colors.error,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: theme.borderRadius.lg, // Match login screen (12px)
      borderWidth: 1,
      borderColor: '#E8E8E8', // Match login screen
    },
    // Variants
    default: {
      backgroundColor: '#F8F9FA', // Match login screen
      paddingHorizontal: 6, // Match login screen
    },
    filled: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
      paddingHorizontal: 16,
    },
    // Sizes
    small: {
      minHeight: 40,
    },
    medium: {
      minHeight: 52, // Match login screen height
    },
    large: {
      minHeight: 56,
    },
    errorContainer: {
      borderColor: theme.colors.error,
    },
    // Icon containers - matching login screen style
    leftIconContainer: {
      width: 48, // Match login screen
      height: 52, // Match login screen
      backgroundColor: '#0088E7', // Match login screen
      borderRadius: 8, // Match login screen
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16, // Match login screen
    },
    rightIconContainer: {
      paddingHorizontal: 12,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Input styles
    input: {
      flex: 1,
      fontSize: 16, // Match login screen
      color: '#333333', // Match login screen
      paddingVertical: 16, // Match login screen
    },
    smallInput: {
      fontSize: 14,
      paddingVertical: 10,
    },
    mediumInput: {
      fontSize: 16,
      paddingVertical: 16,
    },
    largeInput: {
      fontSize: 18,
      paddingVertical: 18,
    },
    inputWithLeftIcon: {
      paddingLeft: 0,
    },
    inputWithRightIcon: {
      paddingRight: 0,
    },
    // Helper texts
    errorText: {
      fontSize: 12,
      color: theme.colors.error,
      marginTop: 4,
    },
    hintText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
  });

export default Input;
