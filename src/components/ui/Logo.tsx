import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Theme } from '../../contexts/ThemeContext';
import Typography from './Typography';

export interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'horizontal' | 'vertical' | 'icon-only' | 'text-only';
  color?: 'light' | 'dark' | 'primary';
  style?: ViewStyle;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  variant = 'horizontal',
  color = 'light',
  style,
}) => {
  const styles = useThemedStyles(createStyles);

  const containerStyle = [
    styles.container,
    styles[variant as keyof typeof styles],
    style,
  ];

  const iconContainerStyle = [
    styles.iconContainer,
    styles[`${size}IconContainer` as keyof typeof styles],
  ];

  const iconWrapperStyle = [
    styles.iconWrapper,
    styles[`${size}IconWrapper` as keyof typeof styles],
  ];

  const getIconColor = () => {
    switch (color) {
      case 'light':
        return '#FFFFFF';
      case 'dark':
        return '#021639';
      case 'primary':
        return '#0088E7';
      default:
        return '#FFFFFF';
    }
  };

  const getTextColor = () => {
    switch (color) {
      case 'light':
        return '#FFFFFF';
      case 'dark':
        return '#021639';
      case 'primary':
        return '#0088E7';
      default:
        return '#FFFFFF';
    }
  };

  const renderIcon = () => (
    <View style={iconContainerStyle}>
      <View style={iconWrapperStyle}>
        <Typography
          variant={size === 'small' ? 'body1' : size === 'medium' ? 'h3' : 'h2'}
          weight="bold"
          color={color === 'light' ? '#0088E7' : '#FFFFFF'}
        >
          V
        </Typography>
      </View>
    </View>
  );

  const renderText = () => (
    <Typography
      variant={size === 'small' ? 'h4' : size === 'medium' ? 'h1' : 'h1'}
      weight="normal"
      color={getTextColor()}
      style={{
        ...(styles.logoText as object),
        ...(styles[`${size}Text` as keyof typeof styles] as object),
        textShadowColor:
          color === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      }}
    >
      vyzor
    </Typography>
  );

  return (
    <View style={containerStyle}>
      {(variant === 'horizontal' ||
        variant === 'vertical' ||
        variant === 'icon-only') &&
        renderIcon()}
      {(variant === 'horizontal' ||
        variant === 'vertical' ||
        variant === 'text-only') &&
        renderText()}
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Variants
    horizontal: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    vertical: {
      flexDirection: 'column',
    },
    'icon-only': {
      flexDirection: 'row',
    },
    'text-only': {
      flexDirection: 'row',
    },
    // Icon containers (matching login screen)
    iconContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrapper: {
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Sizes
    smallIconContainer: {
      width: 40,
      height: 40,
      marginRight: 8,
    },
    smallIconWrapper: {
      width: 28,
      height: 28,
    },
    mediumIconContainer: {
      width: 60, // Match login screen
      height: 60,
      marginRight: 16,
    },
    mediumIconWrapper: {
      width: 40, // Match login screen
      height: 40,
    },
    largeIconContainer: {
      width: 80,
      height: 80,
      marginRight: 20,
    },
    largeIconWrapper: {
      width: 56,
      height: 56,
    },
    // Text styles
    logoText: {
      letterSpacing: 2, // Match login screen
    },
    smallText: {
      fontSize: 20,
    },
    mediumText: {
      fontSize: 48, // Match login screen
    },
    largeText: {
      fontSize: 64,
    },
  });

export default Logo;
