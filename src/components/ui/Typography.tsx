import React from 'react';
import { Text, StyleSheet, TextStyle, TextProps } from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Theme } from '../../contexts/ThemeContext';

export interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption' | 'label';
  color?:
    | 'primary'
    | 'secondary'
    | 'text'
    | 'textSecondary'
    | 'error'
    | 'success'
    | 'warning'
    | string;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
  style?: TextStyle;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  color = 'text',
  weight,
  align,
  children,
  style,
  ...textProps
}) => {
  const styles = useThemedStyles(createStyles);

  const textStyle = [
    styles.base,
    styles[variant as keyof typeof styles],
    weight && styles[weight as keyof typeof styles],
    align && { textAlign: align },
    style,
  ];

  // Handle color prop
  const getColor = () => {
    switch (color) {
      case 'primary':
        return '#0088E7'; // Match brand color
      case 'secondary':
        return '#666666';
      case 'text':
        return '#333333'; // Match login screen text
      case 'textSecondary':
        return '#666666'; // Match login screen secondary text
      case 'error':
        return '#FF3B30';
      case 'success':
        return '#34C759';
      case 'warning':
        return '#FF9500';
      default:
        return color;
    }
  };

  return (
    <Text style={[textStyle, { color: getColor() }]} {...textProps}>
      {children}
    </Text>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      includeFontPadding: false,
    },
    // Typography variants
    h1: {
      fontSize: 48, // Match login logo text
      fontWeight: '300',
      letterSpacing: 2,
    },
    h2: {
      fontSize: 32,
      fontWeight: '600',
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
    },
    h4: {
      fontSize: 20, // Match login card title
      fontWeight: '600',
    },
    body1: {
      fontSize: 16, // Match login screen body text
      fontWeight: '400',
    },
    body2: {
      fontSize: 14,
      fontWeight: '400',
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
    },
    // Font weights
    normal: {
      fontWeight: '400',
    },
    medium: {
      fontWeight: '500',
    },
    semibold: {
      fontWeight: '600',
    },
    bold: {
      fontWeight: 'bold',
    },
  });

export default Typography;
