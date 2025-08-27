import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Theme } from '../../contexts/ThemeContext';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const styles = useThemedStyles(createStyles);

  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    (disabled || loading) && styles.disabledText,
    textStyle,
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : '#0088E7'}
        />
      );
    }

    if (icon) {
      return (
        <>
          {iconPosition === 'left' && icon}
          <Text style={textStyleCombined}>{title}</Text>
          {iconPosition === 'right' && icon}
        </>
      );
    }

    return <Text style={textStyleCombined}>{title}</Text>;
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    // Variants
    primary: {
      backgroundColor: '#0088E7', // Match login screen
      shadowColor: '#0088E7',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: '#0088E7',
      borderWidth: 2,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    danger: {
      backgroundColor: theme.colors.error,
      shadowColor: theme.colors.error,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    // Sizes
    small: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      gap: 6,
    },
    medium: {
      paddingVertical: 18, // Match login button
      paddingHorizontal: 24,
      gap: 8,
    },
    large: {
      paddingVertical: 20,
      paddingHorizontal: 32,
      gap: 10,
    },
    fullWidth: {
      width: '100%',
    },
    disabled: {
      opacity: 0.6,
    },
    // Text styles
    text: {
      fontWeight: '600',
      textAlign: 'center',
    },
    primaryText: {
      color: '#FFFFFF',
      fontSize: 16, // Match login screen
    },
    secondaryText: {
      color: theme.colors.text,
      fontSize: 16,
    },
    outlineText: {
      color: '#0088E7',
      fontSize: 16,
    },
    ghostText: {
      color: '#0088E7',
      fontSize: 16,
    },
    dangerText: {
      color: '#FFFFFF',
      fontSize: 16,
    },
    smallText: {
      fontSize: 14,
    },
    mediumText: {
      fontSize: 16,
    },
    largeText: {
      fontSize: 18,
    },
    disabledText: {
      opacity: 0.7,
    },
  });

export default Button;
