import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Theme } from '../../contexts/ThemeContext';

export interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  style,
  onPress,
  ...touchableProps
}) => {
  const styles = useThemedStyles(createStyles);

  const cardStyle = [
    styles.card,
    styles[variant as keyof typeof styles],
    styles[`${padding}Padding` as keyof typeof styles],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
        {...touchableProps}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: '#FFFFFF', // Match login card
      borderRadius: 30, // Match login card top radius
      borderWidth: 1,
      borderColor: 'transparent',
    },
    // Variants
    default: {
      backgroundColor: '#FFFFFF',
    },
    elevated: {
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
    },
    filled: {
      backgroundColor: theme.colors.surface,
    },
    // Padding variants
    nonePadding: {
      padding: 0,
    },
    smallPadding: {
      padding: theme.spacing.md,
    },
    mediumPadding: {
      padding: 30, // Match login card
    },
    largePadding: {
      padding: theme.spacing.xl,
    },
  });

export default Card;
