import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

// Enhanced Button component
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
}) => {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          color: '#FFFFFF',
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.surface,
          color: theme.colors.text,
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.error,
          color: '#FFFFFF',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary,
          color: theme.colors.primary,
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          color: '#FFFFFF',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: 14,
        };
      case 'medium':
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
          fontSize: 16,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          fontSize: 18,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
          fontSize: 16,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const dynamicStyle = {
    backgroundColor: variantStyles.backgroundColor,
    borderWidth: variantStyles.borderWidth || 0,
    borderColor: variantStyles.borderColor,
    paddingVertical: sizeStyles.paddingVertical,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <TouchableOpacity
      style={[styles.button, dynamicStyle]}
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
    >
      <Text
        style={[
          styles.text,
          {
            color: variantStyles.color,
            fontSize: sizeStyles.fontSize,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Button;
export { Button };
export type { ButtonProps };
